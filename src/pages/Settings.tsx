
import { useState } from 'react';
import { Save, User, Bell, Shield, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

export const Settings = () => {
  const [settings, setSettings] = useState({
    companyName: 'RentPro Management',
    email: 'admin@rentpro.com',
    phone: '+1 (555) 123-4567',
    address: '123 Business Ave, Suite 100, City, State 12345',
    notifications: {
      paymentReminders: true,
      leaseExpirations: true,
      maintenanceRequests: true,
      emailReports: true,
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
    },
  });

  const handleSave = () => {
    console.log('Saving settings:', settings);
    // Mock save operation
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="paymentReminders"
                checked={settings.notifications.paymentReminders}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, paymentReminders: !!checked },
                  })
                }
              />
              <Label htmlFor="paymentReminders">Payment Reminders</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="leaseExpirations"
                checked={settings.notifications.leaseExpirations}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, leaseExpirations: !!checked },
                  })
                }
              />
              <Label htmlFor="leaseExpirations">Lease Expirations</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="maintenanceRequests"
                checked={settings.notifications.maintenanceRequests}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, maintenanceRequests: !!checked },
                  })
                }
              />
              <Label htmlFor="maintenanceRequests">Maintenance Requests</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="emailReports"
                checked={settings.notifications.emailReports}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, emailReports: !!checked },
                  })
                }
              />
              <Label htmlFor="emailReports">Email Reports</Label>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="twoFactorAuth"
                checked={settings.security.twoFactorAuth}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    security: { ...settings.security, twoFactorAuth: !!checked },
                  })
                }
              />
              <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
            </div>
            <div>
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.security.sessionTimeout}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    security: { ...settings.security, sessionTimeout: parseInt(e.target.value) },
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Button variant="outline" className="w-full">
                Export All Data
              </Button>
              <Button variant="outline" className="w-full">
                Import Data
              </Button>
              <Button variant="outline" className="w-full">
                Backup Database
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
