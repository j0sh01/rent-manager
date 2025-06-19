import { useState, useEffect } from 'react';
import { X, Save, Building, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createProperty, formatFrappeImageUrl } from '@/Integration/frappe/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

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

interface CreatePropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreatePropertyModal = ({ isOpen, onClose, onSuccess }: CreatePropertyModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<{
    image?: string;
    image_1?: string;
    image_2?: string;
    image_3?: string;
    image_4?: string;
  }>({});
  const { accessToken } = useAuth();

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

  const handleSubmit = async (data: z.infer<typeof propertySchema>) => {
    try {
      setIsLoading(true);
      
      // Show loading toast
      toast({
        title: "Creating Property",
        description: "Please wait while we create your property...",
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
      
      // Add new file objects if provided
      if (data.image) {
        propertyData.image = data.image;
      }
      if (data.image_1) {
        propertyData.image_1 = data.image_1;
      }
      if (data.image_2) {
        propertyData.image_2 = data.image_2;
      }
      if (data.image_3) {
        propertyData.image_3 = data.image_3;
      }
      if (data.image_4) {
        propertyData.image_4 = data.image_4;
      }
      
      // Create the property
      const result = await createProperty(accessToken!, propertyData);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to save property');
      }
      
      toast({
        title: "Success",
        description: "Property added successfully",
      });
      
      // Reset form and close modal
      form.reset();
      setImagePreviews({});
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error adding property:', error);
      toast({
        title: "Error",
        description: "Failed to add property. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      form.reset();
      setImagePreviews({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Building className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Add New Property</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Property Title *</Label>
                    <Input
                      id="title"
                      {...form.register("title")}
                      className={form.formState.errors.title ? 'border-red-500' : ''}
                      disabled={isLoading}
                      placeholder="Enter property title"
                    />
                    {form.formState.errors.title && (
                      <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      {...form.register("location")}
                      className={form.formState.errors.location ? 'border-red-500' : ''}
                      disabled={isLoading}
                      placeholder="Enter property location"
                    />
                    {form.formState.errors.location && (
                      <p className="text-sm text-red-500">{form.formState.errors.location.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price_tzs">Price (TZS) *</Label>
                    <Input
                      id="price_tzs"
                      type="number"
                      {...form.register("price_tzs")}
                      className={form.formState.errors.price_tzs ? 'border-red-500' : ''}
                      disabled={isLoading}
                      placeholder="Enter monthly rent"
                    />
                    {form.formState.errors.price_tzs && (
                      <p className="text-sm text-red-500">{form.formState.errors.price_tzs.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select
                      value={form.watch("status")}
                      onValueChange={(value) => form.setValue("status", value as any)}
                      disabled={isLoading}
                    >
                      <SelectTrigger className={form.formState.errors.status ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Available">Available</SelectItem>
                        <SelectItem value="Rented">Rented</SelectItem>
                        <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.status && (
                      <p className="text-sm text-red-500">{form.formState.errors.status.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Bedrooms</Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      {...form.register("bedrooms")}
                      className={form.formState.errors.bedrooms ? 'border-red-500' : ''}
                      disabled={isLoading}
                      placeholder="Number of bedrooms"
                    />
                    {form.formState.errors.bedrooms && (
                      <p className="text-sm text-red-500">{form.formState.errors.bedrooms.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bathroom">Bathrooms</Label>
                    <Input
                      id="bathroom"
                      type="number"
                      {...form.register("bathroom")}
                      className={form.formState.errors.bathroom ? 'border-red-500' : ''}
                      disabled={isLoading}
                      placeholder="Number of bathrooms"
                    />
                    {form.formState.errors.bathroom && (
                      <p className="text-sm text-red-500">{form.formState.errors.bathroom.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="square_meters">Square Meters</Label>
                    <Input
                      id="square_meters"
                      type="number"
                      {...form.register("square_meters")}
                      className={form.formState.errors.square_meters ? 'border-red-500' : ''}
                      disabled={isLoading}
                      placeholder="Property size"
                    />
                    {form.formState.errors.square_meters && (
                      <p className="text-sm text-red-500">{form.formState.errors.square_meters.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...form.register("description")}
                    disabled={isLoading}
                    placeholder="Enter property description"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Property Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Main Image */}
                  <div className="space-y-2">
                    <Label>Main Image</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      {imagePreviews.image ? (
                        <div className="relative">
                          <img
                            src={imagePreviews.image}
                            alt="Preview"
                            className="w-full h-32 object-cover rounded"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1"
                            onClick={() => clearImagePreview('image')}
                            disabled={isLoading}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileSelect(e.target.files?.[0] || null, 'image')}
                            className="hidden"
                            id="image-upload"
                            disabled={isLoading}
                          />
                          <label
                            htmlFor="image-upload"
                            className="cursor-pointer text-blue-600 hover:text-blue-700"
                          >
                            Upload Image
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Additional Images */}
                  {[1, 2, 3, 4].map((num) => (
                    <div key={num} className="space-y-2">
                      <Label>Image {num}</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        {imagePreviews[`image_${num}` as keyof typeof imagePreviews] ? (
                          <div className="relative">
                            <img
                              src={imagePreviews[`image_${num}` as keyof typeof imagePreviews]}
                              alt={`Preview ${num}`}
                              className="w-full h-32 object-cover rounded"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1"
                              onClick={() => clearImagePreview(`image_${num}`)}
                              disabled={isLoading}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileSelect(e.target.files?.[0] || null, `image_${num}`)}
                              className="hidden"
                              id={`image-${num}-upload`}
                              disabled={isLoading}
                            />
                            <label
                              htmlFor={`image-${num}-upload`}
                              className="cursor-pointer text-blue-600 hover:text-blue-700"
                            >
                              Upload Image
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-end space-x-3 p-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Save className="h-4 w-4" />
                  <span>Create Property</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}; 