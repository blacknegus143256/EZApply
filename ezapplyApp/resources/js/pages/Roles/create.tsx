import {useEffect, useState} from 'react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';

import { Head, Link, usePage, useForm, router } from '@inertiajs/react';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import { Permission, Role, SinglePermission } from '@/types/role_permission';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, ArrowLeft, CheckCircle2 } from 'lucide-react';



const breadcrumbs: BreadcrumbItem[] = [
    { 
      title: 'Create Role', 
      href: '/roles/create' 
    }
];



export default function Roles({ permissions }: { permissions: string[] }) {

  const {data, setData, post, errors, reset, processing} = useForm({
    name: '',
    permissions: [] as string []
  });

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log('Role Name:', data.name);
    console.log('Selected Permissions:', data.permissions);
    post('/roles')
  }

  const { auth } = usePage().props as any;
  const role = auth.user.role;
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Role" />
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Shield size={32} />
                            <div>
                                <h1 className="text-3xl font-bold">Create New Role</h1>
                                <p className="text-purple-100 mt-1">Define a new role and assign permissions</p>
                            </div>
                        </div>
                        <Link href={'/roles'}>
                            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                                <ArrowLeft size={18} className="mr-2" />
                                Go Back
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Form Card */}
                <Card className="shadow-lg">
                    <CardContent className="p-6">
                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <Label htmlFor='name' className="text-base font-semibold mb-2 block">
                                    Role Name
                                </Label>
                                <Input 
                                    id='name' 
                                    type='text' 
                                    name='name' 
                                    value={data.name} 
                                    onChange={(e) => setData('name', e.target.value)} 
                                    aria-invalid={!!errors.name}
                                    className="text-base"
                                    placeholder="e.g., Manager, Editor, Viewer"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div>
                                <Label className="text-base font-semibold mb-3 block">
                                    Select Permissions
                                </Label>
                                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 p-4 bg-gray-50 rounded-lg border border-gray-200'>
                                    {permissions.map((permission, index) => (
                                        <div key={index} className='flex items-center gap-2 p-2 hover:bg-white rounded transition-colors'>
                                            <Checkbox
                                                id={permission}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setData('permissions', [...data.permissions, permission]);
                                                    } else {
                                                        setData('permissions', data.permissions.filter((p) => p !== permission));
                                                    }
                                                }}
                                            />
                                            <Label htmlFor={permission} className="cursor-pointer text-sm font-medium">
                                                {permission}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                                {data.permissions.length > 0 && (
                                    <p className="mt-2 text-sm text-gray-600">
                                        <CheckCircle2 size={14} className="inline mr-1 text-green-600" />
                                        {data.permissions.length} permission{data.permissions.length !== 1 ? 's' : ''} selected
                                    </p>
                                )}
                            </div>

                            <div className='flex justify-end gap-3 pt-4 border-t'>
                                <Link href={'/roles'}>
                                    <Button type="button" variant="outline" size="lg">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button type='submit' disabled={processing} size="lg" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                                    <CheckCircle2 size={18} className="mr-2" />
                                    Create Role
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}