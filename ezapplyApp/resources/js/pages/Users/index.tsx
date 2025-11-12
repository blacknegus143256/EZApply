import {useEffect, useState} from 'react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';

import { Head, Link, usePage, useForm, router } from '@inertiajs/react';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogClose, DialogFooter, DialogHeader, DialogTitle, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import {toast} from 'sonner';
import { Permission, Role, SinglePermission, SingleRole} from '@/types/role_permission';
import TablePagination from '@/components/ui/table-pagination';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types/user';
import PermissionGate, { AdminOnly, Can } from '@/components/PermissionGate';



const breadcrumbs: BreadcrumbItem[] = [
    { 
      title: 'Users', 
      href: '/users' 
    }
];



export default function Users({ users} : {users : User}) {

const [loading, setLoading] = useState(true);
const [deleting, setDeleting] = useState(false);
const {flash} = usePage<{flash: {message?: string}}>().props; 

useEffect(() => {
    if(flash.message){
        
        toast.success(flash.message);
    }
}, [flash.message])

useEffect(() => {
  if (users && users.data) {
    setLoading(false);
  }
}, [users]);

function deleteUser(id: number){
    if(confirm('Are you sure you want to delete this user?')){
    setDeleting(true);
        router.delete(`/users/${id}`,{
            onFinish: () => setDeleting(false),
    }); 
    }
}

  const { auth } = usePage().props as any;
  const role = auth.user.role;
    return (
        <Can permission="view_users" fallback={<div className="p-4">You don't have permission to view users.</div>}>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Permission" />
                <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {deleting && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70 dark:bg-neutral-900/60 rounded-xl">
                        <div className="loader scale-100"></div>
                    </div>
                    )}
                <Card>
                    <CardHeader className='flex justify-between items-center'>
                        <CardTitle>User Management</CardTitle>
                        <CardAction>
                            <Can permission="create_users">
                                <Link href={'users/create'}>
                                    <Button>Add new</Button>
                                </Link>
                            </Can>
                        </CardAction>
                    </CardHeader>
                    <hr />
                    <CardContent>
                        <Table>
                            <TableHeader className='bg-gray-100 '>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Created at</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                <TableRow>
                                <TableCell colSpan={6} className="text-center py-10">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                    <div className="loader scale-100"></div>
                                    <span className="text-sm text-gray-500">Loading users...</span>
                                    </div>
                                </TableCell>
                                </TableRow>
                            ) : users.data.map((user, index) => (
                                    <TableRow>
                                        <TableCell>{index+1}</TableCell>
                                        <TableCell>{user.first_name} {user.last_name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell className='flex flex-wrap gap-1'>
                                            {user.roles ? user.roles.split(', ').map((role, index) => (
                                                <Badge variant={'outline'} key={index}>
                                                    {role}
                                                </Badge>
                                            )) : '—'}
                                        </TableCell>
                                        <TableCell>{user.created_at}</TableCell>
                                        <TableCell>
                                            <Can permission="edit_users">
                                                <Link href={`/users/${user.id}/edit`}>
                                                    <Button variant={'outline'}>Edit</Button>
                                                </Link>
                                            </Can>
                                            <Can permission="delete_users">
                                                <Button variant={'destructive'} className='ml-2' 
                                                 disabled={loading} onClick={()=> deleteUser(user.id)}>Delete</Button>
                                            </Can>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                    {users.data.length > 0 ?(
                                            <TablePagination total={users.total} from={users.from} to={users.to} links={users.links}/>
                                        ):(
                                            <div className='flex h-full items-center justify-center'>No results found</div>
                                        )}

                </Card>
 

                </div>
            </AppLayout>
        </Can>
    );
}