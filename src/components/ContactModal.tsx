import { useState } from 'react';
import { X, Mail, Phone, ExternalLink, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tenant } from '@/types';
import { toast } from '@/components/ui/sonner';

interface ContactModalProps {
  tenant: Tenant | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal = ({ tenant, isOpen, onClose }: ContactModalProps) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen || !tenant) return null;

  const hasEmail = tenant.email && tenant.email.trim() !== '';
  const hasPhone = tenant.phone && tenant.phone.trim() !== '';
  const contactOptions = [];

  if (hasEmail) contactOptions.push('email');
  if (hasPhone) contactOptions.push('phone');

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(`${field === 'email' ? 'Email' : 'Phone'} copied to clipboard`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const openEmail = () => {
    if (hasEmail) {
      window.open(`mailto:${tenant.email}`, '_blank');
    }
  };

  const openPhone = () => {
    if (hasPhone) {
      window.open(`tel:${tenant.phone}`, '_blank');
    }
  };

  const handleClose = () => {
    setCopiedField(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="h-4 w-4 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Contact {tenant.full_name}</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          {contactOptions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <Mail className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Contact Information</h3>
              <p className="text-gray-600">
                This tenant doesn't have any contact information available.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {hasEmail && (
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-lg">Email</CardTitle>
                      </div>
                      <Badge variant="secondary">Primary</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-600 break-all">{tenant.email}</p>
                    <div className="flex space-x-2">
                      <Button
                        onClick={openEmail}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => copyToClipboard(tenant.email!, 'email')}
                        className="px-3"
                      >
                        {copiedField === 'email' ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {hasPhone && (
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Phone className="h-5 w-5 text-green-600" />
                        <CardTitle className="text-lg">Phone</CardTitle>
                      </div>
                      <Badge variant="secondary">Call</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-600">{tenant.phone}</p>
                    <div className="flex space-x-2">
                      <Button
                        onClick={openPhone}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Call Now
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => copyToClipboard(tenant.phone!, 'phone')}
                        className="px-3"
                      >
                        {copiedField === 'phone' ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <div className="flex justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleClose}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}; 