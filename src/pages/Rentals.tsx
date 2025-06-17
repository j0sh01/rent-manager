import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, FileText, Calendar, User, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { Rental } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { formatFrappeImageUrl } from '@/Integration/frappe/client';
import { downloadRentalPDF } from '@/Integration/frappe/client';
import { toast } from '@/components/ui/sonner';
import { RentalFilters, RentalFilters as RentalFiltersType } from '@/components/RentalFilters';

// Helper function to format dates safely
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'N/A';
  
  try {
    // Handle DD-MM-YYYY format
    if (dateString.includes('-') && dateString.split('-').length === 3) {
      const [day, month, year] = dateString.split('-');
      if (day && month && year) {
        const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        return new Date(formattedDate).toLocaleDateString();
      }
    }
    
    // Handle YYYY-MM-DD format
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

export const Rentals = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [downloadingPDF, setDownloadingPDF] = useState<string | null>(null);
  const [filters, setFilters] = useState<RentalFiltersType>({
    status: 'all',
    propertyType: 'all',
    startDate: undefined,
    endDate: undefined,
    minRent: '',
    maxRent: ''
  });
  const { isAuthenticated, accessToken } = useAuth();

  console.log('🔐 Authentication status:', { isAuthenticated, hasToken: !!accessToken });

  const { data: rentals, isLoading, error } = useQuery({
    queryKey: ['rentals'],
    queryFn: async (): Promise<Rental[]> => {
      console.log('🔍 Fetching rentals from API...');
      console.log('🔑 Using token:', accessToken ? 'Token available' : 'No token');
      const response = await apiClient.getDocList('Rental');
      console.log('📦 API response:', response);
      console.log('📋 Rentals data:', response.data);
      console.log('📊 Number of rentals:', response.data?.length || 0);
      if (response.data && response.data.length > 0) {
        console.log('📄 First rental example:', response.data[0]);
      }
      return response.data || [];
    },
    enabled: isAuthenticated, // Only run query if authenticated
  });

  // Apply filters and search
  const filteredRentals = rentals?.filter(rental => {
    // Search filter
    const searchMatch = (rental.property_details?.title || rental.property || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (rental.tenant_details?.full_name || rental.tenant_name || rental.tenant || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (!searchMatch) return false;

    // Status filter
    if (filters.status !== 'all' && rental.status !== filters.status) {
      return false;
    }

    // Property type filter - skip for now since property_type is not available in current data
    // if (filters.propertyType !== 'all' && rental.property_details?.property_type !== filters.propertyType) {
    //   return false;
    // }

    // Date range filters
    if (filters.startDate) {
      const rentalStartDate = new Date(rental.start_date || '');
      if (isNaN(rentalStartDate.getTime()) || rentalStartDate < filters.startDate) {
        return false;
      }
    }

    if (filters.endDate) {
      const rentalEndDate = new Date(rental.end_date || '');
      if (isNaN(rentalEndDate.getTime()) || rentalEndDate > filters.endDate) {
        return false;
      }
    }

    // Rent range filters
    const monthlyRent = rental.monthly_rent_tzs || rental.monthly_rent || 0;
    
    if (filters.minRent && monthlyRent < parseFloat(filters.minRent)) {
      return false;
    }

    if (filters.maxRent && monthlyRent > parseFloat(filters.maxRent)) {
      return false;
    }

    return true;
  }) || [];

  console.log('🔍 Search term:', searchTerm);
  console.log('🔍 Filters:', filters);
  console.log('📋 Original rentals count:', rentals?.length || 0);
  console.log('🔍 Filtered rentals count:', filteredRentals.length);

  const handleFiltersChange = (newFilters: RentalFiltersType) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      status: 'all',
      propertyType: 'all',
      startDate: undefined,
      endDate: undefined,
      minRent: '',
      maxRent: ''
    });
  };

  const getStatusColor = (rental: Rental) => {
    // Use status_context from API if available
    if (rental.status_context) {
      switch (rental.status_context) {
        case 'green':
          return 'bg-green-100 text-green-800';
        case 'red':
          return 'bg-red-100 text-red-800';
        case 'orange':
          return 'bg-orange-100 text-orange-800';
        case 'yellow':
          return 'bg-yellow-100 text-yellow-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }
    
    // Fallback to original logic
    switch (rental.status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Expired':
        return 'bg-red-100 text-red-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Terminated':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewContract = async (rentalName: string) => {
    if (!accessToken) {
      console.error('No access token available');
      return;
    }

    setDownloadingPDF(rentalName);
    
    try {
      const result = await downloadRentalPDF(accessToken, rentalName);
      if (result.success) {
        toast.success('PDF downloaded successfully');
      } else {
        console.error('Failed to download PDF:', result.error);
        toast.error('Failed to download PDF');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Error downloading PDF');
    } finally {
      setDownloadingPDF(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Rentals</h1>
        </div>
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <FileText className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-600 mb-4">
            Please log in to view rental agreements.
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
          <h1 className="text-3xl font-bold text-gray-900">Rentals</h1>
        </div>
        <div className="grid grid-cols-1 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Rentals</h1>
        </div>
        <div className="text-center py-12">
          <div className="text-red-400 mb-4">
            <FileText className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading rentals</h3>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : 'An error occurred while fetching rentals'}
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
        <h1 className="text-3xl font-bold text-gray-900">Rental Agreements</h1>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          New Rental Agreement
        </Button>
      </div>

      {/* Debug section - remove this later */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Debug Info:</h3>
          <p className="text-sm text-yellow-700">
            Raw rentals: {rentals?.length || 0} items<br/>
            Filtered rentals: {filteredRentals.length} items<br/>
            Search term: "{searchTerm}"<br/>
            Active filters: {Object.values(filters).filter(v => v !== '' && v !== undefined && v !== null && v !== 'all').length}<br/>
            Is authenticated: {isAuthenticated ? 'Yes' : 'No'}<br/>
            Has token: {accessToken ? 'Yes' : 'No'}
          </p>
          {rentals && rentals.length > 0 && (
            <details className="mt-2">
              <summary className="text-sm text-yellow-700 cursor-pointer">Show first rental data</summary>
              <pre className="text-xs text-yellow-700 mt-2 bg-yellow-100 p-2 rounded overflow-auto">
                {JSON.stringify(rentals[0], null, 2)}
              </pre>
              <div className="mt-2 text-xs text-yellow-700">
                <strong>Date Debug:</strong><br/>
                Raw start_date: "{rentals[0].start_date}" → Formatted: "{formatDate(rentals[0].start_date)}"<br/>
                Raw end_date: "{rentals[0].end_date}" → Formatted: "{formatDate(rentals[0].end_date)}"
              </div>
            </details>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by property or tenant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <RentalFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />
      </div>

      <div className="space-y-4">
        {filteredRentals.map((rental) => (
          <Card key={rental.name} className="hover:shadow-lg transition-shadow duration-200 cursor-pointer">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl font-semibold text-gray-900 mb-2">
                    {rental.property_details?.title || rental.property_name || rental.property}
                  </CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {rental.tenant_details?.full_name || rental.tenant_name || rental.tenant}
                    </div>
                    {rental.tenant_details?.phone && (
                      <div className="flex items-center text-xs text-gray-500">
                        📞 {rental.tenant_details.phone}
                      </div>
                    )}
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(rental.start_date)} - {formatDate(rental.end_date)}
                    </div>
                  </div>
                </div>
                <Badge className={getStatusColor(rental)}>
                  {rental.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Monthly Rent:</span>
                    <span className="font-bold text-lg text-green-600">
                      TZS {(rental.monthly_rent_tzs || rental.monthly_rent || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Deposit:</span>
                    <span className="font-medium">TZS {(rental.deposit || 0).toLocaleString()}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Start Date:</span>
                    <span className="font-medium">{formatDate(rental.start_date)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">End Date:</span>
                    <span className="font-medium">{formatDate(rental.end_date)}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="text-sm">
                    <span className="text-gray-600">Terms:</span>
                    <p className="font-medium mt-1">{rental.lease_terms || 'Standard lease terms'}</p>
                  </div>
                  {rental.property_details && (
                    <div className="text-sm">
                      <span className="text-gray-600">Property Details:</span>
                      <p className="font-medium mt-1">
                        {rental.property_details.bedrooms} bed, {rental.property_details.bathroom} bath • {rental.property_details.location}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
                <Button variant="outline" size="sm" onClick={() => handleViewContract(rental.name)} disabled={downloadingPDF === rental.name}>
                  <FileText className="h-4 w-4 mr-1" />
                  {downloadingPDF === rental.name ? 'Downloading...' : 'View Contract'}
                </Button>
                <Button variant="outline" size="sm">
                  <DollarSign className="h-4 w-4 mr-1" />
                  Payment History
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRentals.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <FileText className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No rental agreements found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first rental agreement.'}
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            New Rental Agreement
          </Button>
        </div>
      )}
    </div>
  );
};
