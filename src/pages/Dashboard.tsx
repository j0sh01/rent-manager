
import { useQuery } from '@tanstack/react-query';
import { Building, Home, CreditCard, Users } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { apiClient } from '@/lib/api-client';
import { DashboardStats, ActivityItem } from '@/types';

export const Dashboard = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      // Fetch properties
      const properties = await apiClient.getDocList('Property', {
        fields: ['name', 'status'],
      });

      // Fetch rentals
      const rentals = await apiClient.getDocList('Rental', {
        fields: ['name', 'status', 'monthly_rent'],
      });

      // Fetch payments
      const payments = await apiClient.getDocList('Payment', {
        fields: ['name', 'amount', 'status', 'payment_date'],
        filters: [['payment_date', '>=', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()]],
      });

      // Calculate stats
      const total_properties = properties.data?.length || 0;
      const occupied_properties = properties.data?.filter((p: any) => p.status === 'Occupied').length || 0;
      const available_properties = properties.data?.filter((p: any) => p.status === 'Available').length || 0;
      const total_rentals = rentals.data?.length || 0;
      const active_rentals = rentals.data?.filter((r: any) => r.status === 'Active').length || 0;
      const monthly_revenue = payments.data?.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0;
      const pending_payments = payments.data?.filter((p: any) => p.status === 'Pending').length || 0;

      return {
        total_properties,
        occupied_properties,
        available_properties,
        total_rentals,
        active_rentals,
        monthly_revenue,
        pending_payments,
        maintenance_requests: 0, // Mock data for now
      };
    },
  });

  const { data: activities } = useQuery({
    queryKey: ['recent-activities'],
    queryFn: async (): Promise<ActivityItem[]> => {
      // This would typically come from a dedicated API endpoint
      // For now, we'll create mock activities based on recent data
      const recentPayments = await apiClient.getDocList('Payment', {
        fields: ['name', 'amount', 'status', 'payment_date', 'rental'],
        limit: 5,
        order_by: 'creation desc',
      });

      return recentPayments.data?.map((payment: any, index: number) => ({
        id: payment.name,
        type: 'payment' as const,
        title: `Payment Received`,
        description: `$${payment.amount} payment for rental ${payment.rental}`,
        timestamp: payment.payment_date,
        status: payment.status,
      })) || [];
    },
  });

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Welcome back! Here's what's happening with your properties.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Properties"
          value={stats?.total_properties || 0}
          change="+2 this month"
          changeType="positive"
          icon={Building}
        />
        <StatsCard
          title="Occupied Units"
          value={stats?.occupied_properties || 0}
          change={`${Math.round(((stats?.occupied_properties || 0) / (stats?.total_properties || 1)) * 100)}% occupancy`}
          changeType="positive"
          icon={Home}
        />
        <StatsCard
          title="Monthly Revenue"
          value={`$${(stats?.monthly_revenue || 0).toLocaleString()}`}
          change="+8% from last month"
          changeType="positive"
          icon={CreditCard}
        />
        <StatsCard
          title="Active Rentals"
          value={stats?.active_rentals || 0}
          change={`${stats?.pending_payments || 0} pending payments`}
          changeType="neutral"
          icon={Users}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentActivity activities={activities || []} />
        
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Add New Property
              </button>
              <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                Record Payment
              </button>
              <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                Create Rental Agreement
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Available</span>
                <span className="font-medium text-green-600">{stats?.available_properties || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Occupied</span>
                <span className="font-medium text-blue-600">{stats?.occupied_properties || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Maintenance</span>
                <span className="font-medium text-yellow-600">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
