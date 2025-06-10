
import { mockProperties, mockRentals, mockPayments, mockStats, mockActivities } from './mock-data';

// Mock Frappe API client for development
class MockFrappeAPIClient {
  // Simulate async operations with delays
  private delay(ms: number = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Mock authentication methods
  isAuthenticated(): boolean {
    return !!localStorage.getItem('mock_user');
  }

  async logout(): Promise<void> {
    await this.delay(300);
    localStorage.removeItem('mock_user');
  }

  // Mock API request methods
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

  // Mock user and session methods
  async getCurrentUser(): Promise<any> {
    await this.delay();
    const user = localStorage.getItem('mock_user');
    if (user) {
      return { data: JSON.parse(user) };
    }
    throw new Error('User not authenticated');
  }

  // Mock dashboard stats
  async getDashboardStats(): Promise<any> {
    await this.delay();
    return { data: mockStats };
  }

  // Mock recent activities
  async getRecentActivities(): Promise<any> {
    await this.delay();
    return { data: mockActivities };
  }
}

export const apiClient = new MockFrappeAPIClient();
