import { useEffect, useState, useRef, useMemo } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import TablePagination from '@/components/ui/table-pagination';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Can } from '@/components/PermissionGate';
import { UserCheck, Search, Clock, CheckCircle2, XCircle, AlertCircle, Mail, Calendar, User } from 'lucide-react';

interface ReactivationRequest {
    id: number | string;
    type?: 'reactivation' | 'deactivation';
    user_id: number;
    email: string;
    reason?: string;
    status: 'pending' | 'approved' | 'rejected' | 'pending_deactivation';
    reviewed_by?: number;
    reviewed_at?: string;
    admin_notes?: string;
    created_at: string;
    deactivation_scheduled_at?: string;
    user?: {
        id: number;
        email: string;
        basicInfo?: {
            first_name?: string;
            last_name?: string;
        };
    };
    reviewedBy?: {
        id: number;
        email: string;
    };
}

interface PaginatedData<T> {
    data: T[];
    total: number;
    from: number;
    to: number;
    current_page: number;
    last_page: number;
    per_page: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface PageProps {
    flash?: { message?: string; success?: string };
    filters?: { search?: string; status?: string; type?: string };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Reactivation Requests', href: '/admin/reactivation-requests' }
];

export default function ReactivationRequests({
    requests = { data: [], total: 0, from: 0, to: 0, current_page: 1, last_page: 1, per_page: 15, links: [] },
    filters = {}
}: {
    requests?: PaginatedData<ReactivationRequest>;
    filters?: { search?: string; status?: string; type?: string };
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [selectedType, setSelectedType] = useState(filters.type || 'all');
    const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<ReactivationRequest | null>(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const debounceRef = useRef<number | null>(null);
    
    const { flash } = usePage().props as unknown as PageProps;

    useEffect(() => {
        if (flash?.message) toast.success(flash.message);
        if (flash?.success) toast.success(flash.success);
    }, [flash?.message, flash?.success]);

    const handleInstantSearch = (value: string, status: string, type: string = 'all') => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = window.setTimeout(() => {
            setLoading(true);
            router.get(
                '/admin/reactivation-requests',
                { 
                    search: value || undefined, 
                    status: status === 'all' ? undefined : status,
                    type: type === 'all' ? undefined : type
                },
                {
                    preserveState: true,
                    replace: true,
                    onFinish: () => setLoading(false)
                }
            );
        }, 300);
    };

    const openApproveDialog = (request: ReactivationRequest) => {
        setSelectedRequest(request);
        setAdminNotes('');
        setIsApproveDialogOpen(true);
    };

    const openRejectDialog = (request: ReactivationRequest) => {
        setSelectedRequest(request);
        setAdminNotes('');
        setIsRejectDialogOpen(true);
    };

    const handleApprove = () => {
        if (!selectedRequest) return;
        
        router.post(
            `/admin/reactivation-requests/${selectedRequest.id}/approve`,
            { admin_notes: adminNotes || null },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsApproveDialogOpen(false);
                    setSelectedRequest(null);
                    setAdminNotes('');
                    toast.success('Account reactivated successfully!');
                },
                onError: () => {
                    toast.error('Failed to approve reactivation request.');
                }
            }
        );
    };

    const handleReject = () => {
        if (!selectedRequest || !adminNotes.trim()) {
            toast.error('Please provide a reason for rejection.');
            return;
        }

        router.post(
            `/admin/reactivation-requests/${selectedRequest.id}/reject`,
            { admin_notes: adminNotes },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsRejectDialogOpen(false);
                    setSelectedRequest(null);
                    setAdminNotes('');
                    toast.success('Reactivation request rejected.');
                },
                onError: () => {
                    toast.error('Failed to reject reactivation request.');
                }
            }
        );
    };

    const stats = useMemo(() => {
        if (!requests || !requests.data) {
            return { pending: 0, approved: 0, rejected: 0, pendingDeactivation: 0, total: 0 };
        }
        const pending = requests.data.filter(r => r.status === 'pending').length;
        const approved = requests.data.filter(r => r.status === 'approved').length;
        const rejected = requests.data.filter(r => r.status === 'rejected').length;
        const pendingDeactivation = requests.data.filter(r => r.status === 'pending_deactivation').length;
        return { pending, approved, rejected, pendingDeactivation, total: requests.total || 0 };
    }, [requests]);

    const getStatusBadge = (status: string, type?: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400"><Clock size={14} className="mr-1" />Pending</Badge>;
            case 'pending_deactivation':
                return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400"><Clock size={14} className="mr-1" />Pending Deactivation</Badge>;
            case 'approved':
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400"><CheckCircle2 size={14} className="mr-1" />Approved</Badge>;
            case 'rejected':
                return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400"><XCircle size={14} className="mr-1" />Rejected</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Can permission="view_users">
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Reactivation Requests" />

                <div className="space-y-6">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
                        <div className="flex items-center gap-3 mb-2">
                            <UserCheck size={32} className="sm:w-10 sm:h-10" />
                            <h1 className="text-2xl sm:text-3xl font-bold">Reactivation Requests</h1>
                        </div>
                        <p className="text-blue-100 text-sm sm:text-base">
                            Manage user account reactivation requests
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="shadow-md">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Requests</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                                    </div>
                                    <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                        <Mail className="text-blue-600 dark:text-blue-400" size={24} />
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
                                        <CheckCircle2 className="text-green-600 dark:text-green-400" size={24} />
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
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Deactivation</p>
                                        <p className="text-2xl font-bold text-orange-600">{stats.pendingDeactivation}</p>
                                    </div>
                                    <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                                        <Clock className="text-orange-600 dark:text-orange-400" size={24} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle>Filters</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <Input
                                        placeholder="Search by email or name..."
                                        value={search}
                                        onChange={(e) => {
                                            setSearch(e.target.value);
                                            handleInstantSearch(e.target.value, selectedStatus, selectedType);
                                        }}
                                        className="pl-10"
                                    />
                                </div>
                                <Select
                                    value={selectedStatus}
                                    onValueChange={(value) => {
                                        setSelectedStatus(value);
                                        handleInstantSearch(search, value, selectedType);
                                    }}
                                >
                                    <SelectTrigger className="w-full sm:w-[200px]">
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="pending_deactivation">Pending Deactivation</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={selectedType}
                                    onValueChange={(value) => {
                                        setSelectedType(value);
                                        handleInstantSearch(search, selectedStatus, value);
                                    }}
                                >
                                    <SelectTrigger className="w-full sm:w-[200px]">
                                        <SelectValue placeholder="Filter by type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="reactivation">Reactivation Requests</SelectItem>
                                        <SelectItem value="deactivation">Pending Deactivations</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Requests Table */}
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle>Reactivation Requests</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex justify-center items-center py-12">
                                    <div className="loader scale-75" />
                                </div>
                            ) : !requests || !requests.data || (Array.isArray(requests.data) && requests.data.length === 0) ? (
                                <div className="text-center py-12">
                                    <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
                                    <p className="text-gray-600 dark:text-gray-400 font-medium">No reactivation requests found.</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                                        When users request account reactivation, they will appear here.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>User</TableHead>
                                                    <TableHead>Email</TableHead>
                                                    <TableHead>Reason</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Requested</TableHead>
                                                    <TableHead>Reviewed</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {requests.data.map((request) => (
                                                    <TableRow key={request.id}>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <User size={18} className="text-gray-400" />
                                                                <span className="font-medium">
                                                                    {request.user?.basicInfo?.first_name && request.user?.basicInfo?.last_name
                                                                        ? `${request.user.basicInfo.first_name} ${request.user.basicInfo.last_name}`
                                                                        : 'N/A'}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="font-medium">{request.email}</TableCell>
                                                        <TableCell>
                                                            <div className="max-w-xs truncate" title={request.reason || 'No reason provided'}>
                                                                {request.reason || <span className="text-gray-400">—</span>}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-col gap-1">
                                                                {getStatusBadge(request.status, request.type)}
                                                                {request.type && (
                                                                    <span className="text-xs text-gray-500">
                                                                        {request.type === 'deactivation' ? 'Deactivation Request' : 'Reactivation Request'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-col gap-1">
                                                                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                                                    <Calendar size={14} />
                                                                    {formatDate(request.created_at)}
                                                                </div>
                                                                {request.deactivation_scheduled_at && (
                                                                    <div className="text-xs text-orange-600 dark:text-orange-400">
                                                                        Scheduled: {formatDate(request.deactivation_scheduled_at)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {request.reviewed_at ? (
                                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                    {formatDate(request.reviewed_at)}
                                                                    {request.reviewedBy && (
                                                                        <div className="text-xs text-gray-500">
                                                                            by {request.reviewedBy.email}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-400">—</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {request.status === 'pending_deactivation' ? (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => {
                                                                        if (confirm(`Cancel deactivation for ${request.email}?`)) {
                                                                            router.post(
                                                                                `/admin/users/${request.user_id}/cancel-deactivation`,
                                                                                {},
                                                                                {
                                                                                    preserveScroll: true,
                                                                                    onSuccess: () => {
                                                                                        toast.success('Deactivation cancelled successfully!');
                                                                                    },
                                                                                    onError: () => {
                                                                                        toast.error('Failed to cancel deactivation.');
                                                                                    }
                                                                                }
                                                                            );
                                                                        }
                                                                    }}
                                                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                                                >
                                                                    <XCircle size={16} className="mr-1" />
                                                                    Cancel Deactivation
                                                                </Button>
                                                            ) : request.status === 'pending' ? (
                                                                <div className="flex justify-end gap-2">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="default"
                                                                        onClick={() => openApproveDialog(request)}
                                                                        className="bg-green-600 hover:bg-green-700"
                                                                    >
                                                                        <CheckCircle2 size={16} className="mr-1" />
                                                                        Approve
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="destructive"
                                                                        onClick={() => openRejectDialog(request)}
                                                                    >
                                                                        <XCircle size={16} className="mr-1" />
                                                                        Reject
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <span className="text-sm text-gray-400">No actions</span>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {requests.last_page > 1 && (
                                        <div className="mt-4">
                                            <TablePagination 
                                                total={requests.total} 
                                                from={requests.from} 
                                                to={requests.to} 
                                                links={requests.links} 
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Approve Dialog */}
                <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <CheckCircle2 className="text-green-600" size={24} />
                                Approve Reactivation Request
                            </DialogTitle>
                            <DialogDescription>
                                Are you sure you want to approve this reactivation request? The account will be reactivated immediately.
                            </DialogDescription>
                        </DialogHeader>
                        {selectedRequest && (
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg">
                                    <p className="text-sm font-medium mb-2">User Information:</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Email: {selectedRequest.email}</p>
                                    {selectedRequest.reason && (
                                        <div className="mt-2">
                                            <p className="text-sm font-medium mb-1">Reason:</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{selectedRequest.reason}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="approve-notes">Admin Notes (Optional)</Label>
                                    <Textarea
                                        id="approve-notes"
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        placeholder="Add any notes about this approval..."
                                        className="min-h-[100px]"
                                        maxLength={500}
                                    />
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                                <CheckCircle2 size={16} className="mr-2" />
                                Approve & Reactivate
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Reject Dialog */}
                <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <XCircle className="text-red-600" size={24} />
                                Reject Reactivation Request
                            </DialogTitle>
                            <DialogDescription>
                                Please provide a reason for rejecting this reactivation request. This will be visible to the user.
                            </DialogDescription>
                        </DialogHeader>
                        {selectedRequest && (
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg">
                                    <p className="text-sm font-medium mb-2">User Information:</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Email: {selectedRequest.email}</p>
                                    {selectedRequest.reason && (
                                        <div className="mt-2">
                                            <p className="text-sm font-medium mb-1">User's Reason:</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{selectedRequest.reason}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="reject-notes">Rejection Reason <span className="text-red-500">*</span></Label>
                                    <Textarea
                                        id="reject-notes"
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        placeholder="Please explain why this request is being rejected..."
                                        className="min-h-[120px]"
                                        required
                                        maxLength={500}
                                    />
                                    <p className="text-xs text-gray-500">{adminNotes.length}/500 characters</p>
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button 
                                onClick={handleReject} 
                                variant="destructive"
                                disabled={!adminNotes.trim()}
                            >
                                <XCircle size={16} className="mr-2" />
                                Reject Request
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </AppLayout>
        </Can>
    );
}

