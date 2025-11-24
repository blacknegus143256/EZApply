import {useEffect, useState} from 'react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';

import { Head, Link, usePage, useForm, router } from '@inertiajs/react';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Plus, Edit, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogClose, DialogFooter, DialogHeader, DialogTitle, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import {toast} from 'sonner';
import { Permission, Role, SinglePermission, SingleRole} from '@/types/role_permission';
import TablePagination from '@/components/ui/table-pagination';
import { Badge } from '@/components/ui/badge';
import { Can } from '@/components/PermissionGate';



const breadcrumbs: BreadcrumbItem[] = [
    { 
      title: 'Roles', 
      href: '/roles' 
    }
];



export default function Roles({ roles} : {roles : Role}) {


const {flash} = usePage<{flash: {message?: string}}>().props; 

useEffect(() => {
    if(flash.message){
        
        toast.success(flash.message);
    }
}, [flash.message])

function deleteRoles(id: number){
    if(confirm('Are you sure you want to delete this role?')){
        router.delete(`/roles/${id}`); 
    }
}

  const { auth } = usePage().props as any;
  const role = auth.user.role;
  const totalRoles = roles.data.length;
  const totalPermissions = roles.data.reduce((acc, role) => acc + role.permissions.length, 0);
  
    return (
        <Can permission="view_roles" fallback={<div className="p-4">You don't have permission to view roles.</div>}>
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles Management" />
            <div className="space-y-6">
                {/* Gradient Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-4xl font-bold flex items-center gap-3">
                                <Shield size={40} />
                                Roles Management
                            </h1>
                            <p className="mt-2 text-purple-100">Manage user roles and their permissions</p>
                        </div>
                        <div className="text-right">
                            <Can permission="create_roles">
                                <Link href={'roles/create'}>
                                    <Button className="bg-white text-purple-600 hover:bg-purple-50 font-bold shadow-lg">
                                        <Plus size={18} className="mr-2" />
                                        Add New Role
                                    </Button>
                                </Link>
                            </Can>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                            <p className="text-purple-100 text-sm font-medium">Total Roles</p>
                            <p className="text-3xl font-bold mt-1">{totalRoles}</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                            <p className="text-purple-100 text-sm font-medium">Total Permissions</p>
                            <p className="text-3xl font-bold mt-1">{totalPermissions}</p>
                        </div>
                    </div>
                </div>

                {/* Table Card */}
                <Card className="shadow-lg">
                    <CardContent className="p-0">
                        {roles.data.length > 0 ? (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-gray-50">
                                        <TableRow>
                                            <TableHead className="font-semibold">Role Name</TableHead>
                                            <TableHead className="font-semibold">Permissions</TableHead>
                                            <TableHead className="font-semibold">Created At</TableHead>
                                            <TableHead className="font-semibold text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {roles.data.map((role, index) => (
                                            <TableRow key={role.id} className="hover:bg-gray-50 transition-colors">
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Shield size={16} className="text-purple-600" />
                                                        <span className="font-semibold">{role.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {role.permissions.length > 0 ? (
                                                            role.permissions.map((perm, idx) => (
                                                                <Badge key={idx} variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                                                                    {perm}
                                                                </Badge>
                                                            ))
                                                        ) : (
                                                            <span className="text-gray-400 text-sm">No permissions</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-gray-600">{role.created_at}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Can permission="edit_roles">
                                                            <Link href={`/roles/${role.id}/edit`}>
                                                                <Button variant="outline" size="sm" className="gap-1">
                                                                    <Edit size={14} />
                                                                    Edit
                                                                </Button>
                                                            </Link>
                                                        </Can>
                                                        <Can permission="delete_roles">
                                                            <Button 
                                                                variant="destructive" 
                                                                size="sm" 
                                                                className="gap-1"
                                                                onClick={() => deleteRoles(role.id)}
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
                                <Shield size={56} className="mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500 font-bold text-lg">No roles found</p>
                                <p className="text-sm text-gray-400 mt-2">Get started by creating your first role</p>
                            </div>
                        )}
                    </CardContent>
                    {roles.data.length > 0 && (
                        <div className="border-t">
                            <TablePagination total={roles.total} from={roles.from} to={roles.to} links={roles.links} />
                        </div>
                    )}
                </Card>
            </div>
        </AppLayout>
        </Can>
    );
}