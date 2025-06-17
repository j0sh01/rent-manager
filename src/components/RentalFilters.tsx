import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Filter, X, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export interface RentalFilters {
  status: string;
  propertyType: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  minRent: string;
  maxRent: string;
}

interface RentalFiltersProps {
  filters: RentalFilters;
  onFiltersChange: (filters: RentalFilters) => void;
  onClearFilters: () => void;
}

export const RentalFilters = ({ filters, onFiltersChange, onClearFilters }: RentalFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key: keyof RentalFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== undefined && value !== null
  );

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.status && filters.status !== 'all') count++;
    if (filters.propertyType && filters.propertyType !== 'all') count++;
    if (filters.startDate) count++;
    if (filters.endDate) count++;
    if (filters.minRent) count++;
    if (filters.maxRent) count++;
    return count;
  };

  return (
    <div className="flex items-center space-x-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="relative">
            <Filter className="h-4 w-4" />
            {hasActiveFilters && (
              <Badge 
                variant="secondary" 
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
              >
                {getActiveFiltersCount()}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filters</h4>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearFilters}
                  className="h-auto p-0 text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear all
                </Button>
              )}
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                  <SelectItem value="Terminated">Terminated</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Property Type Filter */}
            <div className="space-y-2">
              <Label htmlFor="propertyType">Property Type</Label>
              <Select
                value={filters.propertyType}
                onValueChange={(value) => handleFilterChange('propertyType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="Apartment">Apartment</SelectItem>
                  <SelectItem value="House">House</SelectItem>
                  <SelectItem value="Studio">Studio</SelectItem>
                  <SelectItem value="Commercial">Commercial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filters */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filters.startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.startDate ? format(filters.startDate, "PPP") : "Pick date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.startDate}
                      onSelect={(date) => handleFilterChange('startDate', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filters.endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.endDate ? format(filters.endDate, "PPP") : "Pick date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.endDate}
                      onSelect={(date) => handleFilterChange('endDate', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Rent Range Filters */}
            <div className="space-y-2">
              <Label>Monthly Rent Range (TZS)</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Min"
                  type="number"
                  value={filters.minRent}
                  onChange={(e) => handleFilterChange('minRent', e.target.value)}
                />
                <Input
                  placeholder="Max"
                  type="number"
                  value={filters.maxRent}
                  onChange={(e) => handleFilterChange('maxRent', e.target.value)}
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div className="flex items-center space-x-1">
          {filters.status && filters.status !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              Status: {filters.status}
              <X
                className="ml-1 h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange('status', 'all')}
              />
            </Badge>
          )}
          {filters.propertyType && filters.propertyType !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              Type: {filters.propertyType}
              <X
                className="ml-1 h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange('propertyType', 'all')}
              />
            </Badge>
          )}
          {filters.startDate && (
            <Badge variant="secondary" className="text-xs">
              From: {format(filters.startDate, "MMM dd")}
              <X
                className="ml-1 h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange('startDate', undefined)}
              />
            </Badge>
          )}
          {filters.endDate && (
            <Badge variant="secondary" className="text-xs">
              To: {format(filters.endDate, "MMM dd")}
              <X
                className="ml-1 h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange('endDate', undefined)}
              />
            </Badge>
          )}
          {(filters.minRent || filters.maxRent) && (
            <Badge variant="secondary" className="text-xs">
              Rent: {filters.minRent || '0'} - {filters.maxRent || '∞'}
              <X
                className="ml-1 h-3 w-3 cursor-pointer"
                onClick={() => {
                  handleFilterChange('minRent', '');
                  handleFilterChange('maxRent', '');
                }}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}; 