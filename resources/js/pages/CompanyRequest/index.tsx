import { useEffect, useState } from 'react';
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
import { toast } from 'sonner';
import { Permission, Role, SinglePermission, SingleRole } from '@/types/role_permission';
import TablePagination from '@/components/ui/table-pagination';
import { Badge } from '@/components/ui/badge';
import { Can } from '@/components/PermissionGate';

// Importing the actual Select components assuming they are from shadcn/ui which wrap Radix
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Company Registration Requests',
        href: '/company-requests', 
    }
];


export default function Roles({ roles }: { roles: Role }) {

    const { auth } = usePage().props as any;
    const role = auth.user.role;

    const [sampleCompanyStatus, setSampleCompanyStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');

    return (

        <AppLayout breadcrumbs={breadcrumbs}>
            <Head>
                <title>Company Request</title>
            </Head>
            <Card>
                <CardHeader className='flex justify-between items-center'>
                    <CardTitle>Registered Company Management</CardTitle>
                </CardHeader>
                <hr />
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Company Name</TableHead>
                                <TableHead>Date Created</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            
                            <TableRow>
                                <TableCell>1</TableCell>
                                <TableCell>Sample Company</TableCell>
                                <TableCell>2024-06-10</TableCell>
                                <TableCell>
                                    
                                    <Select
                                        value={sampleCompanyStatus}
                                        onValueChange={(value: 'pending' | 'approved' | 'rejected') => setSampleCompanyStatus(value)}
                                    >
                                        <SelectTrigger className="w-[180px]"> 
                                            <SelectValue placeholder="Select Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Status</SelectLabel>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="approved">Approved</SelectItem>
                                                <SelectItem value="rejected">Rejected</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    {sampleCompanyStatus === 'pending' && <Badge variant="secondary">Pending</Badge>}
                                    {sampleCompanyStatus === 'approved' && <Badge variant="success">Approved</Badge>}
                                    {sampleCompanyStatus === 'rejected' && <Badge variant="destructive">Rejected</Badge>}
                                </TableCell>
                            </TableRow>
                        </TableBody>

                    </Table>
                </CardContent>
            </Card>
        </AppLayout>

    );
}