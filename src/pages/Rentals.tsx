
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, FileText, Calendar, User, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { Rental } from '@/types';

export const Rentals = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: rentals, isLoading } = useQuery({
    queryKey: ['rentals'],
    queryFn: async (): Promise<Rental[]> => {
      const response = await apiClient.getDocList('Rental');
      return response.data || [];
    },
  });

  const filteredRentals = rentals?.filter(rental =>
    rental.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rental.tenant.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Rental Agreements</h1>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          New Rental Agreement
        </Button>
      </div>

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

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredRentals.map((rental) => (
          <Card key={rental.name} className="hover:shadow-lg transition-shadow duration-200 cursor-pointer">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl font-semibold text-gray-900 mb-2">
                    {rental.property}
                  </CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {rental.tenant}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(rental.start_date).toLocaleDateString()} - {new Date(rental.end_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <Badge className={getStatusColor(rental.status)}>
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
                      ${rental.monthly_rent.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Deposit:</span>
                    <span className="font-medium">${rental.deposit.toLocaleString()}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Start Date:</span>
                    <span className="font-medium">{new Date(rental.start_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">End Date:</span>
                    <span className="font-medium">{new Date(rental.end_date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="text-sm">
                    <span className="text-gray-600">Terms:</span>
                    <p className="font-medium mt-1">{rental.lease_terms}</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-1" />
                  View Contract
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
