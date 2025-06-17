import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Filter, X } from 'lucide-react';

export interface PropertyFilters {
  status: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  bathrooms: string;
  minSquareMeters: string;
  maxSquareMeters: string;
}

interface PropertyFiltersProps {
  filters: PropertyFilters;
  onFiltersChange: (filters: PropertyFilters) => void;
  onClearFilters: () => void;
}

export const PropertyFilters = ({ filters, onFiltersChange, onClearFilters }: PropertyFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key: keyof PropertyFilters, value: any) => {
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
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    if (filters.bedrooms && filters.bedrooms !== 'all') count++;
    if (filters.bathrooms && filters.bathrooms !== 'all') count++;
    if (filters.minSquareMeters) count++;
    if (filters.maxSquareMeters) count++;
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
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Rented">Rented</SelectItem>
                  <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price Range Filters */}
            <div className="space-y-2">
              <Label>Price Range (TZS)</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Min"
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                />
                <Input
                  placeholder="Max"
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                />
              </div>
            </div>

            {/* Bedrooms Filter */}
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Select
                value={filters.bedrooms}
                onValueChange={(value) => handleFilterChange('bedrooms', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any bedrooms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any bedrooms</SelectItem>
                  <SelectItem value="0">Studio (0)</SelectItem>
                  <SelectItem value="1">1 Bedroom</SelectItem>
                  <SelectItem value="2">2 Bedrooms</SelectItem>
                  <SelectItem value="3">3 Bedrooms</SelectItem>
                  <SelectItem value="4">4+ Bedrooms</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bathrooms Filter */}
            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Select
                value={filters.bathrooms}
                onValueChange={(value) => handleFilterChange('bathrooms', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any bathrooms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any bathrooms</SelectItem>
                  <SelectItem value="1">1 Bathroom</SelectItem>
                  <SelectItem value="2">2 Bathrooms</SelectItem>
                  <SelectItem value="3">3+ Bathrooms</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Square Meters Range Filters */}
            <div className="space-y-2">
              <Label>Square Meters Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Min"
                  type="number"
                  value={filters.minSquareMeters}
                  onChange={(e) => handleFilterChange('minSquareMeters', e.target.value)}
                />
                <Input
                  placeholder="Max"
                  type="number"
                  value={filters.maxSquareMeters}
                  onChange={(e) => handleFilterChange('maxSquareMeters', e.target.value)}
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
          {(filters.minPrice || filters.maxPrice) && (
            <Badge variant="secondary" className="text-xs">
              Price: {filters.minPrice || '0'} - {filters.maxPrice || '∞'}
              <X
                className="ml-1 h-3 w-3 cursor-pointer"
                onClick={() => {
                  handleFilterChange('minPrice', '');
                  handleFilterChange('maxPrice', '');
                }}
              />
            </Badge>
          )}
          {filters.bedrooms && filters.bedrooms !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              {filters.bedrooms === '0' ? 'Studio' : `${filters.bedrooms} Bed`}
              <X
                className="ml-1 h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange('bedrooms', 'all')}
              />
            </Badge>
          )}
          {filters.bathrooms && filters.bathrooms !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              {filters.bathrooms} Bath
              <X
                className="ml-1 h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange('bathrooms', 'all')}
              />
            </Badge>
          )}
          {(filters.minSquareMeters || filters.maxSquareMeters) && (
            <Badge variant="secondary" className="text-xs">
              Size: {filters.minSquareMeters || '0'} - {filters.maxSquareMeters || '∞'} m²
              <X
                className="ml-1 h-3 w-3 cursor-pointer"
                onClick={() => {
                  handleFilterChange('minSquareMeters', '');
                  handleFilterChange('maxSquareMeters', '');
                }}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}; 