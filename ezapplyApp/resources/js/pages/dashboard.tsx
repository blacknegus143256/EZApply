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
  Settings,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
  Award,
  Clock
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
      change: '+12%',
      changeType: 'positive' as const,
      description: 'From last month'
    },
    {
      title: 'Applications',
      value: stats?.totalApplications || 0,
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+8%',
      changeType: 'positive' as const,
      description: 'From last month'
    },
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '+15%',
      changeType: 'positive' as const,
      description: 'From last month'
    },
    {
      title: 'Pending Approvals',
      value: stats?.pendingApprovals || 0,
      icon: MessageCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: '-5%',
      changeType: 'negative' as const,
      description: 'From last month'
    },
  ];

  return (
    <ErrorBoundary>
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Dashboard" />
        <div className="min-h-screen bg-across-pages p-6 flex flex-col gap-8">
          <div className="flex h-full flex-1 flex-col gap-8 overflow-x-auto rounded-xl p-6">
            {/* Welcome Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">Welcome to EZApply</h1>
                  <p className="text-lg text-gray-600 mt-2">
                    Manage your franchise opportunities and applications
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  Last updated: {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((stat, index) => (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                      <div className="flex items-center gap-1">
                        {stat.changeType === 'positive' ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <span className={`text-sm font-medium ${
                          stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stat.change}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                      <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                      <p className="text-xs text-gray-500">{stat.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
                <Badge variant="outline" className="text-blue-600 border-blue-200">
                  <Activity className="w-4 h-4 mr-1" />
                  Active
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickActions.map((action, index) => (
                  <PermissionGate key={index} role={action.role as any}>
                    <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-lg hover:-translate-y-2 bg-white/80 backdrop-blur-sm">
                      <Link href={action.href} className="block">
                        <CardHeader className="pb-4">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${action.color} text-white group-hover:scale-110 transition-transform duration-300`}>
                              <action.icon className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-lg font-semibold group-hover:text-blue-600 transition-colors">
                                {action.title}
                              </CardTitle>
                              <CardDescription className="text-sm text-gray-600 mt-1">
                                {action.description}
                              </CardDescription>
                            </div>
                            <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
                          </div>
                        </CardHeader>
                      </Link>
                    </Card>
                  </PermissionGate>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
                <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                  View All
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    Activity Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <div className="relative">
                      <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                        <BarChart3 className="h-10 w-10 text-blue-600" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <Award className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No recent activity</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Your recent activities, applications, and system updates will appear here
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </AppLayout>
    </ErrorBoundary>
  );
}