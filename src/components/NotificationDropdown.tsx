import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, AlertCircle, Mail, Settings, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/hooks/useAuth';
import { Notification } from '@/types';
import { toast } from '@/components/ui/sonner';

export const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      const data = await apiClient.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleMarkAsRead = async (notification: Notification) => {
    if (notification.read === 1) return;
    
    try {
      const result = await apiClient.markNotificationAsRead(notification.name);
      if (result.success) {
        setNotifications(prev => 
          prev.filter(n => n.name !== notification.name)
        );
        toast.success('Notification marked as read');
      } else {
        toast.error(result.error || 'Failed to mark notification as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const result = await apiClient.markAllNotificationsAsRead();
      if (result.success) {
        // Clear all notifications from the list since we only fetch unread ones
        setNotifications([]);
        if (result.error) {
          // Partial success - some notifications were marked as read
          toast.success(result.error);
        } else {
          toast.success('All notifications marked as read');
        }
      } else {
        toast.error(result.error || 'Failed to mark all notifications as read');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'Alert':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'Email':
        return <Mail className="h-4 w-4 text-blue-500" />;
      case 'System':
        return <Settings className="h-4 w-4 text-gray-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => n.read === 0).length;

  // Only show unread notifications in the list
  const unreadNotifications = notifications.filter(n => n.read === 0);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto" align="end" forceMount>
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              Mark all as read
            </Button>
          )}
        </div>
        
        {isLoading ? (
          <div className="p-4 text-center text-sm text-gray-500">
            Loading notifications...
          </div>
        ) : unreadNotifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            No notifications
          </div>
        ) : (
          <div className="max-h-64 overflow-y-auto">
            {unreadNotifications.map((notification) => (
              <DropdownMenuItem
                key={notification.name}
                className="p-3 cursor-pointer hover:bg-gray-50 bg-blue-50"
                onClick={() => handleMarkAsRead(notification)}
              >
                <div className="flex items-start space-x-3 w-full">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.subject}
                      </p>
                      <div className="flex items-center space-x-1 ml-2">
                        <Check className="h-3 w-3 text-blue-500" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {notification.email_content}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimeAgo(notification.creation)}</span>
                      </div>
                      {notification.document_type && (
                        <Badge variant="outline" className="text-xs">
                          {notification.document_type}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
        
        {unreadNotifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-gray-600 hover:text-gray-800"
                onClick={() => {
                  // TODO: Navigate to notifications page
                  setIsOpen(false);
                }}
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}; 