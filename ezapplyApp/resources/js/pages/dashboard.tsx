// resources/js/pages/dashboard.tsx
// resources/js/Pages/Dashboard.tsx
import React from 'react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import PermissionGate from '@/components/PermissionGate';
import { Head, Link } from '@inertiajs/react';
import '../../css/easyApply.css';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard() },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <PermissionGate role="company">
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

                    <PermissionGate role="customer">
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

                    <PermissionGate role="admin">
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
                </div>
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>
            </div>
        </AppLayout>
    );
}