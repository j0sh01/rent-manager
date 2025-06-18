import { mockProperties, mockRentals, mockPayments, mockStats, mockActivities } from './mock-data';
import * as frappeClient from '@/Integration/frappe/client';
import { FRAPPE_BASE_URL } from '@/Integration/frappe/client';
import axios from 'axios';

// Real Frappe API client
class FrappeAPIClient {
  private accessToken: string | null = null;

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken || !!localStorage.getItem('accessToken');
  }

  getToken(): string {
    return this.accessToken || localStorage.getItem('accessToken') || '';
  }

  async logout(): Promise<void> {
    this.accessToken = null;
    localStorage.removeItem('accessToken');
  }

  async getDocList(doctype: string, options: any = {}): Promise<any> {
    if (doctype === 'Property') {
      try {
        const properties = await frappeClient.getProperties(this.getToken());
        return { data: properties };
      } catch (error) {
        console.error('Error fetching properties:', error);
        return { data: [] };
      }
    }
    
    if (doctype === 'Rental') {
      try {
        const rentals = await frappeClient.getRentals(this.getToken(), options.filters);
        console.log('📋 Raw rentals response:', rentals);
        // Handle the nested structure: { message: { message: "...", rentals: [...] } }
        const rentalData = rentals.message?.rentals || rentals.rentals || [];
        console.log('📋 Processed rentals data:', rentalData);
        return { data: rentalData };
      } catch (error) {
        console.error('Error fetching rentals:', error);
        return { data: [] };
      }
    }
    
    if (doctype === 'Tenant') {
      try {
        const tenants = await frappeClient.getTenants(this.getToken());
        console.log('📋 Tenants response:', tenants);
        return { data: tenants };
      } catch (error) {
        console.error('Error fetching tenants:', error);
        return { data: [] };
      }
    }
    
    // Fall back to mock data for other doctypes
    return new MockFrappeAPIClient().getDocList(doctype, options);
  }

  // Other methods remain mock implementations for now
  async getDoc(doctype: string, name: string): Promise<any> {
    return new MockFrappeAPIClient().getDoc(doctype, name);
  }

  async createDoc(doctype: string, data: any): Promise<any> {
    if (doctype === 'Tenant') {
      try {
        const result = await frappeClient.createTenant(this.getToken(), data);
        return result;
      } catch (error) {
        console.error('Error creating tenant:', error);
        return { success: false, error: 'Failed to create tenant' };
      }
    }
    
    return new MockFrappeAPIClient().createDoc(doctype, data);
  }

  async updateDoc(doctype: string, name: string, data: any): Promise<any> {
    if (doctype === 'Tenant') {
      try {
        const result = await frappeClient.updateTenant(this.getToken(), { name, ...data });
        return result;
      } catch (error) {
        console.error('Error updating tenant:', error);
        return { success: false, error: 'Failed to update tenant' };
      }
    }
    
    return new MockFrappeAPIClient().updateDoc(doctype, name, data);
  }

  async deleteDoc(doctype: string, name: string): Promise<any> {
    return new MockFrappeAPIClient().deleteDoc(doctype, name);
  }

  async getCurrentUser(): Promise<any> {
    return new MockFrappeAPIClient().getCurrentUser();
  }

  async getDashboardStats(): Promise<any> {
    try {
      const stats = await frappeClient.getDashboardStats(this.getToken());
      return { data: stats };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return { data: new MockFrappeAPIClient().getDashboardStats() };
    }
  }

  async getRecentActivities(): Promise<any> {
    try {
      const activities = await frappeClient.getRecentActivities(this.getToken());
      // Ensure activities is always an array
      const activitiesArray = Array.isArray(activities) ? activities : [];
      return { data: activitiesArray };
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      const mockResult = await new MockFrappeAPIClient().getRecentActivities();
      return { data: mockResult.data || [] };
    }
  }

  async getNotifications(): Promise<any[]> {
    try {
      const notifications = await frappeClient.getNotifications(this.getToken());
      return notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  async markNotificationAsRead(notificationName: string): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await frappeClient.markNotificationAsRead(this.getToken(), notificationName);
      return result;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { success: false, error: 'Failed to mark notification as read' };
    }
  }

  async markAllNotificationsAsRead(): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await frappeClient.markAllNotificationsAsRead(this.getToken());
      return result;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return { success: false, error: 'Failed to mark all notifications as read' };
    }
  }

  async printDoc(doctype: string, name: string, printFormat: string): Promise<any> {
    try {
      console.log(`🖨️ Printing ${doctype} document:`, name, 'with format:', printFormat);
      
      // Use the Frappe print API
      const response = await fetch(`${frappeClient.FRAPPE_BASE_URL}/api/method/frappe.utils.print_format.download_pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
          'Content-Type': 'application/json',
        },
        // Add query parameters
        // Note: We'll construct the URL with query parameters
      });

      // Construct the URL with query parameters
      const url = new URL(`${frappeClient.FRAPPE_BASE_URL}/api/method/frappe.utils.print_format.download_pdf`);
      url.searchParams.append('doctype', doctype);
      url.searchParams.append('name', name);
      url.searchParams.append('format', printFormat);
      url.searchParams.append('no_letterhead', '0');
      url.searchParams.append('letterhead', '');
      url.searchParams.append('language', 'en');

      const printResponse = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
        },
      });

      if (!printResponse.ok) {
        throw new Error(`Print request failed: ${printResponse.status}`);
      }

      // Get the PDF blob
      const pdfBlob = await printResponse.blob();
      
      // Create a blob URL for the PDF
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      return { data: pdfUrl };
    } catch (error) {
      console.error('Error printing document:', error);
      throw error;
    }
  }
}

// Keep the mock client for fallback
class MockFrappeAPIClient {
  private accessToken: string | null = null;

  setAccessToken(token: string) {
    this.accessToken = token;
    // Store in localStorage for persistence
    localStorage.setItem('accessToken', token);
  }

  private delay(ms: number = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('mock_user');
  }

  async logout(): Promise<void> {
    await this.delay(300);
    localStorage.removeItem('mock_user');
  }

  async getDocList(doctype: string, options: any = {}): Promise<any> {
    await this.delay();
    
    switch (doctype) {
      case 'Property':
        return { data: mockProperties };
      case 'Rental':
        return { data: mockRentals };
      case 'Payment':
        // Filter by date if needed
        let payments = mockPayments;
        if (options.filters) {
          // Simple date filtering simulation
          payments = mockPayments.filter(p => p.payment_date >= '2024-06-01' || p.status === 'Pending');
        }
        return { data: payments };
      default:
        return { data: [] };
    }
  }

  async getDoc(doctype: string, name: string): Promise<any> {
    await this.delay();
    
    switch (doctype) {
      case 'Property':
        return { data: mockProperties.find(p => p.name === name) };
      case 'Rental':
        return { data: mockRentals.find(r => r.name === name) };
      case 'Payment':
        return { data: mockPayments.find(p => p.name === name) };
      default:
        throw new Error('Document not found');
    }
  }

  async createDoc(doctype: string, data: any): Promise<any> {
    await this.delay();
    console.log(`Mock: Creating ${doctype}`, data);
    return { data: { name: `${doctype.toUpperCase()}-NEW`, ...data } };
  }

  async updateDoc(doctype: string, name: string, data: any): Promise<any> {
    await this.delay();
    console.log(`Mock: Updating ${doctype} ${name}`, data);
    return { data: { name, ...data } };
  }

  async deleteDoc(doctype: string, name: string): Promise<any> {
    await this.delay();
    console.log(`Mock: Deleting ${doctype} ${name}`);
    return { message: 'Deleted successfully' };
  }

  async getCurrentUser(): Promise<any> {
    await this.delay();
    const user = localStorage.getItem('mock_user');
    if (user) {
      return { data: JSON.parse(user) };
    }
    throw new Error('User not authenticated');
  }

  async getDashboardStats(): Promise<any> {
    await this.delay();
    return { data: mockStats };
  }

  async getRecentActivities(): Promise<any> {
    await this.delay();
    return { data: mockActivities };
  }
}

// Use the real client instead of mock for development
export const apiClient = new FrappeAPIClient();
