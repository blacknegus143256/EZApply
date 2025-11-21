import { useState, useEffect, useCallback } from 'react';
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuBadge } from '@/components/ui/sidebar';
import { usePermissions } from '@/hooks/use-permissions';
import { type NavItem } from '@/types';
import { Link, usePage, router } from '@inertiajs/react';
import axios from 'axios';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage<any>();
    const { can } = usePermissions();
    const [unreadCount, setUnreadCount] = useState(0);
    const userId = page.props.auth?.user?.id;

    // Fetch unread notification count
    const fetchUnreadCount = useCallback(async () => {
        if (!userId) return;
        
        try {
            const response = await axios.get('/api/notifications/unread-count');
            setUnreadCount(response.data.unread_count || 0);
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    }, [userId]);

    // Initial fetch and set up listeners
    useEffect(() => {
        if (!userId) return;

        fetchUnreadCount();

        // Set up real-time listener for notifications
        const Echo = (window as any).Echo;
        if (Echo && userId) {
            const channelName = `App.Models.User.${userId}`;
            const channel = Echo.private(channelName);
            
            channel.notification(() => {
                // When a new notification arrives, increment the count
                setUnreadCount(prev => prev + 1);
            });

            return () => {
                channel.stopListening('.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated');
                Echo.leave(channelName);
            };
        }
    }, [userId, fetchUnreadCount]);

    // Refresh count on page navigation
    useEffect(() => {
        // Refresh when URL changes (user navigates)
        fetchUnreadCount();
    }, [page.url, fetchUnreadCount]);

    // Listen for custom events when notifications are marked as read
    useEffect(() => {
        const handleNotificationRead = () => {
            fetchUnreadCount();
        };

        // Listen for custom events from NotificationBell and NotificationCenter
        window.addEventListener('notification-read', handleNotificationRead);
        window.addEventListener('notification-mark-all-read', handleNotificationRead);

        return () => {
            window.removeEventListener('notification-read', handleNotificationRead);
            window.removeEventListener('notification-mark-all-read', handleNotificationRead);
        };
    }, [fetchUnreadCount]);

    // Periodic refresh as fallback (every 30 seconds)
    useEffect(() => {
        if (!userId) return;

        const interval = setInterval(() => {
            fetchUnreadCount();
        }, 30000); // Refresh every 30 seconds

        return () => clearInterval(interval);
    }, [userId, fetchUnreadCount]);

    // Refresh when page becomes visible (user switches back to tab)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchUnreadCount();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [fetchUnreadCount]);

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    // Check if item has permission requirement
                    if (item.permission && !can(item.permission)) {
                        return null;
                    }
                    
                    // Check if this is the Notifications item
                    const isNotifications = item.href === '/notifications' || 
                        (typeof item.href === 'object' && item.href.url === '/notifications');
                    const showBadge = isNotifications && unreadCount > 0;
                    
                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={page.url.startsWith(typeof item.href === 'string' ? item.href : item.href.url)}
                                tooltip={{ children: item.title }}
                            >
                                <Link href={item.href} prefetch>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                    {showBadge && (
                                        <SidebarMenuBadge className="bg-red-500 text-white">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </SidebarMenuBadge>
                                    )}
                                </Link>
                            </SidebarMenuButton>    
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
