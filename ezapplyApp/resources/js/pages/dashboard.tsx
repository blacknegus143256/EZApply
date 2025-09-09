// resources/js/Pages/Dashboard.tsx
import React from 'react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { usePermissions } from '@/hooks/use-permissions';
import PermissionGate from '@/components/PermissionGate';

import { Head, Link, usePage } from '@inertiajs/react';

console.log(dashboard());

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: dashboard().url }];


export default function Dashboard() {
  const { can } = usePermissions();
    const { auth } = usePage().props as any;
  const role = auth.user.role;
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    {/* Company Dashboard - Register Company/Franchise */}
                    <PermissionGate permission="view_company_dashboard">
                        <Link
                            href="/company/register"
                            className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border hover:shadow-lg transition-shadow duration-200 flex items-center justify-center"
                        >
                            <span className="z-10 text-lg font-semibold text-gray-800 dark:text-gray-100">
                                Register Company/Franchise
                            </span>
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                        </Link>
                    </PermissionGate>

                    {/* Customer Dashboard - Franchise Application */}
                    <PermissionGate permission="view_customer_dashboard">
                        <Link
                            href="/applicant/franchise"
                            className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border hover:shadow-lg transition-shadow duration-200 flex items-center justify-center"
                        >
                            <span className="z-10 text-lg font-semibold text-gray-800 dark:text-gray-100">
                                Franchise Application
                            </span>
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                        </Link>
                    </PermissionGate>

                    {/* Admin Dashboard - User Management */}
                    <PermissionGate permission="view_admin_dashboard">
                        <Link
                            href="/users"
                            className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border hover:shadow-lg transition-shadow duration-200 flex items-center justify-center"
                        >
                            <span className="z-10 text-lg font-semibold text-gray-800 dark:text-gray-100">
                                User Management
                            </span>
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                        </Link>
                    </PermissionGate>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                </div>
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>
            </div>
        </AppLayout>
    );
}