import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, DollarSign, Calendar, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createPayment, updateRentalStatus } from '@/Integration/frappe/client';
import { Rental } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/sonner';

interface CreatePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  rental: Rental | null;
  onSuccess: () => void;
}

export const CreatePaymentModal = ({ isOpen, onClose, rental, onSuccess }: CreatePaymentModalProps) => {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');

  // Calculate payment amount based on monthly rent and frequency
  useEffect(() => {
    if (rental && rental.monthly_rent_tzs && rental.frequency) {
      const monthlyRent = rental.monthly_rent_tzs;
      const frequency = parseInt(rental.frequency);
      const totalAmount = monthlyRent * frequency;
      setAmount(totalAmount.toString());
    }
  }, [rental]);

  // Create payment mutation
  const createPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      if (!accessToken) throw new Error('Not authenticated');
      
      // First create the payment
      const paymentResult = await createPayment(accessToken, paymentData);
      
      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Failed to create payment');
      }

      // Then update the rental status to "Active"
      const rentalUpdateResult = await updateRentalStatus(accessToken, rental!.name, 'Active');
      
      if (!rentalUpdateResult.success) {
        throw new Error(rentalUpdateResult.error || 'Failed to update rental status');
      }

      return paymentResult;
    },
    onSuccess: () => {
      toast.success('Payment created and rental status updated!');
      queryClient.invalidateQueries({ queryKey: ['rentals'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['paymentsByRental'] });
      onSuccess();
      handleClose();
    },
    onError: (error) => {
      console.error('Error creating payment:', error);
      toast.error('Failed to create payment. Please try again.');
    }
  });

  const handleClose = () => {
    setAmount('');
    setPaymentDate('');
    setPaymentMethod('');
    onClose();
  };

  const handleCreatePayment = () => {
    if (!rental || !amount || !paymentDate || !paymentMethod) {
      toast.error('Please fill in all required fields');
      return;
    }

    const paymentData = {
      rental: rental.name,
      amount_tzs: parseFloat(amount),
      payment_date: paymentDate,
      payment_method: paymentMethod,
      tenant: rental.tenant,
      start_date: rental.start_date,
      end_date: rental.end_date,
      docstatus: 1 // Submitted status instead of draft
    };

    createPaymentMutation.mutate(paymentData);
  };

  // Set default payment date to today if not set
  if (!paymentDate) {
    setPaymentDate(new Date().toISOString().split('T')[0]);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span>Create Payment</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Rental Info */}
          {rental && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {rental.property_name || rental.property}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Tenant:</span>
                    <p className="font-medium">{rental.tenant_name || rental.tenant}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Monthly Rent:</span>
                    <p className="font-medium">TZS {(rental.monthly_rent_tzs || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Frequency:</span>
                    <p className="font-medium">{rental.frequency || 1} month{rental.frequency && parseInt(rental.frequency) !== 1 ? 's' : ''}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Current Status:</span>
                    <Badge 
                      variant="outline" 
                      className={`${
                        rental.status === 'Not Paid' ? 'border-yellow-200 text-yellow-700' :
                        rental.status === 'Active' ? 'border-green-200 text-green-700' :
                        'border-gray-200 text-gray-700'
                      }`}
                    >
                      {rental.status}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-600">Period:</span>
                    <p className="font-medium">
                      {new Date(rental.start_date).toLocaleDateString()} - {new Date(rental.end_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Payment Amount (TZS) *</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Calculated automatically"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                readOnly
                className="bg-gray-50 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Calculated as: Monthly Rent × Frequency ({rental?.monthly_rent_tzs || 0} × {rental?.frequency || 0})
              </p>
            </div>

            <div>
              <Label htmlFor="paymentDate">Payment Date *</Label>
              <Input
                id="paymentDate"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="paymentMethod">Payment Method *</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Summary */}
          {amount && paymentMethod && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Payment Amount:</span>
                  <span className="font-bold text-green-600">
                    TZS {parseFloat(amount || '0').toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm text-gray-600">New Rental Status:</span>
                  <Badge variant="outline" className="border-green-200 text-green-700">
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm text-gray-600">Payment Status:</span>
                  <Badge variant="outline" className="border-green-200 text-green-700">
                    Paid
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreatePayment}
              disabled={!amount || !paymentDate || !paymentMethod || createPaymentMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {createPaymentMutation.isPending ? 'Creating...' : 'Create Payment'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 