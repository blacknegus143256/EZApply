import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage, useForm, router } from '@inertiajs/react';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import { Permission, Role, SinglePermission } from '@/types/role_permission';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import password from '@/routes/password';
import { UserRole } from '@/types/user';



const breadcrumbs: BreadcrumbItem[] = [
    { 
      title: 'Edit Users', 
      href: '/users' 
    }
];



export default function editUser({ roles, user }: { roles: string[], user: UserRole }) {

    const roleList = user.roles.map((role) => role.name);
    console.log(roleList);

  const {data, setData, put, errors, reset, processing} = useForm({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    address: '',
    roles: [] as string [],
    
  });

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    put(`/users/${user.id}`)
  }

  const { auth } = usePage().props as any;
  const role = auth.user.role;
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit User" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card>
                    <CardHeader className='flex justify-between items-center'>
                        <CardTitle>Edit User</CardTitle>
                        <CardAction>
                            <Link href={'/users'}>
                                <Button>Go back</Button>
                            </Link>
                        </CardAction>
                    </CardHeader>
                    <hr />
                    <CardContent>
                        <form onSubmit={submit}>
                            <div className='mb-4'>
                                <Label htmlFor='first_name'>First Name</Label>
                                <Input id='first_name' type='text' name='first_name' value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} 
                                aria-invalid={!!errors.first_name}
                                required
                                />
                                <InputError message={errors.first_name} />
                            </div>
                            <div className='mb-4'>
                                <Label htmlFor='last_name'>Last Name</Label>
                                <Input id='last_name' type='text' name='last_name' value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} 
                                aria-invalid={!!errors.last_name}
                                required
                                />
                                <InputError message={errors.last_name} />
                            </div>
                            <div className='mb-4'>
                                <Label htmlFor='email'>Email</Label>
                                <Input id='email' type='email' name='email' value={data.email} onChange={(e) => setData('email', e.target.value)} 
                                aria-invalid={!!errors.email}
                                required
                                />
                                <InputError message={errors.email} />
                            </div>
                            <div className='mb-4'>
                                <Label htmlFor='phone'>Phone Number</Label>
                                <Input id='phone' type='text' name='phone' value={data.phone_number} onChange={(e) => setData('phone_number', e.target.value)} 
                                aria-invalid={!!errors.phone_number}
                                required
                                />
                                <InputError message={errors.phone_number} />
                            </div>
                            <div className='mb-4'>
                                <Label htmlFor='address'>Address</Label>
                                <Input id='address' type='text' name='address' value={data.address} onChange={(e) => setData('address', e.target.value)} 
                                aria-invalid={!!errors.address}
                                required
                                />
                                <InputError message={errors.address} />
                            </div>

                            
                            <Label>Select role</Label>
                            <div className='my-4'>
                                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5'>
                                    {roles.map((role, index) => (
                                        <div key={index} className='flex items-center gap-3'>
                                            <Checkbox
                                                id={`role-${role}`}
                                                checked={data.roles.includes(role)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        console.log(checked)
                                                    setData('roles', [...data.roles, role]);
                                                    } else {
                                                    setData('roles', data.roles.filter((r) => r !== role));
                                                    }
                                                }}
                                                aria-describedby='roles-error'
                                                
                                                />
                                            <Label htmlFor={role}>{role}</Label>
                                        </div>
                                        ))}

                                </div>
                            </div>
                            <div className='flex justify-end'>
                                            <Button type='submit' disabled={processing} size={'lg'}>Update</Button>
                            </div>
                            
                        </form>
                    </CardContent>

                </Card>
 

            </div>
        </AppLayout>
    );
}