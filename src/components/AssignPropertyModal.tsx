import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Home, User, Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getProperties } from '@/Integration/frappe/client';
import { Property, Tenant } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/sonner';
import { apiClient } from '@/lib/api-client';

interface AssignPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant | null;
  onSuccess: () => void;
}

export const AssignPropertyModal = ({ isOpen, onClose, tenant, onSuccess }: AssignPropertyModalProps) => {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [monthlyRent, setMonthlyRent] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [frequency, setFrequency] = useState<string>('1');

  // Fetch available properties
  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ['availableProperties'],
    queryFn: async (): Promise<Property[]> => {
      if (!accessToken) throw new Error('Not authenticated');
      const allProperties = await getProperties(accessToken);
      // Filter only available properties
      return allProperties.filter(property => property.status === 'Available');
    },
    enabled: isOpen && !!accessToken,
  });

  // Auto-populate monthly rent when property is selected
  useEffect(() => {
    if (selectedProperty && properties.length > 0) {
      const selectedPropertyData = properties.find(p => p.name === selectedProperty);
      if (selectedPropertyData && selectedPropertyData.price_tzs) {
        setMonthlyRent(selectedPropertyData.price_tzs.toString());
      }
    }
  }, [selectedProperty, properties]);

  // Auto-calculate end date when start date and frequency change
  useEffect(() => {
    if (startDate && frequency) {
      const start = new Date(startDate);
      const months = parseInt(frequency);
      const end = new Date(start);
      end.setMonth(end.getMonth() + months);
      
      // Format the date as YYYY-MM-DD
      const endDateString = end.toISOString().split('T')[0];
      setEndDate(endDateString);
    }
  }, [startDate, frequency]);

  // Create rental mutation
  const createRentalMutation = useMutation({
    mutationFn: async (rentalData: any) => {
      if (!accessToken) throw new Error('Not authenticated');
      
      const response = await fetch(`${import.meta.env.VITE_FRAPPE_BASE_URL || 'http://localhost:8000'}/api/resource/Rental`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: rentalData
        })
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to create rental');
      }

      return responseData;
    },
    onSuccess: () => {
      toast.success('Property assigned successfully!');
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['rentals'] });
      queryClient.invalidateQueries({ queryKey: ['availableProperties'] });
      onSuccess();
      handleClose();
    },
    onError: (error) => {
      console.error('Error creating rental:', error);
      toast.error('Failed to assign property. Please try again.');
    }
  });

  const handleClose = () => {
    setSelectedProperty('');
    setMonthlyRent('');
    setStartDate('');
    setEndDate('');
    setFrequency('1');
    onClose();
  };

  const handleAssignProperty = () => {
    if (!tenant || !selectedProperty || !monthlyRent || !startDate || !endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const selectedPropertyData = properties.find(p => p.name === selectedProperty);
    if (!selectedPropertyData) {
      toast.error('Selected property not found');
      return;
    }

    const rentalData = {
      property: selectedProperty,
      property_name: selectedPropertyData.title,
      tenant: tenant.name,
      tenant_name: tenant.full_name,
      status: 'Not Paid', // Initial status as requested
      monthly_rent_tzs: parseFloat(monthlyRent),
      start_date: startDate,
      end_date: endDate,
      frequency: frequency,
      total_rent_tzs: parseFloat(monthlyRent) * parseInt(frequency)
    };

    createRentalMutation.mutate(rentalData);
  };

  const selectedPropertyData = properties.find(p => p.name === selectedProperty);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Home className="h-5 w-5 text-blue-600" />
              <span>Assign Property to Tenant</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tenant Info */}
          {tenant && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <User className="h-5 w-5 mr-2 text-gray-600" />
                  {tenant.full_name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <p className="font-medium">{tenant.email}</p>
                  </div>
                  {tenant.phone && (
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <p className="font-medium">{tenant.phone}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Property Selection */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="property">Select Available Property *</Label>
              <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a property..." />
                </SelectTrigger>
                <SelectContent>
                  {propertiesLoading ? (
                    <SelectItem value="loading" disabled>Loading properties...</SelectItem>
                  ) : properties.length === 0 ? (
                    <SelectItem value="no-properties" disabled>No available properties found</SelectItem>
                  ) : (
                    properties.map((property) => (
                      <SelectItem key={property.name} value={property.name}>
                        <div className="flex items-center justify-between w-full">
                          <span>{property.title}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {property.bedrooms} bed, {property.bathroom} bath
                          </Badge>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Selected Property Details */}
            {selectedPropertyData && (
              <Card className="bg-gray-50">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Location:</span>
                      <p className="font-medium">{selectedPropertyData.location}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Size:</span>
                      <p className="font-medium">{selectedPropertyData.bedrooms} bed, {selectedPropertyData.bathroom} bath</p>
                    </div>
                    {selectedPropertyData.square_meters && (
                      <div>
                        <span className="text-gray-600">Area:</span>
                        <p className="font-medium">{selectedPropertyData.square_meters} m²</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Rental Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="monthlyRent">Monthly Rent (TZS) *</Label>
                <Input
                  id="monthlyRent"
                  type="number"
                  placeholder="Enter monthly rent"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(e.target.value)}
                  readOnly
                  className="bg-gray-50 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Populated from property price
                </p>
              </div>
              <div>
                <Label htmlFor="frequency">Frequency (months) *</Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} month{num !== 1 ? 's' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date * (Auto-calculated)</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  readOnly
                  className="bg-gray-50 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Calculated based on start date and frequency
                </p>
              </div>
            </div>

            {/* Summary */}
            {monthlyRent && frequency && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Rent:</span>
                    <span className="font-bold text-blue-600">
                      TZS {(parseFloat(monthlyRent) * parseInt(frequency)).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-gray-600">Initial Status:</span>
                    <Badge variant="outline" className="border-yellow-200 text-yellow-700">
                      Not Paid
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssignProperty}
              disabled={!selectedProperty || !monthlyRent || !startDate || !endDate || createRentalMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createRentalMutation.isPending ? 'Assigning...' : 'Assign Property'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 