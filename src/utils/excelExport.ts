import { Payment } from '@/types';

export const exportPaymentsToExcel = (payments: Payment[], filename: string = 'payments') => {
  // Create CSV content
  const headers = [
    'Payment ID',
    'Rental',
    'Amount (TZS)',
    'Payment Date',
    'Due Date',
    'Payment Method',
    'Payment Type',
    'Status',
    'Reference',
    'Created Date',
    'Modified Date'
  ];

  const csvContent = [
    headers.join(','),
    ...payments.map(payment => [
      payment.name,
      payment.rental || '',
      payment.amount_tzs || 0,
      payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : '',
      payment.due_date ? new Date(payment.due_date).toLocaleDateString() : '',
      payment.payment_method || '',
      payment.payment_type || '',
      payment.status || 'Pending',
      payment.reference || payment.reference_number || '',
      payment.creation ? new Date(payment.creation).toLocaleDateString() : '',
      payment.modified ? new Date(payment.modified).toLocaleDateString() : ''
    ].join(','))
  ].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const exportFilteredPaymentsToExcel = (
  payments: Payment[], 
  filters: any, 
  filename: string = 'filtered_payments'
) => {
  // Add filter information to filename
  const filterInfo = [];
  if (filters.status !== 'all') filterInfo.push(`status_${filters.status}`);
  if (filters.paymentMethod !== 'all') filterInfo.push(`method_${filters.paymentMethod}`);
  if (filters.paymentType !== 'all') filterInfo.push(`type_${filters.paymentType}`);
  if (filters.dateFrom) filterInfo.push(`from_${filters.dateFrom.toISOString().split('T')[0]}`);
  if (filters.dateTo) filterInfo.push(`to_${filters.dateTo.toISOString().split('T')[0]}`);
  if (filters.amountMin) filterInfo.push(`min_${filters.amountMin}`);
  if (filters.amountMax) filterInfo.push(`max_${filters.amountMax}`);

  const finalFilename = filterInfo.length > 0 
    ? `${filename}_${filterInfo.join('_')}` 
    : filename;

  exportPaymentsToExcel(payments, finalFilename);
}; 