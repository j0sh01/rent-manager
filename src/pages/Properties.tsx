import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, Grid, List, Building, Edit, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import { getProperties, formatFrappeImageUrl, createProperty, updateProperty, FRAPPE_BASE_URL } from '@/Integration/frappe/client';
import { Property } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { PropertyFilters, PropertyFilters as PropertyFiltersType } from '@/components/PropertyFilters';

// Define form schema
const propertySchema = z.object({
  title: z.string().min(1, "Title is required"),
  location: z.string().min(1, "Location is required"),
  price_tzs: z.coerce.number().min(1, "Price is required"),
  bedrooms: z.coerce.number().min(0, "Bedrooms must be a positive number"),
  bathroom: z.coerce.number().min(0, "Bathrooms must be a positive number"),
  square_meters: z.coerce.number().min(0, "Square meters must be a positive number"),
  status: z.enum(["Available", "Rented", "Under Maintenance"]),
  description: z.string().optional(),
  image: z.instanceof(File).optional(),
  image_1: z.instanceof(File).optional(),
  image_2: z.instanceof(File).optional(),
  image_3: z.instanceof(File).optional(),
  image_4: z.instanceof(File).optional(),
});

export const Properties = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [filters, setFilters] = useState<PropertyFiltersType>({
    status: 'all',
    minPrice: '',
    maxPrice: '',
    bedrooms: 'all',
    bathrooms: 'all',
    minSquareMeters: '',
    maxSquareMeters: ''
  });
  const [imagePreviews, setImagePreviews] = useState<{
    image?: string;
    image_1?: string;
    image_2?: string;
    image_3?: string;
    image_4?: string;
  }>({});
  const { user, accessToken } = useAuth();

  const form = useForm<z.infer<typeof propertySchema>>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: "",
      location: "",
      price_tzs: 0,
      bedrooms: 0,
      bathroom: 0,
      square_meters: 0,
      status: "Available",
      description: "",
    },
  });

  // Reset form when selected property changes
  useEffect(() => {
    if (selectedProperty && isEditMode) {
      form.reset({
        title: selectedProperty.title || "",
        location: selectedProperty.location || "",
        price_tzs: selectedProperty.price_tzs || 0,
        bedrooms: selectedProperty.bedrooms || 0,
        bathroom: selectedProperty.bathroom || 0,
        square_meters: selectedProperty.square_meters || 0,
        status: selectedProperty.status || "Available",
        description: selectedProperty.description || "",
      });
      
      // Set existing image previews
      setImagePreviews({
        image: selectedProperty.image ? formatFrappeImageUrl(selectedProperty.image) : undefined,
        image_1: selectedProperty.image_1 ? formatFrappeImageUrl(selectedProperty.image_1) : undefined,
        image_2: selectedProperty.image_2 ? formatFrappeImageUrl(selectedProperty.image_2) : undefined,
        image_3: selectedProperty.image_3 ? formatFrappeImageUrl(selectedProperty.image_3) : undefined,
        image_4: selectedProperty.image_4 ? formatFrappeImageUrl(selectedProperty.image_4) : undefined,
      });
    } else if (!isEditMode) {
      form.reset({
        title: "",
        location: "",
        price_tzs: 0,
        bedrooms: 0,
        bathroom: 0,
        square_meters: 0,
        status: "Available",
        description: "",
      });
      setImagePreviews({});
    }
  }, [selectedProperty, isEditMode, form]);

  // Handle file selection and preview
  const handleFileSelect = (file: File | null, fieldName: string) => {
    if (file) {
      form.setValue(fieldName as any, file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreviews(prev => ({
        ...prev,
        [fieldName]: previewUrl
      }));
    }
  };

  // Clear image preview
  const clearImagePreview = (fieldName: string) => {
    setImagePreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[fieldName as keyof typeof newPreviews];
      return newPreviews;
    });
    form.setValue(fieldName as any, undefined);
  };

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(imagePreviews).forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [imagePreviews]);

  const { data: properties, isLoading, error, refetch } = useQuery({
    queryKey: ['properties'],
    queryFn: async (): Promise<Property[]> => {
      if (!accessToken) throw new Error('Not authenticated');
      return getProperties(accessToken);
    },
    enabled: !!accessToken,
    retry: 1
  });

  // Handle errors outside the useQuery options
  useEffect(() => {
    if (error) {
      console.error('Error fetching properties:', error);
      if (error && typeof error === 'object' && 'response' in error && 
          error.response && typeof error.response === 'object' && 'status' in error.response && 
          error.response.status === 401) {
        toast({
          title: "Authentication Error",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
      }
    }
  }, [error]);

  // Handle property card click
  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedProperty(null);
    setIsEditMode(false);
    form.reset({
      title: "",
      location: "",
      price_tzs: 0,
      bedrooms: 0,
      bathroom: 0,
      square_meters: 0,
      status: "Available",
      description: "",
      image: undefined,
      image_1: undefined,
      image_2: undefined,
      image_3: undefined,
      image_4: undefined,
    });
    setImagePreviews({});
  };

  // Handle new property button click
  const handleAddNewProperty = () => {
    setSelectedProperty(null);
    setIsEditMode(false);
    form.reset({
      title: "",
      location: "",
      price_tzs: 0,
      bedrooms: 0,
      bathroom: 0,
      square_meters: 0,
      status: "Available",
      description: "",
      image: undefined,
      image_1: undefined,
      image_2: undefined,
      image_3: undefined,
      image_4: undefined,
    });
    setImagePreviews({});
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: z.infer<typeof propertySchema>) => {
    try {
      console.log('=== PROPERTY SUBMISSION START ===');
      console.log('Form data received:', data);
      console.log('Is edit mode:', isEditMode);
      console.log('Selected property:', selectedProperty);
      
      // Show loading toast
      toast({
        title: isEditMode ? "Updating Property" : "Creating Property",
        description: `Please wait while we ${isEditMode ? 'update' : 'create'} your property...`,
      });
      
      // Prepare property data
      const propertyData: any = {
        title: data.title,
        location: data.location,
        price_tzs: data.price_tzs,
        bedrooms: data.bedrooms,
        bathroom: data.bathroom,
        square_meters: data.square_meters,
        status: data.status,
        description: data.description || "",
      };
      
      console.log('Initial property data:', propertyData);
      
      // If editing, add the property name and preserve existing images
      if (isEditMode && selectedProperty) {
        propertyData.name = selectedProperty.name;
        
        console.log('=== EDITING EXISTING PROPERTY ===');
        console.log('Property name:', selectedProperty.name);
        console.log('Selected property images:', {
          image: selectedProperty.image,
          image_1: selectedProperty.image_1,
          image_2: selectedProperty.image_2,
          image_3: selectedProperty.image_3,
          image_4: selectedProperty.image_4
        });
        console.log('Form data files:', {
          image: data.image,
          image_1: data.image_1,
          image_2: data.image_2,
          image_3: data.image_3,
          image_4: data.image_4
        });
        
        // Always preserve existing images unless new files are uploaded
        // This ensures we don't lose existing images during updates
        if (selectedProperty.image) {
          propertyData.image = selectedProperty.image;
          console.log('✅ Preserving existing main image:', selectedProperty.image);
        }
        if (selectedProperty.image_1) {
          propertyData.image_1 = selectedProperty.image_1;
          console.log('✅ Preserving existing image_1:', selectedProperty.image_1);
        }
        if (selectedProperty.image_2) {
          propertyData.image_2 = selectedProperty.image_2;
          console.log('✅ Preserving existing image_2:', selectedProperty.image_2);
        }
        if (selectedProperty.image_3) {
          propertyData.image_3 = selectedProperty.image_3;
          console.log('✅ Preserving existing image_3:', selectedProperty.image_3);
        }
        if (selectedProperty.image_4) {
          propertyData.image_4 = selectedProperty.image_4;
          console.log('✅ Preserving existing image_4:', selectedProperty.image_4);
        }
      }
      
      // Add new file objects if provided
      if (data.image) {
        propertyData.image = data.image;
        console.log('✅ Adding new main image:', data.image.name);
      }
      if (data.image_1) {
        propertyData.image_1 = data.image_1;
        console.log('✅ Adding new image_1:', data.image_1.name);
      }
      if (data.image_2) {
        propertyData.image_2 = data.image_2;
        console.log('✅ Adding new image_2:', data.image_2.name);
      }
      if (data.image_3) {
        propertyData.image_3 = data.image_3;
        console.log('✅ Adding new image_3:', data.image_3.name);
      }
      if (data.image_4) {
        propertyData.image_4 = data.image_4;
        console.log('✅ Adding new image_4:', data.image_4.name);
      }
      
      console.log('=== FINAL PROPERTY DATA ===');
      console.log('Property data to be sent:', {
        ...propertyData,
        image: propertyData.image ? (typeof propertyData.image === 'object' ? 'File object' : 'URL/Base64') : 'None',
        image_1: propertyData.image_1 ? (typeof propertyData.image_1 === 'object' ? 'File object' : 'URL/Base64') : 'None',
        image_2: propertyData.image_2 ? (typeof propertyData.image_2 === 'object' ? 'File object' : 'URL/Base64') : 'None',
        image_3: propertyData.image_3 ? (typeof propertyData.image_3 === 'object' ? 'File object' : 'URL/Base64') : 'None',
        image_4: propertyData.image_4 ? (typeof propertyData.image_4 === 'object' ? 'File object' : 'URL/Base64') : 'None',
      });
      
      // Create or update the property
      console.log('=== API CALL START ===');
      let result;
      if (isEditMode && selectedProperty) {
        console.log('🔄 Calling updateProperty API...');
        result = await updateProperty(accessToken, propertyData);
      } else {
        console.log('🆕 Calling createProperty API...');
        result = await createProperty(accessToken, propertyData);
      }
      
      console.log('=== API RESPONSE ===');
      console.log('API result:', result);
      
      // Handle the result
      if (!result.success) {
        console.log('❌ API call failed:', result.error);
        throw new Error(result.error || 'Failed to save property');
      }
      
      console.log('✅ API call successful:', result.data);
      
      console.log('🎉 Property saved successfully');
      toast({
        title: "Success",
        description: isEditMode ? "Property updated successfully" : "Property added successfully",
      });
      
      console.log('=== CLEANUP ===');
      setIsDialogOpen(false);
      form.reset();
      setImagePreviews({});
      refetch(); // Refresh the properties list
      console.log('✅ Form reset and dialog closed');
      console.log('=== PROPERTY SUBMISSION END ===');
    } catch (error) {
      console.log('=== ERROR OCCURRED ===');
      console.error(isEditMode ? 'Error updating property:' : 'Error adding property:', error);
      toast({
        title: "Error",
        description: isEditMode ? "Failed to update property. Please try again." : "Failed to add property. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Apply filters and search
  const filteredProperties = properties?.filter(property => {
    // Search filter
    const searchMatch = property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       property.location?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!searchMatch) return false;

    // Status filter
    if (filters.status !== 'all' && property.status !== filters.status) {
      return false;
    }

    // Price range filters
    const price = property.price_tzs || 0;
    
    if (filters.minPrice && price < parseFloat(filters.minPrice)) {
      return false;
    }

    if (filters.maxPrice && price > parseFloat(filters.maxPrice)) {
      return false;
    }

    // Bedrooms filter
    if (filters.bedrooms !== 'all') {
      const propertyBedrooms = property.bedrooms || 0;
      const filterBedrooms = parseInt(filters.bedrooms);
      
      if (filters.bedrooms === '4' && propertyBedrooms < 4) {
        return false;
      } else if (propertyBedrooms !== filterBedrooms) {
        return false;
      }
    }

    // Bathrooms filter
    if (filters.bathrooms !== 'all') {
      const propertyBathrooms = property.bathroom || 0;
      const filterBathrooms = parseInt(filters.bathrooms);
      
      if (filters.bathrooms === '3' && propertyBathrooms < 3) {
        return false;
      } else if (propertyBathrooms !== filterBathrooms) {
        return false;
      }
    }

    // Square meters range filters
    const squareMeters = property.square_meters || 0;
    
    if (filters.minSquareMeters && squareMeters < parseFloat(filters.minSquareMeters)) {
      return false;
    }

    if (filters.maxSquareMeters && squareMeters > parseFloat(filters.maxSquareMeters)) {
      return false;
    }

    return true;
  }) || [];

  const handleFiltersChange = (newFilters: PropertyFiltersType) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      status: 'all',
      minPrice: '',
      maxPrice: '',
      bedrooms: 'all',
      bathrooms: 'all',
      minSquareMeters: '',
      maxSquareMeters: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800';
      case 'Rented':
        return 'bg-blue-100 text-blue-800';
      case 'Under Maintenance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // List view rendering function
  const renderListView = () => (
    <div className="space-y-4">
      {filteredProperties.map((property) => (
        <Card 
          key={property.name} 
          className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
          onClick={() => handlePropertyClick(property)}
        >
          <div className="flex flex-col md:flex-row h-48">
            {property.image && (
              <div className="w-full md:w-1/3 h-48 md:h-full">
                <img 
                  src={formatFrappeImageUrl(property.image)} 
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-gray-900 truncate">{property.title}</h3>
                    <p className="text-sm text-gray-600 truncate">{property.location}</p>
                  </div>
                  <Badge className={getStatusColor(property.status)}>
                    {property.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="text-sm">
                    <span className="text-gray-600 block">Square Meters</span>
                    <span className="font-medium">{property.square_meters}</span>
                  </div>
                  {property.bedrooms !== undefined && (
                    <div className="text-sm">
                      <span className="text-gray-600 block">Bedrooms</span>
                      <span className="font-medium">{property.bedrooms}</span>
                    </div>
                  )}
                  {property.bathroom && (
                    <div className="text-sm">
                      <span className="text-gray-600 block">Bathrooms</span>
                      <span className="font-medium">{property.bathroom}</span>
                    </div>
                  )}
                  <div className="text-sm">
                    <span className="text-gray-600 block">Price</span>
                    <span className="font-bold text-green-600">
                      TZS {property.price_tzs?.toLocaleString()}/mo
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          if (open) {
            // Opening the dialog - set up for adding new property
            handleAddNewProperty();
          } else {
            // Closing the dialog
            handleDialogClose();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isEditMode ? 'Edit Property' : 'Add New Property'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" {...form.register("title")} />
                  {form.formState.errors.title && (
                    <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" {...form.register("location")} />
                  {form.formState.errors.location && (
                    <p className="text-sm text-red-500">{form.formState.errors.location.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="price_tzs">Price (TZS)</Label>
                  <Input id="price_tzs" type="number" {...form.register("price_tzs")} />
                  {form.formState.errors.price_tzs && (
                    <p className="text-sm text-red-500">{form.formState.errors.price_tzs.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="status">Status</Label>
                  <select 
                    id="status" 
                    {...form.register("status")}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="Available">Available</option>
                    <option value="Rented">Rented</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input id="bedrooms" type="number" {...form.register("bedrooms")} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="bathroom">Bathrooms</Label>
                  <Input id="bathroom" type="number" {...form.register("bathroom")} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="square_meters">Square Meters</Label>
                  <Input id="square_meters" type="number" {...form.register("square_meters")} />
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="space-y-3">
                <h3 className="text-base font-medium">Images</h3>
                
                {/* Main Image */}
                <div className="space-y-1">
                  <Label htmlFor="image">Main Image</Label>
                  <div className="flex items-center space-x-3">
                    <Input 
                      id="image" 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        handleFileSelect(file, 'image');
                      }}
                    />
                    {imagePreviews.image && (
                      <div className="relative">
                        <img 
                          src={imagePreviews.image} 
                          alt="Main image preview" 
                          className="w-16 h-16 object-cover rounded border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-1 -right-1 h-5 w-5 p-0"
                          onClick={() => clearImagePreview('image')}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Images */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="image_1">Additional Image 1</Label>
                    <div className="flex items-center space-x-3">
                      <Input 
                        id="image_1" 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          handleFileSelect(file, 'image_1');
                        }}
                      />
                      {imagePreviews.image_1 && (
                        <div className="relative">
                          <img 
                            src={imagePreviews.image_1} 
                            alt="Image 1 preview" 
                            className="w-16 h-16 object-cover rounded border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-1 -right-1 h-5 w-5 p-0"
                            onClick={() => clearImagePreview('image_1')}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="image_2">Additional Image 2</Label>
                    <div className="flex items-center space-x-3">
                      <Input 
                        id="image_2" 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          handleFileSelect(file, 'image_2');
                        }}
                      />
                      {imagePreviews.image_2 && (
                        <div className="relative">
                          <img 
                            src={imagePreviews.image_2} 
                            alt="Image 2 preview" 
                            className="w-16 h-16 object-cover rounded border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-1 -right-1 h-5 w-5 p-0"
                            onClick={() => clearImagePreview('image_2')}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="image_3">Additional Image 3</Label>
                    <div className="flex items-center space-x-3">
                      <Input 
                        id="image_3" 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          handleFileSelect(file, 'image_3');
                        }}
                      />
                      {imagePreviews.image_3 && (
                        <div className="relative">
                          <img 
                            src={imagePreviews.image_3} 
                            alt="Image 3 preview" 
                            className="w-16 h-16 object-cover rounded border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-1 -right-1 h-5 w-5 p-0"
                            onClick={() => clearImagePreview('image_3')}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="image_4">Additional Image 4</Label>
                    <div className="flex items-center space-x-3">
                      <Input 
                        id="image_4" 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          handleFileSelect(file, 'image_4');
                        }}
                      />
                      {imagePreviews.image_4 && (
                        <div className="relative">
                          <img 
                            src={imagePreviews.image_4} 
                            alt="Image 4 preview" 
                            className="w-16 h-16 object-cover rounded border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-1 -right-1 h-5 w-5 p-0"
                            onClick={() => clearImagePreview('image_4')}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="description">Description</Label>
                <textarea 
                  id="description" 
                  {...form.register("description")}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-20"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-3">
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {isEditMode ? 'Update Property' : 'Save Property'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <PropertyFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
          />
          <div className="flex rounded-lg border border-gray-300">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <Card 
              key={property.name} 
              className="hover:shadow-lg transition-shadow duration-200 cursor-pointer overflow-hidden"
              onClick={() => handlePropertyClick(property)}
            >
              {property.image && (
                <div className="h-48 relative">
                  <img 
                    src={formatFrappeImageUrl(property.image)} 
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                      {property.title}
                    </CardTitle>
                    <p className="text-sm text-gray-600">{property.location}</p>
                  </div>
                  <Badge className={getStatusColor(property.status)}>
                    {property.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Square Meters:</span>
                    <span className="font-medium">{property.square_meters}</span>
                  </div>
                  {property.bedrooms !== undefined && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Bedrooms:</span>
                      <span className="font-medium">{property.bedrooms}</span>
                    </div>
                  )}
                  {property.bathroom && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Bathrooms:</span>
                      <span className="font-medium">{property.bathroom}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm pt-2 border-t">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-bold text-lg text-green-600">
                      TZS {property.price_tzs?.toLocaleString()}/mo
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        renderListView()
      )}

      {filteredProperties.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Building className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first property.'}
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </div>
      )}
    </div>
  );
};
