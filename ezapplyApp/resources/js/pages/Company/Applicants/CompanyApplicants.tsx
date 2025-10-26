import React, { useState, useMemo, useEffect } from "react";
import { Head, usePage, router } from "@inertiajs/react";
import "../../../../css/easyApply.css";
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
import { Loader2, User, Mail, Calendar, Settings } from "lucide-react";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import PermissionGate from "@/components/PermissionGate";
import { Button } from "@/components/ui/button";
import ChatButton from "@/components/ui/chat-button";
import ViewProfileDialog from "@/components/ViewProfileDialog";
import { Application } from "@/types/applicants";

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Company Applicants", href: "/company/applicants" },
];

type ApplicantData = {
    user: any;
    id: number;
    status: string;
    created_at: string;
};

const statusOptions = ["pending", "approved", "rejected", "interested"];

const ApplicantCard: React.FC<{ 
    applicant: ApplicantData; 
    maskValue: (value: any) => string;
    visibleFields: Record<string, boolean>;
    handleStatusChange: (id: number, status: string) => void;
    handleCustomerClick: (application: any) => void;
}> = ({ applicant, maskValue, visibleFields, handleStatusChange, handleCustomerClick }) => {
    
    const firstName = applicant.user?.basicinfo?.first_name ?? "";
    const lastName = applicant.user?.basicinfo?.last_name ?? "";
    const fullName = `${firstName} ${lastName}`;
    const email = applicant.user?.email ?? "N/A";
    const createdDate = applicant.created_at ? new Date(applicant.created_at).toLocaleDateString() : "N/A";

    const showName = visibleFields?.first_name || visibleFields?.last_name;
    const showEmail = visibleFields?.email;

    return (
        <Card className="mb-3 shadow-sm border-2 dark:border-neutral-700">
            <CardHeader className="p-4 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-500"/>
                    {showName ? fullName : maskValue("name")} 
                </CardTitle>
            </CardHeader>

            <CardContent className="p-4 pt-0 space-y-3 text-sm text-gray-600 dark:text-gray-400">
                
                {/* Email */}
                <div className="flex items-center justify-between border-t pt-3 border-gray-100 dark:border-neutral-800">
                    <span className="flex items-center gap-2 font-medium">
                        <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        Email:
                    </span>
                    <strong className="text-gray-900 dark:text-white">
                        {showEmail ? email : maskValue("email")}
                    </strong>
                </div>

                {/* Created Date */}
                <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-medium">
                        <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        Applied On:
                    </span>
                    <strong className="text-gray-900 dark:text-white">{createdDate}</strong>
                </div>

                {/* Status*/}
                <div className="flex flex-col items-start gap-2 border-t pt-3">
                    <span className="flex items-center gap-2 font-medium">
                        <Settings className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        Update Status:
                    </span>
                    <div className="flex flex-col gap-1 w-full">
                        <select
                            value={applicant.status}
                            onChange={(e) => handleStatusChange(applicant.id, e.target.value)}
                            className="rounded-md border-gray-300 dark:border-neutral-600 dark:bg-neutral-800 text-sm p-1.5 w-full"
                        >
                            {statusOptions.map((status) => (
                                <option key={status} value={status}>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </option>
                            ))}
                        </select>
                        <div className="mt-1 flex justify-center">
                            {applicant.status === "pending" && <Badge variant="secondary">Pending 🟡</Badge>}
                            {applicant.status === "approved" && <Badge variant="secondary">Approved 🟢</Badge>}
                            {applicant.status === "rejected" && <Badge variant="destructive">Rejected 🔴</Badge>}
                            {applicant.status === "interested" && <Badge variant="outline">Interested 🔵</Badge>}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="pt-3 flex flex-col gap-2">
                    <Button 
                        onClick={() => handleCustomerClick(applicant as unknown as Application)} 
                        className="view-btn btn-2 cursor-pointer w-full text-sm"
                    >
                        View Applicant Profile
                    </Button>
                    <ChatButton status={applicant.status} userId={applicant.user?.id} className="w-full text-sm" />
                </div>
            </CardContent>
        </Card>
    );
};

export default function CompanyApplicants() {
    const { props } = usePage<any>();
    const applicants = props.applicants ?? [];

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [createdAtFilter, setCreatedAtFilter] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [error] = useState<string | null>(null);

    const [selectedApplicant, setSelectedApplicant] = useState<Application | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [visibleFields, setVisibleFields] = useState<Record<number, Record<string, boolean>>>({});
    const [paidFields, setPaidFields] = useState<Record<number, string[]>>({});

    const maskValue = (value: any) => "********";

    const filteredApplicants = useMemo(() => {
        return applicants.filter((a: any) =>{
            const firstName = a.user?.basicinfo?.first_name ?? "";
            const lastName = a.user?.basicinfo?.last_name ?? "";
            const email = a.user?.email ?? "";
            const fullName = `${firstName} ${lastName} ${email}`.toLowerCase();

            const matchesSearch = fullName.includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === "" || a.status === statusFilter;

            let matchesCreatedAt = true;
            if (createdAtFilter) {
                if (a.created_at) {
                    matchesCreatedAt = a.created_at.includes(createdAtFilter);
                } else {
                    matchesCreatedAt = false;
                }
            }
            return matchesSearch && matchesStatus && matchesCreatedAt;
        });
    }, [applicants, searchTerm, statusFilter, createdAtFilter]);

        useEffect(() => {
        let isMounted = true; 
        
        async function fetchPaidFields() {
            if (!isMounted) return;

            setLoading(true);
            
            const newPaidFields: Record<number, string[]> = {};
            const newVisibleFields: Record<number, Record<string, boolean>> = {};
            
            try {
                const fetchPromises = applicants.map(async (applicant: any) => {
                    const res = await fetch(`/check-applicant-view/${applicant.id}`); 
                    
                    if (!res.ok) {
                        console.error(`API call failed for ID ${applicant.id}. Status: ${res.status}`);
                        return null;
                    }
                    
                    const data = await res.json();
                    
                    if (Array.isArray(data.paid_fields)) {
                        const revealed: Record<string, boolean> = {};
                        data.paid_fields.forEach((f: string) => (revealed[f] = true));
                        
                        return { 
                            id: applicant.id, 
                            paid_fields: data.paid_fields, 
                            visible_fields: revealed 
                        };
                    }
                    return null;
                });
                
                const results = await Promise.all(fetchPromises);
                
                results.forEach(result => {
                    if (result) {
                        newPaidFields[result.id] = result.paid_fields;
                        newVisibleFields[result.id] = result.visible_fields;
                    }
                });

                if (isMounted) {
                    setPaidFields((prev) => ({ ...prev, ...newPaidFields }));
                    setVisibleFields((prev) => ({ ...prev, ...newVisibleFields }));
                }
                
            } catch (err) {
                if (isMounted) {
                    console.error("Critical error during batch fetch:", err);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        if (applicants.length > 0) fetchPaidFields();
        
        return () => {
            isMounted = false;
        };
        
    }, [applicants]);

    const handleStatusChange = (id: number, status: string) => {
        router.put(`/company/applicants/${id}/status`, { status }, {
            preserveScroll: true,
        });
    };

    const handleCustomerClick = (application : any) => {
        setSelectedApplicant(application);
        setIsDialogOpen(true);
    }

    const renderTableRows = () => {
        if (loading) {
            return (
                <TableRow>
                    <TableCell colSpan={5} className="text-center">
                        <Loader2 className="h-6 w-6 animate-spin inline-block mr-2" />
                        Loading applicants...
                    </TableCell>
                </TableRow>
            );
        }
        if (error) {
            return (
                <TableRow>
                    <TableCell colSpan={5} className="text-center text-red-500">
                        {error}
                    </TableCell>
                </TableRow>
            );
        }
        if (filteredApplicants.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500">
                        No applicants found matching your criteria.
                    </TableCell>
                </TableRow>
            );
        }
        
        return filteredApplicants.map((a: any) => {
            const showName = visibleFields[a.id]?.first_name || visibleFields[a.id]?.last_name;
            const showEmail = visibleFields[a.id]?.email;
            
            return (
                <TableRow key={a.user?.id ?? a.id}>
                    <TableCell className="font-medium">
                        {showName ? 
                            `${a.user?.basicinfo?.first_name ?? ""} ${a.user?.basicinfo?.last_name ?? ""}` : 
                            maskValue("name")
                        }
                    </TableCell>
                    <TableCell>
                        {showEmail ? a.user?.email ?? "No email" : maskValue("email")}
                    </TableCell>
                    <TableCell>
                        <select
                            value={a.status}
                            onChange={(e) => handleStatusChange(a.id, e.target.value)}
                            className="rounded-md border-gray-300 dark:border-neutral-600 dark:bg-neutral-800 text-sm"
                        >
                            {statusOptions.map((status) => (
                                <option key={status} value={status}>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </option>
                            ))}
                        </select>
                        <div className="mt-1">
                            {a.status === "pending" && <Badge variant="secondary">Pending 🟡</Badge>}
                            {a.status === "approved" && <Badge variant="secondary">Approved 🟢</Badge>}
                            {a.status === "rejected" && <Badge variant="destructive">Rejected 🔴</Badge>}
                            {a.status === "interested" && <Badge variant="outline">Interested 🔵</Badge>}
                        </div>
                    </TableCell>
                    <TableCell>{a.created_at ? new Date(a.created_at).toLocaleDateString() : "N/A"}</TableCell>
                    <TableCell className="min-w-[200px]">
                        <div className="flex items-center gap-2">
                            <Button onClick={() => handleCustomerClick(a as unknown as Application)} className="view-btn btn-2 cursor-pointer">
                                Profile
                            </Button>
                            <ChatButton status={a.status} userId={a.user?.id} />
                        </div>
                    </TableCell>
                </TableRow>
            );
        });
    };
    
    return (
        <PermissionGate
            permission="view_dashboard"
            role="company"
            fallback={<div className="p-6">You don't have permission to access this page.</div>}
        >
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Company Applicants" />
                <div className="bg-across-pages min-h-screen p-5">
                    <Card className="rounded-xl shadow-lg dark:bg-neutral-900">
                        <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 p-4 md:p-6">
                            <CardTitle className="text-2xl font-bold">Company Applicants</CardTitle>
                            
                            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto items-start"> 
                                
                                <Input
                                    type="text"
                                    placeholder="Search applicant..."
                                    className="w-full sm:w-auto min-w-[160px]"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                
                                <Input
                                    type="date"
                                    placeholder="Filter by created date..."
                                    className="w-full sm:w-auto min-w-[140px]"
                                    value={createdAtFilter}
                                    onChange={(e) => setCreatedAtFilter(e.target.value)}
                                />
                                
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="rounded-md border-gray-300 dark:border-neutral-600 dark:bg-neutral-800 text-sm px-3 py-2 h-10 w-full sm:w-auto min-w-[120px]"
                                >
                                    <option value="">All Statuses</option>
                                    {statusOptions.map((status) => (
                                        <option key={status} value={status}>
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </CardHeader>
                        
                        <hr className="border-gray-200 dark:border-neutral-800" />

                        <CardContent className="p-0">
                            <div className="hidden md:block overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="min-w-[150px]">Name</TableHead>
                                            <TableHead className="min-w-[150px]">Email</TableHead>
                                            <TableHead className="min-w-[200px]">Status</TableHead>
                                            <TableHead className="min-w-[120px]">Created At</TableHead>
                                            <TableHead className="min-w-[220px]">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {renderTableRows()}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="md:hidden p-4 space-y-3">
                                {loading ? (
                                    <div className="text-center text-gray-500 p-4">
                                        <Loader2 className="h-6 w-6 animate-spin inline-block mr-2" />
                                        Loading applicants...
                                    </div>
                                ) : filteredApplicants.length === 0 ? (
                                    <p className="text-center text-gray-500 p-4">
                                        No applicants found matching your criteria.
                                    </p>
                                ) : (
                                    filteredApplicants.map((a: any) => (
                                        <ApplicantCard 
                                            key={a.user?.id ?? a.id} 
                                            applicant={a} 
                                            maskValue={maskValue}
                                            visibleFields={visibleFields[a.id] || {}}
                                            handleStatusChange={handleStatusChange}
                                            handleCustomerClick={handleCustomerClick}
                                        />
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Modal */}
                    <ViewProfileDialog
                        open={isDialogOpen}
                        onOpenChange={setIsDialogOpen}
                        application={selectedApplicant}
                    />
                </div>
            </AppLayout>
        </PermissionGate>
    );
}