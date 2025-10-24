import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren, useState } from 'react';
import DisplayBalance from '@/components/balance-display';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import ProfileStatusCard from '@/components/ProfileStatusCard';

function DisplayBalanceWrapper() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return <DisplayBalance isCollapsed={isCollapsed} />;
}

export default function AppSidebarLayout({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {

    return (
        <AppShell variant="sidebar">
            <SidebarProvider>
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <div className="absolute top-3 right-4">
                <DisplayBalanceWrapper />
                </div>
                {children}
            </AppContent>     
            </SidebarProvider>         
        </AppShell>
    );
}
