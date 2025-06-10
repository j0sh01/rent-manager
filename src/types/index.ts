
// Core type definitions for the rental management system
export interface User {
  email: string;
  full_name: string;
  roles: string[];
  user_image?: string;
}

export interface Property {
  name: string;
  property_name: string;
  address: string;
  property_type: 'Apartment' | 'House' | 'Commercial' | 'Condo' | 'Loft' | 'Studio' | 'Penthouse';
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
  rent_amount: number;
  status: 'Available' | 'Occupied' | 'Maintenance' | 'Unavailable';
  images?: string[];
  description?: string;
  amenities?: string[];
  creation?: string;
  modified?: string;
}

export interface Rental {
  name: string;
  property: string;
  tenant: string;
  tenant_name?: string;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  security_deposit: number;
  deposit: number;
  status: 'Active' | 'Terminated' | 'Pending' | 'Expired';
  lease_terms?: string;
  creation?: string;
  modified?: string;
}

export interface Payment {
  name: string;
  rental: string;
  payment_date: string;
  due_date: string;
  amount: number;
  payment_type: 'Rent' | 'Security Deposit' | 'Late Fee' | 'Maintenance' | 'Other';
  payment_method: 'Cash' | 'Check' | 'Bank Transfer' | 'Credit Card' | 'Online Payment' | 'ACH' | '';
  status: 'Paid' | 'Pending' | 'Failed' | 'Refunded';
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
