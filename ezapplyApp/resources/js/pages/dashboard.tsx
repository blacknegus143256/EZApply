import React from 'react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import PermissionGate from '@/components/PermissionGate';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Users, 
  FileText, 
  MessageCircle, 
  CreditCard, 
  BarChart3,
  Plus,
  Eye,
  Settings
} from 'lucide-react';
import { ErrorBoundary } from '@/components/ui/error-boundary';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard() },
];

interface DashboardStats {
  totalCompanies?: number;
  totalApplications?: number;
  totalUsers?: number;
  pendingApprovals?: number;
}

interface DashboardProps {
  stats?: DashboardStats;
}

export default function Dashboard({ stats }: DashboardProps) {
  const quickActions = [
    {
      title: 'Register Company',
      description: 'Add a new franchise opportunity',
      href: '/company/register',
      icon: Building2,
      role: 'company',
      color: 'bg-blue-500',
    },
    {
      title: 'Browse Franchises',
      description: 'Find franchise opportunities',
      href: '/applicant/franchise',
      icon: FileText,
      role: 'customer',
      color: 'bg-green-500',
    },
    {
      title: 'View Applications',
      description: 'Manage franchise applications',
      href: '/company-applicants',
      icon: Users,
      role: 'company',
      color: 'bg-purple-500',
    },
    {
      title: 'User Management',
      description: 'Manage users and permissions',
      href: '/users',
      icon: Settings,
      role: 'admin',
      color: 'bg-orange-500',
    },
  ];

  const statCards = [
    {
      title: 'Total Companies',
      value: stats?.totalCompanies || 0,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Applications',
      value: stats?.totalApplications || 0,
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Pending Approvals',
      value: stats?.pendingApprovals || 0,
      icon: MessageCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <ErrorBoundary>
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Dashboard" />
        <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
          {/* Welcome Section */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Welcome to EZApply</h1>
            <p className="text-muted-foreground">
              Manage your franchise opportunities and applications
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.bgColor}`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <PermissionGate key={index} role={action.role as any}>
                  <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
                    <Link href={action.href} className="block">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${action.color} text-white`}>
                            <action.icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-base">{action.title}</CardTitle>
                            <CardDescription className="text-sm">
                              {action.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                    </Link>
                  </Card>
                </PermissionGate>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No recent activity</h3>
                  <p className="text-muted-foreground">
                    Your recent activities will appear here
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    </ErrorBoundary>
  );
}