import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, CheckCircle2, XCircle, MessageCircle, Building2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
// import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: string;
  data: {
    type: string;
    message: string;
    url?: string;
    [key: string]: any;
  };
  read_at: string | null;
  created_at: string;
}

export function NotificationBell() {
  const { props } = usePage<any>();
  const userId = props.auth?.user?.id;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const echoChannelRef = useRef<any>(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      // Limit to 20 notifications for the dropdown
      const response = await axios.get('/api/notifications', {
        params: { limit: 20 }
      });
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unread_count || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      // Don't show error to user, just log it
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await axios.post(`/api/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Dispatch custom event to update sidebar badge
      window.dispatchEvent(new CustomEvent('notification-read'));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await axios.post('/api/notifications/mark-all-read');
      setNotifications(prev =>
        prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
      );
      setUnreadCount(0);
      
      // Dispatch custom event to update sidebar badge
      window.dispatchEvent(new CustomEvent('notification-mark-all-read'));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read_at) {
      markAsRead(notification.id);
    }
    if (notification.data.url) {
      router.visit(notification.data.url);
      setOpen(false);
    }
  };

  // Initialize and set up real-time listener
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Fetch notifications on mount and when userId changes
    fetchNotifications();

    // Set up real-time listener
    const Echo = (window as any).Echo;
    if (Echo) {
      const channelName = `App.Models.User.${userId}`;
      const channel = Echo.private(channelName);
      echoChannelRef.current = channel;
      
      // Listen for broadcast notifications
      channel.notification((notification: any) => {
        console.log('Received notification:', notification);
        
        // Laravel broadcasts notifications with this structure:
        // { id, type, data: { type, message, url, ... }, created_at }
        const notificationData = notification.data || notification.notification?.data || notification;
        const newNotification: Notification = {
          id: notification.id || notification.notification?.id || `temp-${Date.now()}`,
          type: notification.type || notification.notification?.type || '',
          data: notificationData,
          read_at: null,
          created_at: notification.created_at || notification.created_at || new Date().toISOString(),
        };
        
        // Add new notification to the list (avoid duplicates and limit to 20)
        setNotifications(prev => {
          // Check if notification already exists
          if (prev.some(n => n.id === newNotification.id)) {
            return prev;
          }
          // Add new notification at the top and limit to 20
          const updated = [newNotification, ...prev];
          return updated.slice(0, 20);
        });
        setUnreadCount(prev => prev + 1);

        // Show toast notification at the top of the page
        const toastConfig = getToastConfig(newNotification);
        const Icon = toastConfig.icon;
        const message = newNotification.data.message || 'New notification';
        
        const toastOptions = {
          title: toastConfig.title,
          icon: <Icon className="h-4 w-4" />,
          duration: 5000,
          action: newNotification.data.url ? {
            label: 'View',
            onClick: () => {
              handleNotificationClick(newNotification);
            }
          } : undefined,
          onClick: newNotification.data.url ? () => {
            handleNotificationClick(newNotification);
          } : undefined,
        };

        // Call the appropriate toast method based on variant
        if (toastConfig.variant === 'success') {
          toast.success(message, toastOptions);
        } else if (toastConfig.variant === 'error') {
          toast.error(message, toastOptions);
        } else if (toastConfig.variant === 'warning') {
          toast.warning(message, toastOptions);
        } else {
          toast.info(message, toastOptions);
        }
      });

      // Cleanup function
      return () => {
        if (channel) {
          channel.stopListening('.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated');
        }
        if (Echo) {
          Echo.leave(channelName);
        }
        echoChannelRef.current = null;
      };
    }
  }, [userId, fetchNotifications]);

  // Refresh when dropdown opens
  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open]);

  const unreadNotifications = notifications.filter(n => !n.read_at);

  const getNotificationIcon = (type: string) => {
    const iconMap: Record<string, any> = {
      'application_status_changed': CheckCircle2,
      'new_application_received': Bell,
      'new_message_received': MessageCircle,
      'company_approved': Building2,
      'company_rejected': XCircle,
      'credit_balance_low': CreditCard,
    };
    return iconMap[type] || Bell;
  };

  const getNotificationColor = (type: string) => {
    const colorMap: Record<string, string> = {
      'application_status_changed': 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
      'new_application_received': 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
      'new_message_received': 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
      'company_approved': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
      'company_rejected': 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
      'credit_balance_low': 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
    };
    return colorMap[type] || 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400';
  };

  // Get toast configuration based on notification type
  const getToastConfig = (notification: Notification) => {
    const type = notification.data.type;
    
    const configMap: Record<string, { variant: 'success' | 'error' | 'warning' | 'info', icon: any, title: string }> = {
      'application_status_changed': {
        variant: 'info',
        icon: CheckCircle2,
        title: 'Application Updated'
      },
      'new_application_received': {
        variant: 'success',
        icon: Bell,
        title: 'New Application'
      },
      'new_message_received': {
        variant: 'info',
        icon: MessageCircle,
        title: 'New Message'
      },
      'company_approved': {
        variant: 'success',
        icon: Building2,
        title: 'Company Approved'
      },
      'company_rejected': {
        variant: 'error',
        icon: XCircle,
        title: 'Company Rejected'
      },
      'credit_balance_low': {
        variant: 'warning',
        icon: CreditCard,
        title: 'Low Credit Balance'
      },
    };
    
    return configMap[type] || { variant: 'info' as const, icon: Bell, title: 'Notification' };
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <p className="text-xs text-gray-500 mt-0.5">{unreadCount} unread</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.visit('/notifications')}
              className="text-xs h-7"
            >
              View All
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs h-7"
              >
                Mark all read
              </Button>
            )}
          </div>
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              No notifications yet
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const isUnread = !notification.read_at;
                const Icon = getNotificationIcon(notification.data.type);
                const colorClass = getNotificationColor(notification.data.type);
                
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors",
                      isUnread && "bg-blue-50/50 dark:bg-blue-900/10"
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "p-1.5 rounded-full flex-shrink-0",
                        colorClass
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn(
                            "text-sm",
                            isUnread ? "font-semibold text-gray-900 dark:text-gray-100" : "text-gray-700 dark:text-gray-300"
                          )}>
                            {notification.data.message || 'New notification'}
                          </p>
                          {isUnread && (
                            <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

