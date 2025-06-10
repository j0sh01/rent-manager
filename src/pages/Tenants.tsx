
import { useState } from 'react';
import { Plus, Search, Filter, User, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Mock tenant data
const mockTenants = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+1 (555) 123-4567',
    property: 'Sunset Apartments Unit 12A',
    leaseStart: '2024-01-01',
    leaseEnd: '2024-12-31',
    rentAmount: 2500,
    status: 'Active',
    emergencyContact: 'Mike Johnson - (555) 765-4321',
  },
  {
    id: '2',
    name: 'Mike Wilson',
    email: 'mike.wilson@example.com',
    phone: '+1 (555) 234-5678',
    property: 'Garden View House',
    leaseStart: '2024-02-15',
    leaseEnd: '2025-02-14',
    rentAmount: 2800,
    status: 'Active',
    emergencyContact: 'Lisa Wilson - (555) 876-5432',
  },
  {
    id: '3',
    name: 'David Brown',
    email: 'david.brown@example.com',
    phone: '+1 (555) 345-6789',
    property: 'Luxury Penthouse',
    leaseStart: '2024-03-01',
    leaseEnd: '2025-02-28',
    rentAmount: 5500,
    status: 'Active',
    emergencyContact: 'Emma Brown - (555) 987-6543',
  },
  {
    id: '4',
    name: 'Alex Chen',
    email: 'alex.chen@example.com',
    phone: '+1 (555) 456-7890',
    property: 'Downtown Loft 5B',
    leaseStart: '2024-05-01',
    leaseEnd: '2025-04-30',
    rentAmount: 3200,
    status: 'Pending',
    emergencyContact: 'Jenny Chen - (555) 098-7654',
  },
];

export const Tenants = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTenants = mockTenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.property.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Tenant Management</h1>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Tenant
        </Button>
      </div>

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
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTenants.map((tenant) => (
          <Card key={tenant.id} className="hover:shadow-lg transition-shadow duration-200 cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                    {tenant.name}
                  </CardTitle>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {tenant.property}
                  </div>
                </div>
                <Badge className={getStatusColor(tenant.status)}>
                  {tenant.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-gray-600">{tenant.email}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-gray-600">{tenant.phone}</span>
                </div>
                <div className="flex items-center justify-between text-sm pt-2 border-t">
                  <span className="text-gray-600">Monthly Rent:</span>
                  <span className="font-bold text-lg text-green-600">
                    ${tenant.rentAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Lease:</span>
                  <span className="font-medium">
                    {new Date(tenant.leaseStart).toLocaleDateString()} - {new Date(tenant.leaseEnd).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Emergency Contact:</span>
                  <p className="font-medium mt-1">{tenant.emergencyContact}</p>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-1" />
                  View Profile
                </Button>
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-1" />
                  Contact
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
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first tenant.'}
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Tenant
          </Button>
        </div>
      )}
    </div>
  );
};
