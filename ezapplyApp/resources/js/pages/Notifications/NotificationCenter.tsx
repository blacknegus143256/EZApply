import { useState, useEffect, useMemo } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Bell, 
  CheckCircle2, 
  XCircle, 
  MessageCircle, 
  Building2, 
  CreditCard,
  Filter,
  Search,
  Trash2,
  CheckCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Skeleton } from '@/components/ui/skeleton';

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Notifications", href: "/notifications" },
];

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

export default function NotificationCenter() {
  const { props } = usePage<any>();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Fetch all notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/notifications');
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      const matchesFilter = filter === 'all' 
        ? true 
        : filter === 'unread' 
          ? !notification.read_at 
          : !!notification.read_at;
      
      const matchesType = typeFilter === 'all' 
        ? true 
        : notification.data.type === typeFilter;
      
      const matchesSearch = searchTerm === '' 
        ? true 
        : notification.data.message?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesFilter && matchesType && matchesSearch;
    });
  }, [notifications, filter, typeFilter, searchTerm]);

  // Mark as read
  const markAsRead = async (id: string) => {
    try {
      await axios.post(`/api/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
      );
      
      // Dispatch custom event to update sidebar badge
      window.dispatchEvent(new CustomEvent('notification-read'));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await axios.post('/api/notifications/mark-all-read');
      setNotifications(prev =>
        prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
      );
      
      // Dispatch custom event to update sidebar badge
      window.dispatchEvent(new CustomEvent('notification-mark-all-read'));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (id: string) => {
    try {
      // Note: You may need to add a delete endpoint
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read_at) {
      markAsRead(notification.id);
    }
    if (notification.data.url) {
      router.visit(notification.data.url);
    }
  };

  // Get unique notification types
  const notificationTypes = useMemo(() => {
    const types = new Set(notifications.map(n => n.data.type));
    return Array.from(types);
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.read_at).length;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Notifications" />
      <div className="bg-across-pages min-h-screen p-5">
        <div className="p-6 bg-white dark:bg-neutral-900 rounded-xl shadow-md max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
                Notifications
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            </div>
            {unreadCount > 0 && (
              <Button onClick={markAllAsRead} variant="outline" size="sm">
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark all as read
              </Button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {notificationTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notifications List */}
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                {notifications.length === 0 
                  ? "No notifications yet" 
                  : "No notifications match your filters"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredNotifications.map((notification) => {
                const isUnread = !notification.read_at;
                const Icon = getNotificationIcon(notification.data.type);
                const colorClass = getNotificationColor(notification.data.type);
                
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md",
                      isUnread 
                        ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800" 
                        : "bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700"
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "p-2 rounded-full",
                        colorClass
                      )}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn(
                            "text-sm",
                            isUnread 
                              ? "font-semibold text-gray-900 dark:text-gray-100" 
                              : "text-gray-700 dark:text-gray-300"
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
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

