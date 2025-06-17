import { useState } from 'react';
import { Filter, X, Calendar as CalendarIcon, User, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

export interface TenantFilters {
  search: string;
  status: string;
  userType: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
}

interface TenantFiltersProps {
  filters: TenantFilters;
  onFiltersChange: (filters: TenantFilters) => void;
  onClearFilters: () => void;
}

export const TenantFilters = ({ filters, onFiltersChange, onClearFilters }: TenantFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key: keyof TenantFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const hasActiveFilters = filters.status !== 'all' || 
                          filters.userType !== 'all' || 
                          filters.dateFrom || 
                          filters.dateTo;

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
            <h3 className="font-semibold text-sm">Filter Tenants</h3>
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* User Type Filter */}
          <div className="space-y-2">
            <Label htmlFor="userType" className="text-sm font-medium">User Type</Label>
            <Select
              value={filters.userType}
              onValueChange={(value) => handleFilterChange('userType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All user types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All user types</SelectItem>
                <SelectItem value="Website User">Website User</SelectItem>
                <SelectItem value="System User">System User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filters */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Created Date Range</Label>
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
                    Status: {filters.status === 'active' ? 'Active' : 'Inactive'}
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
                {filters.userType !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    Type: {filters.userType}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-3 w-3 p-0 ml-1 hover:bg-transparent"
                      onClick={() => handleFilterChange('userType', 'all')}
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