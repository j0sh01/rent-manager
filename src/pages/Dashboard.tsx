import { useQuery } from '@tanstack/react-query';
import { Building, Home, CreditCard, Users } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/hooks/useAuth';

export const Dashboard = () => {
  const { isAuthenticated, accessToken } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await apiClient.getDashboardStats();
      return response.data;
    },
    enabled: isAuthenticated,
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['recent-activities'],
    queryFn: async () => {
      const response = await apiClient.getRecentActivities();
      return response.data;
    },
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Building className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-600 mb-4">
            Please log in to view dashboard information.
          </p>
        </div>
      </div>
    );
  }

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-gray-200 animate-pulse rounded-lg" />
          <div className="space-y-6">
            <div className="h-32 bg-gray-200 animate-pulse rounded-lg" />
            <div className="h-32 bg-gray-200 animate-pulse rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  // Calculate occupancy rate
  const occupancyRate = stats?.total_properties > 0 
    ? Math.round(((stats.occupied_properties || 0) / stats.total_properties) * 100) 
    : 0;

  // Calculate revenue change (placeholder for now)
  const revenueChange = "+12% from last month"; // This would need historical data

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
          change={`${stats?.available_properties || 0} available`}
          changeType="positive"
          icon={Building}
        />
        <StatsCard
          title="Occupied Units"
          value={stats?.occupied_properties || 0}
          change={`${occupancyRate}% occupancy rate`}
          changeType="positive"
          icon={Home}
        />
        <StatsCard
          title="Monthly Revenue"
          value={`TZS ${(stats?.monthly_revenue || 0).toLocaleString()}`}
          change={revenueChange}
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
        <RecentActivity activities={activities || []} isLoading={activitiesLoading} />
        
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
                <span className="font-medium text-yellow-600">{stats?.maintenance_requests || 0}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm text-gray-600">Total Rentals</span>
                <span className="font-medium text-purple-600">{stats?.total_rentals || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
