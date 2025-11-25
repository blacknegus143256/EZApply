import React, { useEffect, useMemo, useState } from "react";
import { Head, usePage, router } from "@inertiajs/react";
import axios from "axios";
import {
    Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Mail, Calendar, Settings, Building, CheckCircle, XCircle, Users, FileText, Clock, Search, Filter } from "lucide-react";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import PermissionGate from "@/components/PermissionGate";
import { Button } from "@/components/ui/button";
import ChatButton from "@/components/ui/chat-button";
import PaymentConfirmationDialog from "../PaymentConfirm";
import { TableRowSkeleton, ApplicationCardSkeleton } from "@/components/ui/skeletons";


type CompanyDetails = {
    id: number;
    company_name: string;
    brand_name?: string;
    city?: string;
    state_province?: string;
    zip_code?: string;
    country?: string;
    company_website?: string;
    description?: string;
    year_founded?: number;
    num_franchise_locations?: number;
    status?: string;
    user?: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
    };
    opportunity?: any; 
    background?: any;
    requirements?: any;
    marketing?: {
        listing_title?: string;
        listing_description?: string;
        logo_path?: string;
        target_profile?: string;
        preferred_contact_method?: string;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Company Applicants", href: "/company/applicants" },
];

const statusOptions = ["pending", "approved", "rejected", "interested", "paid"]; 

type StatusMessageDialogProps = {
    open: boolean;
    onClose: () => void;
    title: string;
    message: string;
    status: 'success' | 'error';
}

const StatusMessageDialog: React.FC<StatusMessageDialogProps> = ({ open, onClose, title, message, status }) => {
    if (!open) return null;

    const isSuccess = status === 'success';
    const bgColor = isSuccess ? 'bg-green-500' : 'bg-red-500';
    const Icon = isSuccess ? CheckCircle : XCircle;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div 
                className="w-full max-w-sm rounded-xl bg-white dark:bg-neutral-900 shadow-2xl overflow-hidden transform transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                <div className={`p-4 text-white ${bgColor} flex items-center gap-3`}>
                    <Icon className="h-6 w-6" />
                    <h3 className="text-lg font-semibold">{title}</h3>
                </div>
                <div className="p-6">
                    <p className="text-gray-700 dark:text-gray-300 mb-6">{message}</p>
                    <div className="flex justify-end">
                        <Button onClick={onClose} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white">
                            Close
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CompanyApplicants() {
    const { props } = usePage<any>();
    const applicants = props.applicants ?? [];
    const user = props.auth?.user ?? null;
    const userBalance = props.auth?.user?.credit?.balance ?? props.auth?.user?.credits ?? 0;
    const purchaseCost = props.pricing?.package_cost ?? 1;

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [createdAtFilter, setCreatedAtFilter] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [error] = useState<string | null>(null);

    const [paidFieldsMap, setPaidFieldsMap] = useState<Record<number, string[]>>({});
    const [visibleMap, setVisibleMap] = useState<Record<number, Record<string, boolean>>>({});

    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const [toBuyApplicantId, setToBuyApplicantId] = useState<number | null>(null);

    const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
    const [dialogTitle, setDialogTitle] = useState('');
    const [dialogMessage, setDialogMessage] = useState('');
    const [dialogStatus, setDialogStatus] = useState<'success' | 'error'>('success');


    useEffect(() => {
        let mounted = true;
        async function loadPaid() {
            if (!applicants?.length) return;
            setLoading(true);
            try {
                const promises = applicants.map(async (a: any) => {
                    const res = await fetch(`/check-applicant-view/${a.id}`);
                    if (!res.ok) return null;
                    const data = await res.json();
                    return { id: a.id, paid_fields: data.paid_fields || [] };
                });
                const results = await Promise.all(promises);
                if (!mounted) return;
                const pf: Record<number, string[]> = {};
                const vm: Record<number, Record<string, boolean>> = {};
                results.forEach((r) => {
                    if (r) {
                        pf[r.id] = r.paid_fields;
                        vm[r.id] = {};
                        r.paid_fields.forEach((f: string) => (vm[r.id][f] = true));
                    }
                });
                setPaidFieldsMap(pf);
                setVisibleMap(vm);
            } catch (err) {
                console.error("Failed to load paid fields", err);
            } finally {
                if (mounted) setLoading(false);
            }
        }
        loadPaid();
        return () => { mounted = false; };
    }, [applicants]);

    const filteredApplicants = useMemo(() => {
        return applicants.filter((a: any) => {
            const basicInfo = a.user?.basicInfo || a.user?.basic_info;
            const firstName = basicInfo?.first_name ?? "";
            const lastName = basicInfo?.last_name ?? "";
            const email = a.user?.email ?? "";
            const brandName = a.user?.brand_name ?? "";
            const full = `${firstName} ${lastName} ${email} ${brandName}`.toLowerCase();
            const matchesSearch = full.includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === "" || a.status === statusFilter;
            let matchesCreated = true;
            if (createdAtFilter) {
                matchesCreated = a.created_at ? a.created_at.includes(createdAtFilter) : false;
            }
            return matchesSearch && matchesStatus && matchesCreated;
        });
    }, [applicants, searchTerm, statusFilter, createdAtFilter]);

    // Calculate stats
    const stats = useMemo(() => {
        const total = applicants.length;
        const pending = applicants.filter((a: any) => a.status === 'pending').length;
        const approved = applicants.filter((a: any) => a.status === 'approved').length;
        const rejected = applicants.filter((a: any) => a.status === 'rejected').length;
        const interested = applicants.filter((a: any) => a.status === 'interested').length;
        return { total, pending, approved, rejected, interested };
    }, [applicants]);

    const openBuyDialog = (appId: number) => {
        setToBuyApplicantId(appId);
        setConfirmationOpen(true);
    };

    const handleStatusChange = (id: number, status: string) => {
        router.put(`/company/applicants/${id}/status`, { status }, {
            preserveScroll: true,
        });
    };

    const handleConfirmBuy = async () => {
        if (!toBuyApplicantId) return;
        setLoading(true);
        setConfirmationOpen(false);

        try {
            const response = await axios.post(`/buy-info/${toBuyApplicantId}`);

            // SUCCESS HANDLER
            const { message, new_balance } = response.data;
            setDialogTitle('Purchase Complete');
            setDialogMessage(message || `Package purchased successfully. Your new balance is ${new_balance} credits.`);
            setDialogStatus('success');
            setIsMessageDialogOpen(true);

            // Reload page data to reflect the purchased field and updated balance
            router.reload({ only: ["applicants", "auth"] });
            
        } catch (err: any) {
            console.error("Buy failed:", err);
            
            // ERROR HANDLER
            const errorMessage = err.response?.data?.message 
                                || "Purchase failed. Please try again.";
            
            setDialogTitle('Purchase Failed');
            setDialogMessage(errorMessage);
            setDialogStatus('error');
            setIsMessageDialogOpen(true);

        } finally {
            setToBuyApplicantId(null);
            setLoading(false);
        }
    };

    const renderRows = () => {
        if (loading && filteredApplicants.length === 0) {
            return (
                <>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <TableRowSkeleton key={i} columns={5} showAvatar={false} />
                    ))}
                </>
            );
        }
        if (error) {
            return (
                <TableRow>
                    <TableCell colSpan={5} className="text-center text-red-500 py-8">{error}</TableCell>
                </TableRow>
            );
        }
        if (!filteredApplicants.length) {
            return (
                <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                        No applicants found matching your criteria.
                    </TableCell>
                </TableRow>
            );
        }

        return filteredApplicants.map((a: any) => {
            const purchased = Array.isArray(paidFieldsMap[a.id]) && paidFieldsMap[a.id].includes("package");
            const applicantUserId = a.user?.id ?? null;
            const basicInfo = a.user?.basicInfo || a.user?.basic_info;
            const firstName = basicInfo?.first_name ?? "";
            const lastName = basicInfo?.last_name ?? "";
            const Name = firstName && lastName ? `${firstName}` : firstName || "N/A";
            
            return (
                <TableRow key={a.id}>
                    <TableCell className="font-medium">
                        {Name}
                    </TableCell>
                    <TableCell>{a.company?.brand_name ?? "N/A"}</TableCell>
                    <TableCell>
                        <div className="flex flex-col gap-1">
                            <select
                                value={a.status}
                                onChange={(e) => handleStatusChange(a.id, e.target.value)}
                                className="rounded-md border-gray-300 dark:border-neutral-600 dark:bg-neutral-800 text-sm px-2 py-1.5 w-full min-w-[150px]"
                            >
                                {statusOptions.map((status) => (
                                    <option key={status} value={status}>
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </option>
                                ))}
                            </select>

                            <div className="mt-1">
                                {a.status === "pending" && <Badge variant="secondary">Pending</Badge>}
                                {a.status === "approved" && <Badge className="bg-green-500 hover:bg-green-500">Approved</Badge>}
                                {a.status === "rejected" && <Badge variant="destructive" className="text-white">Rejected</Badge>}
                                {a.status === "interested" && <Badge variant="outline">Interested</Badge>}
                                {a.status === "paid" && <Badge className="bg-yellow-600">Paid</Badge>}
                            </div>
                        </div>
                    </TableCell>
                    <TableCell>{a.created_at ? new Date(a.created_at).toLocaleDateString() : "N/A"}</TableCell>
                    <TableCell className="min-w-[220px]">
                        <div className="flex items-center gap-2">
                            {purchased ? (
                                <a href={`/company/applicants/${a.id}/profile`} className="inline-block">
                                    <Button className="view-btn btn-2">Applicant Profile</Button>
                                </a>
                            ) : (
                                <Button onClick={() => openBuyDialog(a.id)} className="bg-green-600 hover:bg-green-700 text-white">
                                    Buy Info
                                </Button>
                            )}
                            <ChatButton status={a.status} userId={applicantUserId} />
                        </div>
                    </TableCell>
                </TableRow>
            );
        });
    };

    return (
        <PermissionGate permission="view_dashboard" role="company" fallback={<div className="p-6">You don't have permission to access this page.</div>}>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Company Applicants" />
                
                <div className="space-y-6">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
                        <div className="flex items-center gap-3 mb-2">
                            <Users size={32} className="sm:w-10 sm:h-10" />
                            <h1 className="text-2xl sm:text-3xl font-bold">Company Applicants</h1>
                        </div>
                        <p className="text-blue-100 text-sm sm:text-base">
                            Manage and review applications from potential franchisees
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <Card className="shadow-md">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Applicants</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                                    </div>
                                    <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                        <Users className="text-blue-600 dark:text-blue-400" size={24} />
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

                        <Card className="shadow-md">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Interested</p>
                                        <p className="text-2xl font-bold text-purple-600">{stats.interested}</p>
                                    </div>
                                    <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                                        <FileText className="text-purple-600 dark:text-purple-400" size={24} />
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
                                        placeholder="Search by name, email, or brand..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Input
                                    type="date"
                                    placeholder="Filter by date..."
                                    value={createdAtFilter}
                                    onChange={(e) => setCreatedAtFilter(e.target.value)}
                                    className="w-full sm:w-[200px]"
                                />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="rounded-md border border-gray-300 dark:border-neutral-600 dark:bg-neutral-800 text-sm px-3 py-2 h-10 w-full sm:w-[200px]"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="interested">Interested</option>
                                    <option value="paid">Paid</option>
                                </select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Applicants Table */}
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle>Applicants List</CardTitle>
                        </CardHeader>

                        <CardContent>
                            {loading && filteredApplicants.length === 0 ? (
                                <div className="flex justify-center items-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                </div>
                            ) : !filteredApplicants.length ? (
                                <div className="text-center py-12">
                                    <Users className="mx-auto text-gray-400 mb-4" size={48} />
                                    <p className="text-gray-600 dark:text-gray-400 font-medium">No applicants found</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                                        {searchTerm || statusFilter || createdAtFilter
                                            ? 'Try adjusting your search or filter criteria'
                                            : 'When applicants apply to your companies, they will appear here.'}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="hidden md:block overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="min-w-[150px]">Name</TableHead>
                                                    <TableHead className="min-w-[150px]">Brand Name</TableHead>
                                                    <TableHead className="min-w-[200px]">Status</TableHead>
                                                    <TableHead className="min-w-[120px]">Applied On</TableHead>
                                                    <TableHead className="min-w-[220px]">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>{renderRows()}</TableBody>
                                        </Table>
                                    </div>

                                    {/* Mobile View */}
                                    <div className="md:hidden space-y-3">
                                {loading && filteredApplicants.length === 0 ? (
                                    <>
                                        {Array.from({ length: 3 }).map((_, i) => (
                                            <ApplicationCardSkeleton key={i} />
                                        ))}
                                    </>
                                ) : filteredApplicants.length === 0 ? (
                                    <p className="text-center text-gray-500 p-4">No applicants found matching your criteria.</p>
                                ) : (
                                    filteredApplicants.map((a: any) => {
                                        const purchased = Array.isArray(paidFieldsMap[a.id]) && paidFieldsMap[a.id].includes("package");
                                        const basicInfo = a.user?.basicInfo || a.user?.basic_info;
                                        const firstName = basicInfo?.first_name ?? "";
                                        const lastName = basicInfo?.last_name ?? "";
                                        const fullName = firstName && lastName ? `${firstName} ${lastName}` : firstName || "N/A";
                                        
                                        return (
                                            <Card key={a.id} className="mb-3 shadow-sm border-2 dark:border-neutral-700">
                                                <CardHeader className="p-4 flex items-center justify-between">
                                                    <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                                        <User className="w-5 h-5 text-blue-500" />
                                                        {fullName}
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="p-4 pt-0 space-y-3 text-sm text-gray-600 dark:text-gray-400">
                                                    
                                                    <div className="flex items-center justify-between">
                                                        <span className="flex items-center gap-2 font-medium"><Building className="h-4 w-4" /> Brand Name</span>
                                                        <strong>{a.company?.brand_name ?? "N/A"}</strong>
                                                    </div>
                                                    
                                                    <div className="flex flex-col gap-1 border-t pt-3">
                                                         <label className="text-xs font-medium">Application Status</label>
                                                         <select
                                                            value={a.status}
                                                            onChange={(e) => handleStatusChange(a.id, e.target.value)}
                                                            className="rounded-md border-gray-300 dark:border-neutral-600 dark:bg-neutral-800 text-sm px-2 py-1.5 w-full"
                                                        >
                                                            {statusOptions.map((status) => (
                                                                <option key={status} value={status}>
                                                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                                                </option>
                                                            ))}
                                                        </select>
                                                         <div className="mt-1">
                                                            {a.status === "pending" && <Badge variant="secondary">Pending</Badge>}
                                                            {a.status === "approved" && <Badge className="bg-green-500 hover:bg-green-500">Approved</Badge>}
                                                            {a.status === "rejected" && <Badge variant="destructive" className="text-white">Rejected</Badge>}
                                                            {a.status === "interested" && <Badge variant="outline">Interested</Badge>}
                                                            {a.status === "paid" && <Badge className="bg-yellow-600">Paid</Badge>}
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="pt-3 flex gap-2">
                                                        {purchased ? (
                                                            <a href={`/company/applicants/${a.id}/profile`} className="flex-1"><Button className="w-full">Applicant Profile</Button></a>
                                                        ) : (
                                                            <Button onClick={() => openBuyDialog(a.id)} className="bg-green-600 hover:bg-green-700 text-white flex-1">Buy Info</Button>
                                                        )}
                                                        <ChatButton status={a.status} userId={a.user?.id} />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })
                                )}
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <PaymentConfirmationDialog
                        open={confirmationOpen}
                        onOpenChange={setConfirmationOpen}
                        cost={purchaseCost}
                        balance={userBalance}
                        onConfirm={handleConfirmBuy}
                    />
                    
                    {/* NEW STATUS MESSAGE DIALOG INTEGRATION */}
                    <StatusMessageDialog
                        open={isMessageDialogOpen}
                        onClose={() => setIsMessageDialogOpen(false)}
                        title={dialogTitle}
                        message={dialogMessage}
                        status={dialogStatus}
                    />
                </div>
            </AppLayout>
        </PermissionGate>
    );
}