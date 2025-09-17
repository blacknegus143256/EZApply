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


const mainNavItems: NavItem[] = [
    // Dashboard - Different for each role
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
        permission: 'view_customer_dashboard',
    },
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
        permission: 'view_company_dashboard',
    },

     {
        title: 'Basic Info',
        href: '/applicant/basicinfo',
        icon: UserIcon,
        permission: 'view_customer_dashboard',
    },
     {
        title: 'Affiliations',
        href: '/applicant/affiliations',
        icon: Building2,
        permission: 'view_customer_dashboard',
    },
     {
        title: 'Financial Info',
        href: '/applicant/financial',
        icon: Banknote,
        permission: 'view_customer_dashboard',
    },
     {
        title: 'Attachments',
        href: '/applicant/attachments',
        icon: Folder,
        permission: 'view_customer_dashboard',
    },
    {
        title: 'My Companies',
        href: '/my-registered-companies',
        icon: Building2,
        permission: 'view_my_companies',
    },
    {
        title: 'Applicants',
        href: '/company-applicants',
        icon: UserIcon,
        permission: 'view_applications',
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
            <Link href="/applicant/franchise">
              <Building2 className="h-4 w-4" />
              <span>Browse Companies</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href="/applicant/franchise/appliedcompanies">
              <MessageCircle className="h-4 w-4" />
              <span>Applied Companies</span>
            </Link>
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
