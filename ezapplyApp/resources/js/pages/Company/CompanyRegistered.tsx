import React, { useState, useMemo } from "react";
import { Head, usePage, router } from "@inertiajs/react";
import '../../../css/easyApply.css';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Zap, Calendar, MapPin, Building2, CheckCircle, XCircle, Clock, Search, Filter, Plus } from "lucide-react";
import AppLayout from '@/layouts/app-layout';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Company {
    id: number;
    company_name: string;
    brand_name: string;
    opportunity?: {
        franchise_type?: string | null;
    };
    year_founded?: number | null;
    country?: string | null;
    created_at: string;
    status: "pending" | "approved" | "rejected";
}


const isDateInRange = (createdAt: string, filter: string) => {
    if (filter === "all") return true;
    const date = new Date(createdAt);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (filter) {
        case "today":
            return date >= today;
        case "this-week":
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            return date >= weekStart;
        case "this-month":
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            return date >= monthStart;
        case "this-year":
            const yearStart = new Date(now.getFullYear(), 0, 1);
            return date >= yearStart;
        default:
            return true;
    }
};


const StatusBadge: React.FC<{ status: Company['status'] }> = ({ status }) => {
    const map: Record<Company['status'], string> = {
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        approved: 'bg-green-100 text-green-800 border-green-300',
        rejected: 'bg-red-100 text-red-800 border-red-300',
    };
    const label = status.charAt(0).toUpperCase() + status.slice(1);
    const cls = map[status] || map['pending'];
    
    return <Badge className={`${cls} text-xs font-medium border`}>{label}</Badge>;
};


const CompanyCard: React.FC<{ company: Company }> = ({ company }) => {
    const formattedDate = company.created_at
        ? new Date(company.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
        : "—";

    return (
        <Card className="mb-3 shadow-lg border-2 border-gray-100 dark:border-neutral-700">
            <CardHeader className="p-4 flex flex-row items-start justify-between">
                <div className="flex flex-col gap-0.5">
                    <CardTitle className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {company.company_name}
                    </CardTitle>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{company.brand_name || "—"}</p>
                </div>
                <StatusBadge status={company.status} />
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                
                <div className="flex justify-between items-center border-t border-gray-100 dark:border-neutral-700 pt-2">
                    <span className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-gray-500" />
                        Franchise Type:
                    </span>
                    <strong className="text-gray-900 dark:text-white">
                        {company.opportunity?.franchise_type || "—"}
                    </strong>
                </div>

                <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        Country:
                    </span>
                    <strong>{company.country || "—"}</strong>
                </div>
                
                <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        Date Added:
                    </span>
                    <strong>{formattedDate}</strong>
                </div>

                <div className="pt-3 flex gap-3 justify-end">
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/companies/${company.id}/details`}>View</Link>
                    </Button>
                    <Button asChild variant="default" size="sm">
                        <Link href={`/companies/${company.id}/edit`}>Edit</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};


const CompanyRegistered = () => {
    const { companies } = usePage<{ companies: Company[] }>().props;
    const [searchTerm, setSearchTerm] = useState("");
    const [franchiseTypeFilter, setFranchiseTypeFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState<Company['status'] | 'all'>("all");
    const [createdAtFilter, setCreatedAtFilter] = useState("all");
    const [loading] = useState(false);
    const [error] = useState<string | null>(null);


    // Get unique franchise types
    const franchiseTypes = useMemo(() => {
        const types = new Set<string>();
        (companies || []).forEach((c) => {
            if (c.opportunity?.franchise_type) {
                types.add(c.opportunity.franchise_type);
            }
        });
        return Array.from(types).sort();
    }, [companies]);

    // Filter logic
    const filteredCompanies = useMemo(() => {
        return (companies || []).filter((c) => {
            const matchesSearch = c.company_name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFranchiseType = franchiseTypeFilter === "all" || c.opportunity?.franchise_type === franchiseTypeFilter;
            const matchesStatus = statusFilter === "all" || c.status === statusFilter;
            const matchesCreatedAt = createdAtFilter === "all" || isDateInRange(c.created_at, createdAtFilter);

            return matchesSearch && matchesFranchiseType && matchesStatus && matchesCreatedAt;
        });
    }, [companies, searchTerm, franchiseTypeFilter, statusFilter, createdAtFilter]);

    // Calculate stats
    const stats = useMemo(() => {
        const total = companies.length;
        const pending = companies.filter((c) => c.status === 'pending').length;
        const approved = companies.filter((c) => c.status === 'approved').length;
        const rejected = companies.filter((c) => c.status === 'rejected').length;
        return { total, pending, approved, rejected };
    }, [companies]);

    const breadcrumbs = [
        { title: "Dashboard", href: "/dashboard" },
        { title: "Company Request", href: "/my-companies" },
    ];


    const renderTableRows = () => {
        if (loading) {
            return (
                <TableRow key="loading">
                    <TableCell colSpan={8} className="text-center">
                        <Loader2 className="h-6 w-6 animate-spin inline-block mr-2" />{" "}
                        Loading companies...
                    </TableCell>
                </TableRow>
            );
        }
        if (error) {
            return (
                <TableRow key="error">
                    <TableCell colSpan={8} className="text-center text-red-500">
                        {error}
                    </TableCell>
                </TableRow>
            );
        }
        if (filteredCompanies.length === 0) {
            return (
                <TableRow key="no-companies">
                    <TableCell colSpan={8} className="text-center py-12">
                        <Building2 className="mx-auto text-gray-400 mb-4" size={48} />
                        <p className="text-gray-600 dark:text-gray-400 font-medium">No companies found</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                            {searchTerm || franchiseTypeFilter !== "all" || statusFilter !== "all" || createdAtFilter !== "all"
                                ? 'Try adjusting your search or filter criteria'
                                : 'Register your first company to get started.'}
                        </p>
                    </TableCell>
                </TableRow>
            );
        }
        
        return filteredCompanies.map((company) => (
            <TableRow key={company.id}>
                <TableCell className="font-medium max-w-[220px] truncate" title={company?.company_name || ''}>{company?.company_name || "—"}</TableCell>
                <TableCell className="max-w-[200px] truncate" title={company.brand_name || ''}>{company.brand_name || "—"}</TableCell>
                <TableCell className="max-w-[150px] truncate" title={company.opportunity?.franchise_type || ''}>{company.opportunity?.franchise_type || "—"}</TableCell>
                <TableCell className="max-w-[120px]">{company.year_founded || "—"}</TableCell>
                <TableCell className="max-w-[120px] truncate" title={company.country || ''}>{company.country || "—"}</TableCell>
                <TableCell className="max-w-[120px]">
                    <StatusBadge status={company.status} />
                </TableCell>
                <TableCell className="min-w-[120px]">
                    {company.created_at
                        ? new Date(company.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                        })
                        : "—"}
                </TableCell>
                <TableCell className="min-w-[150px]">
                    <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                            <Link href={`/companies/${company.id}/details`}>View</Link>
                        </Button>
                        <Button asChild variant="default" size="sm">
                            <Link href={`/companies/${company.id}/edit`}>Edit</Link>
                        </Button>
                    </div>
                </TableCell>
            </TableRow>
        ));
    };


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Company Request" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <Building2 size={32} className="sm:w-10 sm:h-10" />
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold">My Registered Companies</h1>
                                <p className="text-blue-100 text-sm sm:text-base mt-1">
                                    Manage and track your company registrations
                                </p>
                            </div>
                        </div>
                        <Button asChild variant="secondary" className="hidden sm:flex">
                            <Link href={'/company/register'}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Company
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="shadow-md">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Companies</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                                </div>
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                    <Building2 className="text-blue-600 dark:text-blue-400" size={24} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-md">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                                </div>
                                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                                    <Clock className="text-yellow-600 dark:text-yellow-400" size={24} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-md">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved</p>
                                    <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                                </div>
                                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                                    <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-md">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejected</p>
                                    <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                                </div>
                                <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                                    <XCircle className="text-red-600 dark:text-red-400" size={24} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="w-5 h-5" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <Input
                                    type="text"
                                    placeholder="Search Company..."
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            
                            <Select value={franchiseTypeFilter} onValueChange={setFranchiseTypeFilter}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Franchise Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    {franchiseTypes.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            
                            <Select value={statusFilter} onValueChange={(v: string) => setStatusFilter(v as Company['status'] | 'all')}>
                                <SelectTrigger className="w-full sm:w-[140px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                            
                            <Select value={createdAtFilter} onValueChange={setCreatedAtFilter}>
                                <SelectTrigger className="w-full sm:w-[140px]">
                                    <SelectValue placeholder="Date Added" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Time</SelectItem>
                                    <SelectItem value="today">Today</SelectItem>
                                    <SelectItem value="this-week">This Week</SelectItem>
                                    <SelectItem value="this-month">This Month</SelectItem>
                                    <SelectItem value="this-year">This Year</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button asChild variant="default" className="sm:hidden">
                                <Link href={'/company/register'}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Company
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Companies Table */}
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Companies List</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">

                        <div className="hidden md:block overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="min-w-[150px]">Company Name</TableHead>
                                        <TableHead>Brand Name</TableHead>
                                        <TableHead>Franchise Type</TableHead>
                                        <TableHead>Year Founded</TableHead>
                                        <TableHead>Country</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="min-w-[120px]">Created At</TableHead>
                                        <TableHead className="min-w-[150px]">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {renderTableRows()}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="md:hidden p-4 space-y-3">
                            {loading && filteredCompanies.length === 0 ? (
                                <div className="flex justify-center items-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                </div>
                            ) : filteredCompanies.length === 0 ? (
                                <div className="text-center py-12">
                                    <Building2 className="mx-auto text-gray-400 mb-4" size={48} />
                                    <p className="text-gray-600 dark:text-gray-400 font-medium">No companies found</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                                        {searchTerm || franchiseTypeFilter !== "all" || statusFilter !== "all" || createdAtFilter !== "all"
                                            ? 'Try adjusting your search or filter criteria'
                                            : 'Register your first company to get started.'}
                                    </p>
                                </div>
                            ) : (
                                filteredCompanies.map((company) => (
                                    <CompanyCard key={company.id} company={company} />
                                ))
                            )}
                            {error && (
                                <div className="text-center text-red-500 p-4">{error}</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default CompanyRegistered;