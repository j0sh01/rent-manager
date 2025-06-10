// Frappe API client with OAuth2 integration
class FrappeAPIClient {
  private baseURL: string;
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private tokenStorage: Storage;

  constructor() {
    this.baseURL = import.meta.env.VITE_FRAPPE_URL || 'http://localhost:8000';
    this.clientId = import.meta.env.VITE_CLIENT_ID || '';
    this.clientSecret = import.meta.env.VITE_CLIENT_SECRET || '';
    this.redirectUri = import.meta.env.VITE_REDIRECT_URI || `${window.location.origin}/auth/callback`;
    this.tokenStorage = localStorage;
  }

  // OAuth2 Authentication Methods
  getAuthorizationUrl(): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: 'all',
      state: this.generateState()
    });
    
    this.tokenStorage.setItem('oauth_state', params.get('state') || '');
    return `${this.baseURL}/api/method/frappe.integrations.oauth2.authorize?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string, state: string): Promise<any> {
    const savedState = this.tokenStorage.getItem('oauth_state');
    if (state !== savedState) {
      throw new Error('Invalid state parameter');
    }

    const response = await fetch(`${this.baseURL}/api/method/frappe.integrations.oauth2.get_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await response.json();
    this.saveTokens(tokenData);
    return tokenData;
  }

  async refreshAccessToken(): Promise<any> {
    const refreshToken = this.tokenStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${this.baseURL}/api/method/frappe.integrations.oauth2.get_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const tokenData = await response.json();
    this.saveTokens(tokenData);
    return tokenData;
  }

  // API Request Methods
  async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = this.getAccessToken();
    if (!token) {
      throw new Error('No access token available');
    }

    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        // Token might be expired, try to refresh
        await this.refreshAccessToken();
        const newToken = this.getAccessToken();
        
        const retryResponse = await fetch(url, {
          ...options,
          headers: {
            ...headers,
            'Authorization': `Bearer ${newToken}`,
          },
        });

        if (!retryResponse.ok) {
          throw new Error(`API request failed: ${retryResponse.statusText}`);
        }

        return await retryResponse.json();
      }

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Doctype CRUD Operations
  async getDoc(doctype: string, name: string): Promise<any> {
    return this.makeRequest(`/api/resource/${doctype}/${name}`);
  }

  async getDocList(doctype: string, options: any = {}): Promise<any> {
    const params = new URLSearchParams();
    
    if (options.fields) {
      params.append('fields', JSON.stringify(options.fields));
    }
    if (options.filters) {
      params.append('filters', JSON.stringify(options.filters));
    }
    if (options.limit) {
      params.append('limit', options.limit.toString());
    }
    if (options.start) {
      params.append('start', options.start.toString());
    }
    if (options.order_by) {
      params.append('order_by', options.order_by);
    }

    const queryString = params.toString();
    const endpoint = `/api/resource/${doctype}${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest(endpoint);
  }

  async createDoc(doctype: string, data: any): Promise<any> {
    return this.makeRequest(`/api/resource/${doctype}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDoc(doctype: string, name: string, data: any): Promise<any> {
    return this.makeRequest(`/api/resource/${doctype}/${name}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteDoc(doctype: string, name: string): Promise<any> {
    return this.makeRequest(`/api/resource/${doctype}/${name}`, {
      method: 'DELETE',
    });
  }

  // User and Session Management
  async getCurrentUser(): Promise<any> {
    return this.makeRequest('/api/method/frappe.auth.get_logged_user');
  }

  async logout(): Promise<void> {
    try {
      await this.makeRequest('/api/method/frappe.auth.logout', {
        method: 'POST',
      });
    } finally {
      this.clearTokens();
    }
  }

  // Token Management
  private saveTokens(tokenData: any): void {
    this.tokenStorage.setItem('access_token', tokenData.access_token);
    this.tokenStorage.setItem('refresh_token', tokenData.refresh_token);
    this.tokenStorage.setItem('token_expiry', (Date.now() + (tokenData.expires_in * 1000)).toString());
  }

  private getAccessToken(): string | null {
    const token = this.tokenStorage.getItem('access_token');
    const expiry = this.tokenStorage.getItem('token_expiry');
    
    if (!token || !expiry) {
      return null;
    }

    if (Date.now() > parseInt(expiry)) {
      return null; // Token expired
    }

    return token;
  }

  private clearTokens(): void {
    this.tokenStorage.removeItem('access_token');
    this.tokenStorage.removeItem('refresh_token');
    this.tokenStorage.removeItem('token_expiry');
    this.tokenStorage.removeItem('oauth_state');
  }

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

export const apiClient = new FrappeAPIClient();
