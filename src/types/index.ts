// Core type definitions for the rental management system
export interface User {
  email: string;
  full_name: string;
  roles: string[];
  user_image?: string;
}

export interface Property {
  name: string;
  title: string;
  location: string;
  price_tzs: number;
  bedrooms: number;
  bathroom: number;
  status: 'Available' | 'Rented' | 'Under Maintenance';
  description?: string;
  square_meters?: number;
  image?: string;
  image_1?: string;
  image_2?: string;
  image_3?: string;
  image_4?: string;
  creation?: string;
  modified?: string;
}

export interface Rental {
  name: string;
  property: string;
  property_name?: string;
  tenant: string;
  tenant_name?: string;
  start_date: string;
  end_date: string;
  monthly_rent_tzs?: number;
  monthly_rent?: number; // Keep for backward compatibility
  security_deposit?: number;
  deposit?: number;
  total_rent_tzs?: number;
  status: 'Active' | 'Terminated' | 'Pending' | 'Expired';
  lease_terms?: string;
  frequency?: string;
  docstatus?: number;
  creation?: string;
  modified?: string;
  
  // Enhanced data from Frappe API
  property_details?: {
    title: string;
    location: string;
    bedrooms: number;
    bathroom: number;
    square_meters: number;
    image: string;
  };
  
  tenant_details?: {
    full_name: string;
    email: string;
    phone: string;
    user_image: string;
  };
  
  status_context?: string;
}

export interface Tenant {
  name: string;
  full_name: string;
  email: string;
  phone?: string;
  user_image?: string;
  creation?: string;
  modified?: string;
  enabled?: number;
  user_type?: string;
  roles?: string[];
}

export interface Payment {
  name: string;
  rental: string;
  payment_date?: string;
  due_date?: string;
  end_date?: string;
  amount_tzs: number;
  amount?: number; // Keep for backward compatibility
  payment_type?: 'Rent' | 'Security Deposit' | 'Late Fee' | 'Maintenance' | 'Other';
  payment_method?: 'Cash' | 'Check' | 'Bank Transfer' | 'Credit Card' | 'Online Payment' | 'ACH' | '';
  docstatus: number; // 0 = Pending, 1 = Paid
  status?: 'Paid' | 'Pending' | 'Failed' | 'Refunded'; // Derived from docstatus
  reference_number?: string;
  reference?: string;
  creation?: string;
  modified?: string;
}

export interface DashboardStats {
  total_properties: number;
  occupied_properties: number;
  available_properties: number;
  total_rentals: number;
  active_rentals: number;
  monthly_revenue: number;
  pending_payments: number;
  maintenance_requests: number;
}

export interface ActivityItem {
  id: string;
  type: 'payment' | 'rental' | 'property' | 'maintenance';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
}

export interface Notification {
  name: string;
  subject: string;
  email_content: string;
  type: 'Alert' | 'Email' | 'System';
  read: number; // 0 = unread, 1 = read
  creation: string;
  for_user: string;
  from_user: string;
  document_type?: string;
  document_name?: string;
}
