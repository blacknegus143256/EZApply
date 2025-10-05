import AuthenticatedSessionController from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import "../../../css/easyApply.css";
import LoginSlideshow from '@/components/LoginSlideshow';
import EzNav from "../Landing/ezapply-nav";

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    return (
        <div className="min-h-screen  flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-sky-100">
            <div className="flex justify-center">
            <h1 className="text-5xl font-extrabold text-blue-700 tracking-wide drop-shadow-md relative z-10 mt-6">
            <span className="bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400 bg-clip-text text-transparent wave-text">
                EZ Apply
            </span>
            </h1>
        </div>
        <div className="relative  flex items-center justify-center gap-15 px-6 mt-10">
            <div className=" hidden md:flex w-1/2 relative h-[500px] bg-gray-200 rounded-lg shadow-lg">
        <LoginSlideshow />
      </div>
      
      {/* <EzNav /> */}
      
      <div className="w-full md:w-auto flex items-center justify-center ">
            <div className="ezapply-card backdrop-blur-sm bg-white/90 border border-blue-100 shadow-lg transition-all duration-300 ">

            <Head title="Log in" />
            <div className="relative mx-4 -mt-6 mb-4 flex h-24 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-blue-400 text-white shadow-md">
            <h1 className="text-3xl font-semibold tracking-tight">EZ Apply</h1>
            </div>
        <AuthLayout title="Log in to your account" description="">
            <Form {...AuthenticatedSessionController.store.form()} resetOnSuccess={['password']} className="flex flex-col gap-2" >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="email@example.com"
                                    className="h-11 rounded-lg border border-gray-300 px-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                                    {canResetPassword && (
                                        <TextLink href={request()} className="ml-auto text-sm text-blue-600 hover:text-blue-800" tabIndex={5}>
                                            Forgot password?
                                        </TextLink>
                                    )}
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="********"
                                    className="h-11 rounded-lg border border-gray-300 px-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox id="remember" name="remember" tabIndex={3} className="accent-blue-600 ezapply-checkbox" />
                                <Label htmlFor="remember" className="text-sm text-gray-700">Remember me</Label>
                            </div>

                            <Button type="submit" className="w-full bg-gradient-to-tr from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all " tabIndex={4} disabled={processing}>
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                Log in
                            </Button>
                        </div>

                        <div className="text-center text-sm text-gray-600">
                            Don't have an account?{' '}
                            <TextLink href={register()} tabIndex={5} className="text-blue-600 hover:text-blue-800 font-medium">
                                Sign up
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
        </AuthLayout>
                                    </div>
                                    </div>
                                    </div>
                                    </div>
    );
}
