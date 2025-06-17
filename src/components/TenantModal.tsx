import { useState, useEffect } from 'react';
import { X, Save, User, Mail, Phone, Shield, Calendar, Edit, Eye, EyeOff, Lock, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tenant } from '@/types';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/sonner';

interface TenantModalProps {
  tenant: Tenant | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const TenantModal = ({ tenant, isOpen, onClose, onUpdate }: TenantModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    new_password: '',
    confirm_password: ''
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    enabled: 1,
    user_type: 'Website User'
  });
  const { accessToken } = useAuth();

  useEffect(() => {
    if (tenant) {
      setFormData({
        full_name: tenant.full_name || '',
        email: tenant.email || '',
        phone: tenant.phone || '',
        enabled: tenant.enabled || 0,
        user_type: tenant.user_type || 'Website User'
      });
      setIsEditing(false);
    }
  }, [tenant]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!tenant || !accessToken) return;

    setIsLoading(true);
    try {
      const result = await apiClient.updateDoc('Tenant', tenant.name, formData);
      
      if (result.success) {
        toast.success('Tenant updated successfully');
        setIsEditing(false);
        onUpdate();
      } else {
        toast.error(result.error || 'Failed to update tenant');
      }
    } catch (error) {
      console.error('Error updating tenant:', error);
      toast.error('Failed to update tenant');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!tenant || !accessToken) return;

    setIsLoading(true);
    try {
      const newStatus = formData.enabled ? 0 : 1;
      const result = await apiClient.updateDoc('Tenant', tenant.name, { enabled: newStatus });
      
      if (result.success) {
        setFormData(prev => ({ ...prev, enabled: newStatus }));
        toast.success(`Tenant ${newStatus ? 'activated' : 'deactivated'} successfully`);
        onUpdate();
      } else {
        toast.error(result.error || 'Failed to update tenant status');
      }
    } catch (error) {
      console.error('Error updating tenant status:', error);
      toast.error('Failed to update tenant status');
    } finally {
      setIsLoading(false);
    }
  };

  const validatePassword = () => {
    const newErrors: Record<string, string> = {};

    if (!passwordData.new_password.trim()) {
      newErrors.new_password = 'New password is required';
    } else if (passwordData.new_password.length < 8) {
      newErrors.new_password = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.new_password)) {
      newErrors.new_password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (!passwordData.confirm_password.trim()) {
      newErrors.confirm_password = 'Please confirm your password';
    } else if (passwordData.new_password !== passwordData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (passwordErrors[field]) {
      setPasswordErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handlePasswordReset = async () => {
    if (!tenant || !accessToken) return;

    if (!validatePassword()) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await apiClient.updateDoc('Tenant', tenant.name, { 
        new_password: passwordData.new_password 
      });
      
      if (result.success) {
        toast.success('Password reset successfully');
        setPasswordData({ new_password: '', confirm_password: '' });
        setPasswordErrors({});
        setShowPasswordReset(false);
      } else {
        toast.error(result.error || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  if (!isOpen || !tenant) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <User className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Edit Tenant Profile' : 'Tenant Profile'}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                disabled={isLoading}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Section */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Account Status</CardTitle>
                <Badge className={formData.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {formData.enabled ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    {formData.enabled 
                      ? 'This tenant can access the system and perform actions.'
                      : 'This tenant is deactivated and cannot access the system.'
                    }
                  </p>
                </div>
                <Switch
                  checked={!!formData.enabled}
                  onCheckedChange={handleToggleStatus}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      className="pl-10"
                      disabled={!isEditing || isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="pl-10"
                      disabled={!isEditing || isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="pl-10"
                      disabled={!isEditing || isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user_type">User Type</Label>
                  <Select
                    value={formData.user_type}
                    onValueChange={(value) => handleInputChange('user_type', value)}
                    disabled={!isEditing || isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Website User">Website User</SelectItem>
                      <SelectItem value="System User">System User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>User ID</Label>
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                    <Shield className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-mono text-gray-700">{tenant.name}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Created Date</Label>
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{formatDate(tenant.creation)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Last Modified</Label>
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{formatDate(tenant.modified)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Current Role</Label>
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                    <Shield className="h-4 w-4 text-gray-400" />
                    <Badge variant="secondary">Tenant</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Password Reset Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Password Management</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPasswordReset(!showPasswordReset)}
                  disabled={isLoading}
                >
                  <Key className="h-4 w-4 mr-2" />
                  {showPasswordReset ? 'Cancel Reset' : 'Reset Password'}
                </Button>
              </div>
            </CardHeader>
            {showPasswordReset && (
              <CardContent className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Key className="h-4 w-4 text-yellow-600" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">Reset Password</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        This will reset the tenant's password. The new password will be immediately active.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new_password">New Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="new_password"
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordData.new_password}
                        onChange={(e) => handlePasswordChange('new_password', e.target.value)}
                        className={`pl-10 pr-10 ${passwordErrors.new_password ? 'border-red-500' : ''}`}
                        disabled={isLoading}
                        placeholder="Enter new password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        disabled={isLoading}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                    {passwordErrors.new_password && (
                      <p className="text-sm text-red-500">{passwordErrors.new_password}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      Must be at least 8 characters with uppercase, lowercase, and number
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">Confirm Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="confirm_password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordData.confirm_password}
                        onChange={(e) => handlePasswordChange('confirm_password', e.target.value)}
                        className={`pl-10 pr-10 ${passwordErrors.confirm_password ? 'border-red-500' : ''}`}
                        disabled={isLoading}
                        placeholder="Confirm new password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                    {passwordErrors.confirm_password && (
                      <p className="text-sm text-red-500">{passwordErrors.confirm_password}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPasswordReset(false);
                      setPasswordData({ new_password: '', confirm_password: '' });
                      setPasswordErrors({});
                    }}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handlePasswordReset}
                    disabled={isLoading}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Resetting...</span>
                      </div>
                    ) : (
                      <>
                        <Key className="h-4 w-4 mr-2" />
                        Reset Password
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 