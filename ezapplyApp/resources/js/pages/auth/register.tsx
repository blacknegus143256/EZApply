// resources/js/Pages/Auth/Register.tsx
import { login } from '@/routes';
import { LoaderCircle } from 'lucide-react';
import { useForm, Head } from '@inertiajs/react';
import '../../../css/easyApply.css';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import axios from 'axios';
import { useState } from 'react';
import { useEffect } from 'react'; 

type PSGCItem = { code: string; name: string };
interface RegisterProps {
roles: string[];
email: string;
password: string;
password_confirmation: string;
}

export default function Register({ roles }: { roles: string[] }) {
const { data, setData, post, processing, errors } = useForm({
    role: roles?.[1] || '', 
    email: '',
    password: '',
    password_confirmation: '',
});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/register', {
            onSuccess: () => {
                console.log('Name:', data.email);
                console.log('Role:', data.role);
            },
            onError: (errors) => {
                console.log(errors);
            },
        });
    };

    return (
        <AuthLayout title="Create an account" description="Enter your details below to create your account">
            <Head title="Register" />

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid gap-6">


                    {/* Role */}
                    <div className="grid gap-2">
                        <Label htmlFor="role">Register as</Label>
                        <select
                            id="role"
                            name="role"
                            required
                            className="border rounded-md px-3 py-2"
                            value={(data as any).role}
                            onChange={(e) => setData('role' as any, e.target.value)}
                            tabIndex={3}
                        >
                            {/* {roles.map((role) => (
                                <option key={role} value={role}>
                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                </option>
                            ))} */}
                            <option key={roles[1]} value={roles[1]}>
                                {roles[1]}
                            </option>
                            <option key={roles[0]} value={roles[0]}>
                                {roles[0]}
                            </option>
                        </select>
                        <InputError message={(errors as any).role} className="mt-2" />
                    </div>

                    {/* Email */}
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={4}
                            autoComplete="email"
                            name="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="email@example.com"
                        />
                        <InputError message={errors.email} />
                    </div>




                    {/* Password */}
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={7}
                            autoComplete="new-password"
                            name="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Password"
                        />
                        <InputError message={errors.password} />
                    </div>

                    {/* Confirm Password */}
                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirm password</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            required
                            tabIndex={8}
                            autoComplete="new-password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            placeholder="Confirm password"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>
                    {/* Submit Button */}
                    <Button type="submit" className="mt-2 w-full" tabIndex={9}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Create account
                    </Button>
                </div>

                {/* Already have account */}
                <div className="text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <TextLink href={login()} tabIndex={10}>
                        Log in
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}