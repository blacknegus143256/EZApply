import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link,usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Lock, LockKeyhole, UserIcon, Building2, MessageCircle, Banknote, List } from 'lucide-react';
import AppLogo from './app-logo';
import { Avatar } from './ui/avatar'
import CompanyApplicants from '@/pages/Company/Applicants/CompanyApplicants';
import PermissionGate from './PermissionGate';


const mainNavItems: NavItem[] = [
    // Dashboard - Different for each role
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
        permission: 'view_dashboard',
    },
    {
        title: 'Customer Profile',
        href: '/applicant/profile',
        icon: UserIcon,
        permission: 'view_customer_dashboard',
     },
    {
    title: 'Applied Companies',
    href: '/applicant/franchise/appliedcompanies',
    icon: MessageCircle,
    permission: 'view_customer_dashboard',
    },
    {
        title: 'Company',
        href: '/companies',
        icon: Building2,
        permission: 'view_request_companies',
    },
    {
        title: 'My Companies',
        href: '/my-companies',
        icon: Building2,
        permission: 'view_company_dashboard',
    },
    {
        title: 'Applicants',
        href: '/company-applicants',
        icon: UserIcon,
        permission: 'view_applications',
    },
    {
        title: 'Your Chats',
        href: '/view-chats',
        icon: MessageCircle,
        permission: 'view_chats',
    },
    {
        title: 'Credit Balance',
        href: '/credit-balance',
        icon: Banknote,
        permission: 'view_balance',

    },

    
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
        href: '/permissions',
        icon: Lock,
        permission: 'view_permissions',
    },
    {
        title: 'Company Requests',
        href: '/company-requests',
        icon: List,
        permission: 'view_request_companies',
    },

];

const footerNavItems: NavItem[] = [
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
            <PermissionGate role='customer'>

                <div className="mt-4">
                    <div className="px-4 text-[11px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                    Franchise Application
                    </div>

                           <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href="/applicant/franchise">
              <Building2 className="h-4 w-4" />
              <span>Browse Franchise Companies</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

      </SidebarMenu>
                </div>
            </PermissionGate>
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />    
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
