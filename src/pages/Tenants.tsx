import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, User, Mail, Phone, MapPin, Calendar, Shield, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { Tenant } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/sonner';
import { TenantModal } from '@/components/TenantModal';
import { AddTenantModal } from '@/components/AddTenantModal';
import { ContactModal } from '@/components/ContactModal';
import { AssignPropertyModal } from '@/components/AssignPropertyModal';
import { TenantFilters, TenantFilters as TenantFiltersType } from '@/components/TenantFilters';
import { getRentalsByTenant } from '@/Integration/frappe/client';

export const Tenants = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactTenant, setContactTenant] = useState<Tenant | null>(null);
  const [isAssignPropertyModalOpen, setIsAssignPropertyModalOpen] = useState(false);
  const [assignPropertyTenant, setAssignPropertyTenant] = useState<Tenant | null>(null);
  const [filters, setFilters] = useState<TenantFiltersType>({
    search: '',
    status: 'all',
    userType: 'all',
    dateFrom: undefined,
    dateTo: undefined,
  });
  const { isAuthenticated, accessToken } = useAuth();

  console.log('🔐 Authentication status:', { isAuthenticated, hasToken: !!accessToken });

  const { data: tenants, isLoading, error, refetch } = useQuery({
    queryKey: ['tenants'],
    queryFn: async (): Promise<Tenant[]> => {
      console.log('🔍 Fetching tenants from API...');
      console.log('🔑 Using token:', accessToken ? 'Token available' : 'No token');
      const response = await apiClient.getDocList('Tenant');
      console.log('📦 API response:', response);
      console.log('📋 Tenants data:', response.data);
      console.log('📊 Number of tenants:', response.data?.length || 0);
      
      if (response.data && response.data.length > 0) {
        console.log('📄 First tenant example:', response.data[0]);
        
        // Fetch rental information for each tenant
        const tenantsWithRentals = await Promise.all(
          response.data.map(async (tenant: any) => {
            try {
              const rentals = await getRentalsByTenant(accessToken!, tenant.name);
              console.log(`🏠 Found ${rentals.length} rentals for tenant ${tenant.name}:`, rentals);
              return {
                ...tenant,
                rentals: rentals
              };
            } catch (error) {
              console.error(`❌ Error fetching rentals for tenant ${tenant.name}:`, error);
              return {
                ...tenant,
                rentals: []
              };
            }
          })
        );
        
        return tenantsWithRentals;
      }
      
      return response.data || [];
    },
    enabled: isAuthenticated, // Only run query if authenticated
  });

  const handleViewProfile = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTenant(null);
  };

  const handleTenantUpdate = () => {
    refetch();
  };

  const handleAddTenant = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleTenantCreated = () => {
    refetch();
  };

  const handleContact = (tenant: Tenant) => {
    const hasEmail = tenant.email && tenant.email.trim() !== '';
    const hasPhone = tenant.phone && tenant.phone.trim() !== '';
    
    if (!hasEmail && !hasPhone) {
      // No contact information available
      toast.error('No contact information available for this tenant');
      return;
    }
    
    if (hasEmail && hasPhone) {
      // Both email and phone available - show contact modal
      setContactTenant(tenant);
      setIsContactModalOpen(true);
    } else if (hasEmail) {
      // Only email available - open email directly
      window.open(`mailto:${tenant.email}`, '_blank');
    } else if (hasPhone) {
      // Only phone available - open phone directly
      window.open(`tel:${tenant.phone}`, '_blank');
    }
  };

  const handleCloseContactModal = () => {
    setIsContactModalOpen(false);
    setContactTenant(null);
  };

  const handleAssignProperty = (tenant: Tenant) => {
    setAssignPropertyTenant(tenant);
    setIsAssignPropertyModalOpen(true);
  };

  const handleCloseAssignPropertyModal = () => {
    setIsAssignPropertyModalOpen(false);
    setAssignPropertyTenant(null);
  };

  const handlePropertyAssigned = () => {
    refetch();
  };

  const handleFiltersChange = (newFilters: TenantFiltersType) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      userType: 'all',
      dateFrom: undefined,
      dateTo: undefined,
    });
  };

  // Apply filters to tenants
  const filteredTenants = tenants?.filter(tenant => {
    // Search filter
    const searchMatch = searchTerm === '' || 
      tenant.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tenant.phone && tenant.phone.toLowerCase().includes(searchTerm.toLowerCase()));

    // Status filter
    const statusMatch = filters.status === 'all' || 
      (filters.status === 'active' && tenant.enabled) ||
      (filters.status === 'inactive' && !tenant.enabled);

    // User type filter
    const userTypeMatch = filters.userType === 'all' || 
      tenant.user_type === filters.userType;

    // Date range filter
    let dateMatch = true;
    if (filters.dateFrom || filters.dateTo) {
      const creationDate = tenant.creation ? new Date(tenant.creation) : null;
      if (creationDate) {
        if (filters.dateFrom && creationDate < filters.dateFrom) {
          dateMatch = false;
        }
        if (filters.dateTo && creationDate > filters.dateTo) {
          dateMatch = false;
        }
      } else {
        dateMatch = false;
      }
    }

    return searchMatch && statusMatch && userTypeMatch && dateMatch;
  }) || [];

  console.log('🔍 Search term:', searchTerm);
  console.log('🔍 Filters:', filters);
  console.log('📋 Original tenants count:', tenants?.length || 0);
  console.log('🔍 Filtered tenants count:', filteredTenants.length);

  const getStatusColor = (enabled: number | undefined) => {
    return enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatusText = (enabled: number | undefined) => {
    return enabled ? 'Active' : 'Inactive';
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'Invalid Date';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Tenant Management</h1>
        </div>
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <User className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-600 mb-4">
            Please log in to view tenant information.
          </p>
          <Button 
            onClick={() => window.location.href = '/login'} 
            className="bg-blue-600 hover:bg-blue-700"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Tenant Management</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Tenant Management</h1>
        </div>
        <div className="text-center py-12">
          <div className="text-red-400 mb-4">
            <User className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading tenants</h3>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : 'An error occurred while fetching tenants'}
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 hover:bg-blue-700"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Tenant Management</h1>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAddTenant}>
          <Plus className="h-4 w-4 mr-2" />
          Add Tenant
        </Button>
      </div>

      {/* Debug section - remove this later */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Debug Info:</h3>
          <p className="text-sm text-yellow-700">
            Raw tenants: {tenants?.length || 0} items<br/>
            Filtered tenants: {filteredTenants.length} items<br/>
            Search term: "{searchTerm}"<br/>
            Filters: {JSON.stringify(filters)}<br/>
            Is authenticated: {isAuthenticated ? 'Yes' : 'No'}<br/>
            Has token: {accessToken ? 'Yes' : 'No'}
          </p>
          {tenants && tenants.length > 0 && (
            <details className="mt-2">
              <summary className="text-sm text-yellow-700 cursor-pointer">Show first tenant data</summary>
              <pre className="text-xs text-yellow-700 mt-2 bg-yellow-100 p-2 rounded overflow-auto">
                {JSON.stringify(tenants[0], null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search tenants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <TenantFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTenants.map((tenant, index) => (
          <Card key={tenant.name} className="hover:shadow-lg transition-shadow duration-200 cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-semibold text-gray-900 mb-1 break-words">
                    {tenant.full_name}
                  </CardTitle>
                  <div className="flex flex-wrap items-center text-sm text-gray-600 mb-2 gap-1">
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span className="truncate">{tenant.user_type || 'User'}</span>
                    </div>
                    {tenant.rentals && tenant.rentals.length > 0 && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full whitespace-nowrap">
                        {tenant.rentals.length} propert{tenant.rentals.length === 1 ? 'y' : 'ies'}
                      </span>
                    )}
                  </div>
                </div>
                <Badge className={getStatusColor(tenant.enabled)}>
                  {getStatusText(tenant.enabled)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-gray-600">{tenant.email}</span>
                </div>
                {tenant.phone && (
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">{tenant.phone}</span>
                  </div>
                )}
                
                {/* Assigned Properties Section */}
                {tenant.rentals && tenant.rentals.length > 0 && (
                  <div className="pt-2 border-t">
                    <div className="flex items-center text-sm mb-2">
                      <Home className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-600 font-medium">Assigned Properties</span>
                    </div>
                    <div className="space-y-2">
                      {tenant.rentals.map((rental: any) => (
                        <div key={rental.name} className="bg-gray-50 rounded-lg p-2">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                            <span className="font-medium text-gray-800 text-xs break-words">
                              {rental.property_name || rental.property || 'Unknown Property'}
                            </span>
                            <Badge 
                              variant="outline" 
                              className={`text-xs whitespace-nowrap ${
                                rental.status === 'Active' ? 'border-green-200 text-green-700' :
                                rental.status === 'Expired' ? 'border-red-200 text-red-700' :
                                rental.status === 'Not Paid' ? 'border-yellow-200 text-yellow-700' :
                                'border-gray-200 text-gray-700'
                              }`}
                            >
                              {rental.status}
                            </Badge>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-600 mt-1 gap-1">
                            <span className="whitespace-nowrap">TZS {(rental.monthly_rent_tzs || 0).toLocaleString()}/month</span>
                            <span className="text-xs break-words">{formatDate(rental.start_date)} - {formatDate(rental.end_date)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm pt-2 border-t">
                  <span className="text-gray-600">User ID:</span>
                  <span className="font-medium text-gray-800">{tenant.name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">{formatDate(tenant.creation)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Last Modified:</span>
                  <span className="font-medium">{formatDate(tenant.modified)}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                <Button variant="outline" size="sm" onClick={() => handleAssignProperty(tenant)} className="flex-1 min-w-0">
                  <Home className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span className="truncate">Assign Property</span>
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleViewProfile(tenant)} className="flex-1 min-w-0">
                  <User className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span className="truncate">View Profile</span>
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleContact(tenant)} className="flex-1 min-w-0">
                  <Mail className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span className="truncate">Contact</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTenants.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <User className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tenants found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || Object.values(filters).some(f => f !== '' && f !== undefined) 
              ? 'Try adjusting your search terms or filters.' 
              : 'Get started by adding your first tenant.'}
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAddTenant}>
            <Plus className="h-4 w-4 mr-2" />
            Add Tenant
          </Button>
        </div>
      )}
      
      {/* Tenant Modal */}
      <TenantModal
        tenant={selectedTenant}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onUpdate={handleTenantUpdate}
      />
      
      {/* Add Tenant Modal */}
      <AddTenantModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSuccess={handleTenantCreated}
      />
      
      {/* Contact Modal */}
      <ContactModal
        tenant={contactTenant}
        isOpen={isContactModalOpen}
        onClose={handleCloseContactModal}
      />
      
      {/* Assign Property Modal */}
      <AssignPropertyModal
        tenant={assignPropertyTenant}
        isOpen={isAssignPropertyModalOpen}
        onClose={handleCloseAssignPropertyModal}
        onSuccess={handlePropertyAssigned}
      />
    </div>
  );
};
