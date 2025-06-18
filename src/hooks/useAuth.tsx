// src/hooks/useAuth.tsx
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { exchangeCodeForToken, fetchUserProfile, getAuthorizeUrl } from '@/Integration/frappe/client';
import { toast } from '@/components/ui/sonner';
import { apiClient } from '@/lib/api-client';

interface AuthContextType {
  user: any;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  handleAuthCallback: (code: string, state: string) => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refetchUser = async () => {
    if (!accessToken) return;
    
    try {
      const profile = await fetchUserProfile(accessToken);
      setUser(profile);
      localStorage.setItem('user', JSON.stringify(profile));
    } catch (error) {
      console.error('Error refetching user:', error);
    }
  };

  useEffect(() => {
    // Check for existing session on mount
    const storedToken = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setAccessToken(storedToken);
      setUser(JSON.parse(storedUser));
      
      // Also set the token in the API client
      apiClient.setAccessToken(storedToken);
    }
    
    setIsLoading(false);
  }, []);

  const login = () => {
    const state = Math.random().toString(36).substring(2);
    localStorage.setItem('oauth_state', state);
    window.location.href = getAuthorizeUrl(state);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('oauth_state');
    setAccessToken(null);
    setUser(null);
    apiClient.logout();
    window.location.href = '/login';
  };

  const handleAuthCallback = async (code: string, state: string) => {
    const storedState = localStorage.getItem('oauth_state');
    if (state !== storedState) {
      throw new Error('State mismatch');
    }

    try {
      interface TokenResponse {
        access_token: string;
        refresh_token: string;
        expires_in: number;
        token_type: string;
        scope: string;
      }
      
      const tokenData = await exchangeCodeForToken(code) as TokenResponse;
      const profile = await fetchUserProfile(tokenData.access_token);
      
      setAccessToken(tokenData.access_token);
      setUser(profile);

      // Store token in localStorage
      localStorage.setItem('access_token', tokenData.access_token);
      localStorage.setItem('refresh_token', tokenData.refresh_token);
      localStorage.setItem('user', JSON.stringify(profile));
      
      // Also set the token in the API client
      apiClient.setAccessToken(tokenData.access_token);
      
      console.log('Authentication successful, token stored');
    } catch (error) {
      console.error('Authentication error:', error);
      toast("Authentication failed", {
        description: "Could not complete the login process",
        style: { backgroundColor: 'hsl(var(--destructive))', color: 'hsl(var(--destructive-foreground))' }
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!accessToken,
        isLoading,
        login,
        logout,
        handleAuthCallback,
        refetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
