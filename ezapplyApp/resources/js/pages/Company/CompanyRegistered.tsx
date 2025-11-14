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
import { Loader2, Zap, Calendar, MapPin } from "lucide-react";
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
                    <TableCell colSpan={8} className="text-center text-gray-500">
                        No companies found matching your filters.
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
            <div className="bg-across-pages min-h-screen p-5">
                <Card className="rounded-xl shadow-lg dark:bg-neutral-900">
                    <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 p-4 md:p-6">
                        <CardTitle className="text-2xl font-bold">My Registered Companies</CardTitle>
                        

                        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto items-start md:items-center">
                            
                            <div className="flex flex-wrap gap-2 w-full"> 

                                <Input
                                    type="text"
                                    placeholder="Search Company..."
                                    className="w-full sm:w-auto min-w-[160px] md:max-w-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                
                                <Select value={franchiseTypeFilter} onValueChange={setFranchiseTypeFilter}>
                                    <SelectTrigger className="w-full sm:w-[180px] min-w-[120px]">
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
                                    <SelectTrigger className="w-full sm:w-[140px] min-w-[120px]">
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
                                    <SelectTrigger className="w-full sm:w-[140px] min-w-[120px]">
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
                            </div>

                            <div className="w-full md:w-auto mt-2 md:mt-0"> 
                                <Button variant="default" size="sm" className="w-full md:w-auto">
                                    <Link href={'/company/register'}>Add Company</Link>
                                </Button>
                            </div>
                        </div>
                    </CardHeader>

                    <hr className="border-gray-200 dark:border-neutral-800" />

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
                            {filteredCompanies.length === 0 && !loading && !error ? (
                                <p className="text-center text-gray-500 p-4">
                                    No companies found matching your filters.
                                </p>
                            ) : (
                                filteredCompanies.map((company) => (
                                    <CompanyCard key={company.id} company={company} />
                                ))
                            )}
                            {loading && (
                                <div className="text-center text-gray-500 p-4">
                                    <Loader2 className="h-6 w-6 animate-spin inline-block mr-2" />
                                    Loading companies...
                                </div>
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