import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Calendar, DollarSign, CreditCard, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getPaymentsByRental } from '@/Integration/frappe/client';
import { Payment } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/sonner';
import { apiClient } from '@/lib/api-client';

interface PaymentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  rentalId: string;
  rentalName: string;
}

// Helper function to format dates safely
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

export const PaymentHistoryModal = ({ isOpen, onClose, rentalId, rentalName }: PaymentHistoryModalProps) => {
  const { accessToken } = useAuth();

  const { data: payments = [], isLoading, error } = useQuery({
    queryKey: ['paymentsByRental', rentalId],
    queryFn: async (): Promise<Payment[]> => {
      if (!accessToken) throw new Error('Not authenticated');
      const rawPayments = await getPaymentsByRental(accessToken, rentalId);
      
      // Transform the raw data to match our Payment interface
      return rawPayments.map((payment: any) => ({
        name: payment.name,
        rental: payment.rental,
        amount_tzs: payment.amount_tzs,
        amount: payment.amount_tzs, // For backward compatibility
        payment_date: payment.payment_date,
        end_date: payment.end_date,
        due_date: payment.end_date, // Using end_date as due_date since that's what we have
        payment_method: payment.payment_method,
        docstatus: payment.docstatus,
        status: payment.docstatus === 1 ? 'Paid' : 'Pending', // Map docstatus to status
        reference: payment.name, // Using payment name as reference
        reference_number: payment.name,
        creation: payment.creation,
        modified: payment.modified,
        // Add tenant information if available
        tenant: payment.tenant,
      }));
    },
    enabled: isOpen && !!accessToken,
    retry: 1,
  });

  const handlePrintPayment = async (payment: Payment) => {
    try {
      console.log('🖨️ Printing payment:', payment.name);
      
      // Call the print API with the Payment Print format
      const response = await apiClient.printDoc('Payment', payment.name, 'Payment Print');
      
      if (response && response.data) {
        // Open the PDF in a new window/tab
        const pdfUrl = response.data;
        window.open(pdfUrl, '_blank');
        toast.success('Payment document opened for printing');
      } else {
        throw new Error('No PDF URL received');
      }
    } catch (error) {
      console.error('❌ Print error:', error);
      toast.error('Failed to print payment document');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      case 'Refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'Cash':
        return '💵';
      case 'Bank Transfer':
        return '🏛️';
      case 'Mobile Money':
        return '📱';
      case 'Check':
        return '🏦';
      case 'Credit Card':
        return '💳';
      case 'Online Payment':
        return '🌐';
      case 'ACH':
        return '🏦';
      default:
        return '💰';
    }
  };

  const totalPaid = payments
    .filter(payment => payment.status === 'Paid')
    .reduce((sum, payment) => sum + (payment.amount_tzs || 0), 0);

  const totalPending = payments
    .filter(payment => payment.status === 'Pending')
    .reduce((sum, payment) => sum + (payment.amount_tzs || 0), 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span>Payment History</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Rental Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{rentalName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    TZS {totalPaid.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Paid</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    TZS {totalPending.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {payments.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Payments</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading payment history...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-8">
              <div className="text-red-400 mb-4">
                <DollarSign className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading payments</h3>
              <p className="text-gray-600 mb-4">
                {error instanceof Error ? error.message : 'An error occurred while fetching payments'}
              </p>
              <Button 
                onClick={() => window.location.reload()} 
                className="bg-blue-600 hover:bg-blue-700"
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Payments Table */}
          {!isLoading && !error && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Payment Records</h3>
                <Badge variant="outline">
                  {payments.length} payment{payments.length !== 1 ? 's' : ''}
                </Badge>
              </div>

              {payments.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <DollarSign className="h-16 w-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
                  <p className="text-gray-600">
                    No payment records have been created for this rental yet.
                  </p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Payment ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.name}>
                          <TableCell className="font-mono text-sm">
                            {payment.name}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              <span>{formatDate(payment.payment_date)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold text-green-600">
                              TZS {(payment.amount_tzs || 0).toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <span>{getPaymentMethodIcon(payment.payment_method || '')}</span>
                              <span className="text-sm">{payment.payment_method || 'N/A'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(payment.status || 'Pending')}>
                              {payment.status || 'Pending'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePrintPayment(payment)}
                              className="h-8 px-2"
                            >
                              <FileText className="h-3 w-3 mr-1" />
                              Print
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}; 