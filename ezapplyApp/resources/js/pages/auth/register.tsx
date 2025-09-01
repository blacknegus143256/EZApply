//import RegisteredUserController from '@/actions/App/Http/Controllers/Auth/RegisteredUserController';
import { login } from '@/routes';
import { LoaderCircle } from 'lucide-react';
import { useForm,Head } from '@inertiajs/react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

export default function Register() {

const { data, setData, post, processing, errors } = useForm({
    first_name: '',
    last_name: '',
    role: 'customer',
    email: '',
    phone_number: '',
    password: '',
    password_confirmation: '',
    address: '',
});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/register'); // 👈 change to route('register') if Ziggy is available
    };
    return (
        <AuthLayout title="Create an account" description="Enter your details below to create your account">
            <Head title="Register" />
            

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                            <Label htmlFor="first_name">First Name</Label>
                            <Input
                                id="first_name"
                                type="text"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="given-name"
                                name="first_name"
                                value={data.first_name}
                                onChange={(e) => setData('first_name', e.target.value)}
                                placeholder="First name"
                            />
                            <InputError message={errors.first_name} className="mt-2" />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="last_name">Last Name</Label>
                            <Input
                                id="last_name"
                                type="text"
                                required
                                tabIndex={2}
                                autoComplete="family-name"
                                name="last_name"
                                value={data.last_name}
                                onChange={(e) => setData('last_name', e.target.value)}
                                placeholder="Last name"
                            />
                            <InputError message={errors.last_name} className="mt-2" />
                        </div>

                        <div className="grid gap-2">
                        <Label htmlFor="role">Register as</Label>
                        <select
                            id="role"
                            name="role"
                            required
                            className="border rounded-md px-3 py-2"
                            value={data.role}
                            onChange={(e) => setData('role', e.target.value)}
                            tabIndex={3}
                        >
                            <option value="customer">Customer</option>
                            <option value="company">Company</option>
                        </select>
                        <InputError message={errors.role} className="mt-2" />
                    </div>


                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="email@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                type="text"
                                required
                                tabIndex={4}
                                autoComplete="tel"
                                name="phone"
                                value={data.phone_number}
                                onChange={(e) => setData('phone_number', e.target.value)}
                                placeholder="e.g. +63 912 345 6789"
                            />
                            <InputError message={errors.phone_number} className="mt-2" />
                        </div>

                            <div className="grid gap-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                type="text"
                                required
                                tabIndex={4}
                                autoComplete="tel"
                                name="address"
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                placeholder="Address"
                            />
                            <InputError message={errors.address} className="mt-2" />
                        </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Password"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">Confirm password</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    placeholder="Confirm password"
                                />
                                <InputError message={errors.password_confirmation} />
                            </div>

                            <Button type="submit" className="mt-2 w-full" tabIndex={5}>
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                Create account
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <TextLink href={login()} tabIndex={6}>
                                Log in
                            </TextLink>
                        </div>
            </form>
        </AuthLayout>
    );
}
