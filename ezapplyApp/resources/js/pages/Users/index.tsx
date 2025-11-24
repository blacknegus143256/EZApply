import { useEffect, useState, useRef } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogClose, DialogFooter, DialogHeader, DialogTitle, DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';
import TablePagination from '@/components/ui/table-pagination';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Can } from '@/components/PermissionGate';
import { Users as UsersIcon, Plus, Search, Edit, Trash2, UserCheck } from 'lucide-react';

interface User {
    id: number;
    first_name?: string;
    last_name?: string;
    email?: string;
    roles?: string;
    created_at?: string;
}

interface PaginatedData<T> {
    data: T[];
    total: number;
    from: number;
    to: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface PageProps {
    flash?: { message?: string };
    auth: { user: { id: number; role?: string } };
    filters?: { search?: string; role?: string };
    roles?: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Users', href: '/users' }
];

export default function Users({
    users,
    roles = [],
    filters = {}
}: {
    users: PaginatedData<User>;
    roles?: string[];
    filters?: { search?: string; role?: string };
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedRole, setSelectedRole] = useState(filters.role || 'all');
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [userToDeleteId, setUserToDeleteId] = useState<number | null>(null);
    const debounceRef = useRef<number | null>(null);
    
const [loading, setLoading] = useState(true);

useEffect(() => {
  if (users && users.data) {
    setLoading(false);
  }
}, [users]);
 const { flash, auth } = usePage().props as unknown as PageProps;

    useEffect(() => {
        if (flash?.message) toast.success(flash.message);
    }, [flash?.message]);

    const openDeleteDialog = (id: number) => {
        setUserToDeleteId(id);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!userToDeleteId) return;
        router.delete(`/users/${userToDeleteId}`, {
            preserveScroll: true,
            onFinish: () => {
                setIsDeleteDialogOpen(false);
                setUserToDeleteId(null);
            },
            onError: () => toast.error('Failed to delete user. Please try again.'),
        });
    };

    const handleInstantSearch = (value: string, role: string) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = window.setTimeout(() => {
            setLoading(true);
            router.get(
                '/users',
                { search: value || undefined, role: role === 'all' ? undefined : role },
                {
                    preserveState: true,
                    replace: true,
                    onFinish: () => setLoading(false)
                }
            );
        });
    };

    const totalUsers = users.total || users.data.length;
    const filteredUsersCount = users.data.length;

    return (
        <Can permission="view_users" fallback={<div className="p-4">You don't have permission to view users.</div>}>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="User Management" />
                <div className="space-y-6">
                    {/* Gradient Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-4xl font-bold flex items-center gap-3">
                                    <UsersIcon size={40} />
                                    User Management
                                </h1>
                                <p className="mt-2 text-indigo-100">Manage user accounts and their roles</p>
                            </div>
                            <div className="text-right">
                                <p className="text-indigo-100 text-sm font-medium">Total Users</p>
                                <p className="text-5xl font-bold">{totalUsers}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                            <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                                <p className="text-indigo-100 text-sm font-medium">Total Users</p>
                                <p className="text-3xl font-bold mt-1">{totalUsers}</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                                <p className="text-indigo-100 text-sm font-medium">Filtered Results</p>
                                <p className="text-3xl font-bold mt-1">{filteredUsersCount}</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                                <Can permission="create_users">
                                    <Link href={'users/create'}>
                                        <Button className="bg-white text-indigo-600 hover:bg-indigo-50 font-bold shadow-lg w-full">
                                            <Plus size={18} className="mr-2" />
                                            Add New User
                                        </Button>
                                    </Link>
                                </Can>
                            </div>
                        </div>

                        {/* Search and Filter */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-200" size={20} />
                                <Input
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        handleInstantSearch(e.target.value, selectedRole);
                                    }}
                                    placeholder="Search by name or email..."
                                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-indigo-200 focus:bg-white/20"
                                />
                            </div>
                            <Select
                                value={selectedRole}
                                onValueChange={(value) => {
                                    setSelectedRole(value);
                                    handleInstantSearch(search, value);
                                }}
                            >
                                <SelectTrigger className="w-full sm:w-[200px] bg-white/10 border-white/20 text-white">
                                    <SelectValue placeholder="Filter by Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    {roles.map((role, i) => (
                                        <SelectItem key={i} value={role}>{role}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Table Card */}
                    <Card className="shadow-lg">

                        <CardContent className="p-0">
                            {loading ? (
                                <div className="flex items-center justify-center py-16">
                                    <div className="loader" />
                                </div>
                            ) : users.data.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-gray-50">
                                            <TableRow>
                                                <TableHead className="w-[200px] font-semibold">Name</TableHead>
                                                <TableHead className="font-semibold">Email</TableHead>
                                                <TableHead className="font-semibold">Role(s)</TableHead>
                                                <TableHead className="font-semibold">Created At</TableHead>
                                                <TableHead className="text-right font-semibold">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {users.data.map((user) => (
                                                <TableRow key={user.id} className="hover:bg-gray-50 transition-colors">
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-2">
                                                            <UserCheck size={16} className="text-indigo-600" />
                                                            <span>{user.first_name ? user.first_name : 'N/A'} {user.last_name ? user.last_name : 'N/A'}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{user.email ? user.email : ''}</TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-wrap gap-1">
                                                            {(user.roles ? user.roles : '').split(', ').map((role, index) => (
                                                                <Badge key={index} variant='secondary' className="bg-indigo-100 text-indigo-700 border-indigo-200 rounded-full px-3 py-1 text-xs">
                                                                    {role}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-gray-600">{user.created_at ?? ''}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Can permission="edit_users">
                                                                <Link href={`/users/${user.id}/edit`}>
                                                                    <Button variant='outline' size='sm' className="gap-1">
                                                                        <Edit size={14} />
                                                                        Edit
                                                                    </Button>
                                                                </Link>
                                                            </Can>
                                                            <Can permission="delete_users">
                                                                <Button
                                                                    variant='destructive'
                                                                    size='sm'
                                                                    onClick={() => openDeleteDialog(user.id)}
                                                                    disabled={auth.user.id === user.id}
                                                                    className="gap-1"
                                                                >
                                                                    <Trash2 size={14} />
                                                                    Delete
                                                                </Button>
                                                            </Can>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                    <UsersIcon size={56} className="mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-500 font-bold text-lg">No users found</p>
                                    <p className="text-sm text-gray-400 mt-2">
                                        {search || selectedRole !== 'all' 
                                            ? 'Try adjusting your search or filter criteria' 
                                            : 'Get started by creating your first user'}
                                    </p>
                                </div>
                            )}
                        </CardContent>

                        {users.data.length > 0 && (
                            <div className="border-t">
                                <TablePagination total={users.total} from={users.from} to={users.to} links={users.links} />
                            </div>
                        )}
                    </Card>
                </div>
            </AppLayout>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-red-600">
                            Confirm User Deletion
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4 text-gray-700">
                        Are you sure you want to delete this user (ID: <b>{userToDeleteId}</b>)? This action cannot be undone.
                    </div>
                    <DialogFooter className="flex flex-wrap gap-2">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" className="w-full sm:w-auto">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            className="w-full sm:w-auto"
                        >
                            Delete User
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Can>
    );
}
