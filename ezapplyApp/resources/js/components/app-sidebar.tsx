import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link,usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, List, Lock, LockKeyhole, Save, UserIcon } from 'lucide-react';
import AppLogo from './app-logo';
import { Avatar } from './ui/avatar';


const mainNavItems: NavItem[] = [
    // Dashboard - Different for each role
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
        permission: 'view_customer_dashboard',
    },
    // {
    //     title: 'Dashboard',
    //     href: dashboard(),
    //     icon: LayoutGrid,
    //     permission: 'view_company_dashboard',
    // },
    // {
    //     title: 'Dashboard',
    //     href: dashboard(),
    //     icon: LayoutGrid,
    //     permission: 'view_admin_dashboard',
    // },
    
    // Admin only - User Management
    {
        title: 'Users',
        href: '/users',
        icon: UserIcon,
        permission: 'view_users',
    },
    {
        title: 'Roles',
        href: '/roles',
        icon: LockKeyhole,
        permission: 'view_roles',
    },
    {
        title: 'Permissions',
        href: '/permission',
        icon: Lock,
        permission: 'view_permissions',
    },
    {
        title: 'Company Requests',
        href: '/company-requests',
        icon: List,
        permission: 'view_request_companies',
    },
    
    
    // Company specific
    // {
    //     title: 'My Companies',
    //     href: '/companies',
    //     icon: Folder,
    //     permission: 'manage_own_companies',
    // },
    
    // Customer specific
    // {
    //     title: 'Browse Franchises',
    //     href: '/companies',
    //     icon: Folder,
    //     permission: 'view_companies',
    // },
];

const footerNavItems: NavItem[] = [
    // {
    //     title: 'Repository',
    //     href: 'https://github.com/laravel/react-starter-kit',
    //     icon: Folder,
    // },
    // {
    //     title: 'Documentation',
    //     href: 'https://laravel.com/docs/starter-kits#react',
    //     icon: BookOpen,
    // },
    {
        title: 'Home Page',
        href: `/easy-apply`,
        icon: BookOpen,
        permission: 'view home page',
    }
];


export function AppSidebar() {

    const page = usePage();
    const url = page.url;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
                {url.startsWith('/applicant/franchise') && (
                <div className="mt-4">
                    <div className="px-4 text-[11px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                    Franchise Application
                    </div>

                    <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                        {/* anchor to section in the page */}
                        <a href="/applicant/franchise?tab=financial">Financial Information</a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                        <a href="/applicant/franchise?tab=interest">Franchise Interest</a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    </SidebarMenu>
                </div>
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />    
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
