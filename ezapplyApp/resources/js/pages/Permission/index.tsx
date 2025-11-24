import {useEffect, useState} from 'react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';

import { Head, Link, usePage, useForm } from '@inertiajs/react';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Key, Loader2, Plus, Edit, Trash2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogClose, DialogFooter, DialogHeader, DialogTitle, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import {toast} from 'sonner';
import { Permission, SinglePermission } from '@/types/role_permission';
import TablePagination from '@/components/ui/table-pagination';
import { Can } from '@/components/PermissionGate';



const breadcrumbs: BreadcrumbItem[] = [{ title: 'Permission', href: '/permission' }];


export default function Permissions({ permission} : {permission : Permission}) {
    const [openAddPermissionDialog, setOpenAddPermissionDialog] = useState(false);
    const [openEditPermissionDialog, setOpenEditPermissionDialog] = useState(false);
    const {data, setData, post, put, delete: destroy ,processing, errors, reset} = useForm({
        id: 0,
        name: ''
    })

const {flash} = usePage<{flash: {message?: string}}>().props; 

useEffect(() => {
    if(flash.message){
        setOpenAddPermissionDialog(false);
        setOpenEditPermissionDialog(false);
        toast.success(flash.message);
    }
}, [flash.message])

function submit(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    post('/permissions', {
        onSuccess: () => {
            reset('name');
            setOpenAddPermissionDialog(false);
        }
    })
}
function edit(permission: SinglePermission){
    setData('name', permission.name);
    setData('id', permission.id);
    setOpenEditPermissionDialog(true);
}

function update(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    put(`/permissions/${data.id}`, {
        onSuccess: () => {
            reset('name');
            setOpenEditPermissionDialog(false);
        }
    });
}

function deletePermission(id: number){
    destroy(`/permissions/${id}`)
}

  const { auth } = usePage().props as any;
  const role = auth.user.role;
  const totalPermissions = permission.data.length;
  
    return (
        <Can permission="view_permissions" role={role}>
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Permissions Management" />
            <div className="space-y-6">
                {/* Gradient Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-4xl font-bold flex items-center gap-3">
                                <Key size={40} />
                                Permissions Management
                            </h1>
                            <p className="mt-2 text-emerald-100">Manage system permissions and access controls</p>
                        </div>
                        <div className="text-right">
                            <Can permission="create_permissions">
                                <Button
                                    onClick={() => {
                                        setOpenAddPermissionDialog(true);
                                    }}
                                    className="bg-white text-emerald-600 hover:bg-emerald-50 font-bold shadow-lg"
                                >
                                    <Plus size={18} className="mr-2" />
                                    Add New Permission
                                </Button>
                            </Can>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                            <p className="text-emerald-100 text-sm font-medium">Total Permissions</p>
                            <p className="text-3xl font-bold mt-1">{totalPermissions}</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                            <p className="text-emerald-100 text-sm font-medium">Active Permissions</p>
                            <p className="text-3xl font-bold mt-1">{totalPermissions}</p>
                        </div>
                    </div>
                </div>

                {/* Table Card */}
                <Card className="shadow-lg">
                    <CardContent className="p-0">
                        {permission.data.length > 0 ? (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-gray-50">
                                        <TableRow>
                                            <TableHead className="font-semibold">Permission Name</TableHead>
                                            <TableHead className="font-semibold">Created At</TableHead>
                                            <TableHead className="font-semibold text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {permission.data.map((permission, index) => (
                                            <TableRow key={permission.id} className="hover:bg-gray-50 transition-colors">
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <ShieldCheck size={16} className="text-emerald-600" />
                                                        <span className="font-semibold">{permission.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-gray-600">{permission.created_at}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Can permission="edit_permissions">
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm"
                                                                onClick={() => edit(permission)}
                                                                className="gap-1"
                                                            >
                                                                <Edit size={14} />
                                                                Edit
                                                            </Button>
                                                        </Can>
                                                        <Can permission="delete_permissions">
                                                            <Button 
                                                                variant="destructive" 
                                                                size="sm"
                                                                className="gap-1 ml-2"
                                                                onClick={() => deletePermission(permission.id)}
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
                                <Key size={56} className="mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500 font-bold text-lg">No permissions found</p>
                                <p className="text-sm text-gray-400 mt-2">Get started by creating your first permission</p>
                            </div>
                        )}
                    </CardContent>
                    {permission.data.length > 0 && (
                        <div className="border-t">
                            <TablePagination total={permission.total} from={permission.from} to={permission.to} links={permission.links}/>
                        </div>
                    )}
                </Card>

                {/* Add Permission Dialog */}
                <Dialog open={openAddPermissionDialog} onOpenChange={setOpenAddPermissionDialog}>
                    <DialogContent className='sm:max-w-[500px]'>
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                <Plus className="text-emerald-600" size={24} />
                                Add New Permission
                            </DialogTitle>
                        </DialogHeader>
                        <hr />
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label htmlFor='name' className="text-sm font-semibold block mb-2">
                                    Permission Name
                                </label>
                                <Input 
                                    id="name" 
                                    type='text' 
                                    value={data.name} 
                                    onChange={(e)=> setData('name', e.target.value)}
                                    aria-invalid={!!errors.name}
                                    placeholder="e.g., view_users, create_roles"
                                    className="text-base"
                                />
                                <InputError message={errors.name} />
                            </div>
                            <DialogFooter className='mt-6 gap-2'>
                                <DialogClose asChild>
                                    <Button type="button" variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button 
                                    type='submit' 
                                    disabled={processing}
                                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                                >
                                    {processing && <Loader2 className='animate-spin mr-2' size={16}/>}
                                    <Plus size={16} className="mr-2" />
                                    Create Permission
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit Permission Dialog */}
                <Dialog open={openEditPermissionDialog} onOpenChange={setOpenEditPermissionDialog}>
                    <DialogContent className='sm:max-w-[500px]'>
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                <Edit className="text-emerald-600" size={24} />
                                Edit Permission
                            </DialogTitle>
                        </DialogHeader>
                        <hr />
                        <form onSubmit={update} className="space-y-4">
                            <div>
                                <label htmlFor='name' className="text-sm font-semibold block mb-2">
                                    Permission Name
                                </label>
                                <Input 
                                    id="name" 
                                    type='text' 
                                    value={data.name} 
                                    onChange={(e)=> setData('name', e.target.value)}
                                    aria-invalid={!!errors.name}
                                    placeholder="e.g., view_users, create_roles"
                                    className="text-base"
                                />
                                <InputError message={errors.name} />
                            </div>
                            <DialogFooter className='mt-6 gap-2'>
                                <DialogClose asChild>
                                    <Button type="button" variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button 
                                    type='submit' 
                                    disabled={processing}
                                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                                >
                                    {processing && <Loader2 className='animate-spin mr-2' size={16}/>}
                                    <Edit size={16} className="mr-2" />
                                    Update Permission
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

            </div>
        </AppLayout>
        </Can>
    );
}