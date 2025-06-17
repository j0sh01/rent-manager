import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, CreditCard, Calendar, Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getTotalRentPaid, getPendingRent, getAllPayments } from '@/Integration/frappe/client';
import { Payment } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { PaymentFilters, PaymentFilters as PaymentFiltersType } from '@/components/PaymentFilters';
import { exportFilteredPaymentsToExcel } from '@/utils/excelExport';
import { toast } from '@/components/ui/sonner';
import { apiClient } from '@/lib/api-client';

export const Payments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<PaymentFiltersType>({
    search: '',
    status: 'all',
    paymentMethod: 'all',
    paymentType: 'all',
    dateFrom: undefined,
    dateTo: undefined,
    amountMin: '',
    amountMax: '',
  });
  const { accessToken } = useAuth();

  // Fetch total rent paid
  const { data: totalRentPaid = 0 } = useQuery({
    queryKey: ['totalRentPaid'],
    queryFn: async (): Promise<number> => {
      if (!accessToken) throw new Error('Not authenticated');
      return getTotalRentPaid(accessToken);
    },
    enabled: !!accessToken,
  });

  // Fetch pending rent
  const { data: pendingRent = 0 } = useQuery({
    queryKey: ['pendingRent'],
    queryFn: async (): Promise<number> => {
      if (!accessToken) throw new Error('Not authenticated');
      return getPendingRent(accessToken);
    },
    enabled: !!accessToken,
  });

  // Fetch all payments
  const { data: payments = [], isLoading, error } = useQuery({
    queryKey: ['payments'],
    queryFn: async (): Promise<Payment[]> => {
      if (!accessToken) throw new Error('Not authenticated');
      const rawPayments = await getAllPayments(accessToken);
      
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
      }));
    },
    enabled: !!accessToken,
    retry: 1,
  });

  const handleFiltersChange = (newFilters: PaymentFiltersType) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      paymentMethod: 'all',
      paymentType: 'all',
      dateFrom: undefined,
      dateTo: undefined,
      amountMin: '',
      amountMax: '',
    });
  };

  const handleExport = () => {
    try {
      exportFilteredPaymentsToExcel(filteredPayments, filters, 'payments');
      toast.success('Payments exported successfully!');
    } catch (error) {
      toast.error('Failed to export payments');
      console.error('Export error:', error);
    }
  };

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

  // Apply filters to payments
  const filteredPayments = payments.filter(payment => {
    // Search filter
    const searchMatch = searchTerm === '' || 
      payment.rental?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.reference_number?.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const statusMatch = filters.status === 'all' || 
      payment.status === filters.status;

    // Payment method filter
    const paymentMethodMatch = filters.paymentMethod === 'all' || 
      payment.payment_method === filters.paymentMethod;

    // Payment type filter
    const paymentTypeMatch = filters.paymentType === 'all' || 
      payment.payment_type === filters.paymentType;

    // Amount range filter
    let amountMatch = true;
    if (filters.amountMin !== '' || filters.amountMax !== '') {
      const amount = payment.amount_tzs || 0;
      if (filters.amountMin !== '' && amount < parseFloat(filters.amountMin)) {
        amountMatch = false;
      }
      if (filters.amountMax !== '' && amount > parseFloat(filters.amountMax)) {
        amountMatch = false;
      }
    }

    // Date range filter
    let dateMatch = true;
    if (filters.dateFrom || filters.dateTo) {
      const paymentDate = payment.payment_date ? new Date(payment.payment_date) : null;
      if (paymentDate) {
        if (filters.dateFrom && paymentDate < filters.dateFrom) {
          dateMatch = false;
        }
        if (filters.dateTo && paymentDate > filters.dateTo) {
          dateMatch = false;
        }
      } else {
        dateMatch = false;
      }
    }

    return searchMatch && statusMatch && paymentMethodMatch && paymentTypeMatch && amountMatch && dateMatch;
  });

  // Calculate collection rate
  const totalExpected = totalRentPaid + pendingRent;
  const collectionRate = totalExpected > 0 ? Math.round((totalRentPaid / totalExpected) * 100) : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
        </div>
        <div className="h-64 bg-gray-200 animate-pulse rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
        </div>
        
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-red-400 mb-4">
                <CreditCard className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Payments</h3>
              <p className="text-red-700 mb-4">
                Unable to load payment data. Please check your connection and try again.
              </p>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Record Payment
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">TZS {totalRentPaid.toLocaleString()}</div>
            <p className="text-xs text-gray-500">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">TZS {pendingRent.toLocaleString()}</div>
            <p className="text-xs text-gray-500">{filteredPayments.filter(p => p.status === 'Pending').length} outstanding</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Collection Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{collectionRate}%</div>
            <p className="text-xs text-gray-500">On-time payments</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <PaymentFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
          />
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rental</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.name}>
                  <TableCell className="font-medium">{payment.rental}</TableCell>
                  <TableCell className="font-semibold text-green-600">
                    TZS {payment.amount_tzs.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      {payment.due_date ? new Date(payment.due_date).toLocaleDateString() : '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <CreditCard className="h-4 w-4 mr-1 text-gray-400" />
                      {payment.payment_method || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(payment.status || 'Pending')}>
                      {payment.status || 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">
                    {payment.reference || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePrintPayment(payment)}
                        title="Print Payment Document"
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                      {payment.status === 'Pending' && (
                        <Button variant="outline" size="sm">
                          Mark Paid
                        </Button>
                      )}
                      {payment.status === 'Paid' && (
                        <Button variant="outline" size="sm">
                          Receipt
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filteredPayments.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <CreditCard className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || Object.values(filters).some(f => f !== '' && f !== 'all' && f !== undefined) 
              ? 'Try adjusting your search terms or filters.' 
              : 'Get started by recording your first payment.'}
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Record Payment
          </Button>
        </div>
      )}
    </div>
  );
};
