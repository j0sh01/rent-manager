import { useState } from 'react';
import { Filter, X, Calendar as CalendarIcon, CreditCard, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

export interface PaymentFilters {
  search: string;
  status: string;
  paymentMethod: string;
  paymentType: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  amountMin: string;
  amountMax: string;
}

interface PaymentFiltersProps {
  filters: PaymentFilters;
  onFiltersChange: (filters: PaymentFilters) => void;
  onClearFilters: () => void;
}

export const PaymentFilters = ({ filters, onFiltersChange, onClearFilters }: PaymentFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key: keyof PaymentFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const hasActiveFilters = filters.status !== 'all' || 
                          filters.paymentMethod !== 'all' || 
                          filters.paymentType !== 'all' || 
                          filters.dateFrom || 
                          filters.dateTo ||
                          filters.amountMin !== '' ||
                          filters.amountMax !== '';

  const clearFilters = () => {
    onClearFilters();
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Filter className="h-4 w-4" />
          {hasActiveFilters && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 text-xs flex items-center justify-center"
            >
              !
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Filter Payments</h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs text-red-600 hover:text-red-700"
              >
                <X className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            )}
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium">Status</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
                <SelectItem value="Refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Method Filter */}
          <div className="space-y-2">
            <Label htmlFor="paymentMethod" className="text-sm font-medium">Payment Method</Label>
            <Select
              value={filters.paymentMethod}
              onValueChange={(value) => handleFilterChange('paymentMethod', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All methods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All methods</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Check">Check</SelectItem>
                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                <SelectItem value="Credit Card">Credit Card</SelectItem>
                <SelectItem value="Online Payment">Online Payment</SelectItem>
                <SelectItem value="ACH">ACH</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Type Filter */}
          <div className="space-y-2">
            <Label htmlFor="paymentType" className="text-sm font-medium">Payment Type</Label>
            <Select
              value={filters.paymentType}
              onValueChange={(value) => handleFilterChange('paymentType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="Rent">Rent</SelectItem>
                <SelectItem value="Security Deposit">Security Deposit</SelectItem>
                <SelectItem value="Late Fee">Late Fee</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amount Range Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Amount Range (TZS)</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Min</Label>
                <div className="relative">
                  <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.amountMin}
                    onChange={(e) => handleFilterChange('amountMin', e.target.value)}
                    className="w-full pl-6 pr-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Max</Label>
                <div className="relative">
                  <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                  <input
                    type="number"
                    placeholder="∞"
                    value={filters.amountMax}
                    onChange={(e) => handleFilterChange('amountMax', e.target.value)}
                    className="w-full pl-6 pr-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Date Range Filters */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Payment Date Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">From</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-3 w-3" />
                      {filters.dateFrom ? (
                        filters.dateFrom.toLocaleDateString()
                      ) : (
                        <span className="text-gray-500">Select date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateFrom}
                      onSelect={(date) => handleFilterChange('dateFrom', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">To</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-3 w-3" />
                      {filters.dateTo ? (
                        filters.dateTo.toLocaleDateString()
                      ) : (
                        <span className="text-gray-500">Select date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateTo}
                      onSelect={(date) => handleFilterChange('dateTo', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="pt-2 border-t">
              <Label className="text-xs text-gray-500 mb-2 block">Active Filters:</Label>
              <div className="flex flex-wrap gap-1">
                {filters.status !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    Status: {filters.status}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-3 w-3 p-0 ml-1 hover:bg-transparent"
                      onClick={() => handleFilterChange('status', 'all')}
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </Badge>
                )}
                {filters.paymentMethod !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    Method: {filters.paymentMethod}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-3 w-3 p-0 ml-1 hover:bg-transparent"
                      onClick={() => handleFilterChange('paymentMethod', 'all')}
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </Badge>
                )}
                {filters.paymentType !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    Type: {filters.paymentType}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-3 w-3 p-0 ml-1 hover:bg-transparent"
                      onClick={() => handleFilterChange('paymentType', 'all')}
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </Badge>
                )}
                {filters.amountMin !== '' && (
                  <Badge variant="secondary" className="text-xs">
                    Min: TZS {parseInt(filters.amountMin).toLocaleString()}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-3 w-3 p-0 ml-1 hover:bg-transparent"
                      onClick={() => handleFilterChange('amountMin', '')}
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </Badge>
                )}
                {filters.amountMax !== '' && (
                  <Badge variant="secondary" className="text-xs">
                    Max: TZS {parseInt(filters.amountMax).toLocaleString()}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-3 w-3 p-0 ml-1 hover:bg-transparent"
                      onClick={() => handleFilterChange('amountMax', '')}
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </Badge>
                )}
                {filters.dateFrom && (
                  <Badge variant="secondary" className="text-xs">
                    From: {filters.dateFrom.toLocaleDateString()}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-3 w-3 p-0 ml-1 hover:bg-transparent"
                      onClick={() => handleFilterChange('dateFrom', undefined)}
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </Badge>
                )}
                {filters.dateTo && (
                  <Badge variant="secondary" className="text-xs">
                    To: {filters.dateTo.toLocaleDateString()}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-3 w-3 p-0 ml-1 hover:bg-transparent"
                      onClick={() => handleFilterChange('dateTo', undefined)}
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </Badge>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              Close
            </Button>
            {hasActiveFilters && (
              <Button
                size="sm"
                onClick={clearFilters}
                className="bg-red-600 hover:bg-red-700"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}; 