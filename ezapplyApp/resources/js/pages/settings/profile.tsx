import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import { send } from '@/routes/verification';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage } from '@inertiajs/react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Settings',
        href: edit().url,
    },
];

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<SharedData>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="User Profile" description="Update your name and email address" />

                    <Form
                        {...ProfileController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-6"
                    >
                        {({ processing, recentlySuccessful, errors }) => (
                            <>
                               <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                    <div className="grid gap-2">
                                        <Label htmlFor="first_name">First Name</Label>

                                        <Input
                                            id="first_name"
                                            className="mt-1 block w-full"
                                            defaultValue={auth.user.first_name} 
                                            name="first_name"
                                            required
                                            autoComplete="given-name"
                                            placeholder="First Name"
                                        />
                                        <InputError className="mt-2" message={errors.first_name} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="last_name">Last Name</Label>

                                        <Input
                                            id="last_name"
                                            className="mt-1 block w-full"
                                            defaultValue={auth.user.last_name}
                                            name="last_name"
                                            required
                                            autoComplete="family-name"
                                            placeholder="Last Name"
                                        />

                                        <InputError className="mt-2" message={errors.last_name} />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email address</Label>

                                    <Input
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.email}
                                        name="email"
                                        required
                                        autoComplete="username"
                                        placeholder="Email address"
                                    />

                                    <InputError className="mt-2" message={errors.email} />
                                </div>

                                <div className="grid gap-2">

                                    <Label htmlFor="phone">Phone Number</Label>

                                    <Input
                                        id="phone"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.phone}
                                        name="phone"
                                        required
                                        autoComplete="tel"
                                        placeholder="Phone Number"
                                    />

                                    <InputError className="mt-2" message={errors.phone} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="address">Address</Label>

                                    <Input
                                        id="address"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.address}
                                        name="address"
                                        required
                                        autoComplete="street-address"
                                        placeholder="Address"
                                    />

                                    <InputError className="mt-2" message={errors.address} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="roles">Roles</Label>

                                    <Input
                                        id="roles"
                                        className="mt-1 block w-full bg-neutral-100 dark:bg-neutral-800"
                                        value={auth.user.role}
                                        name="roles"
                                        disabled
                                    />

                                    <InputError className="mt-2" message={errors.roles} />
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <div className="grid gap-2">
                                        <Label htmlFor='facebook'>Facebook</Label>
                                        <Input
                                            id="facebook"
                                            className="mt-1 block w-full"
                                            defaultValue={auth.user.facebook}
                                            name="facebook"
                                            placeholder="Facebook"
                                        />
                                        <InputError className="mt-2" message={errors.facebook} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor='linkedin'>LinkedIn</Label>
                                        <Input
                                            id="linkedin"
                                            className="mt-1 block w-full"
                                            defaultValue={auth.user.linkedin}
                                            name="linkedin"
                                            placeholder="LinkedIn"
                                        />
                                        <InputError className="mt-2" message={errors.linkedin} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor='viber'>Viber</Label>
                                        <Input
                                            id="viber"
                                            className="mt-1 block w-full"
                                            defaultValue={auth.user.viber}
                                            name="viber"
                                            placeholder="Viber"
                                        />
                                        <InputError className="mt-2" message={errors.viber} />
                                    </div>
                                </div>


                                {mustVerifyEmail && auth.user.email_verified_at === null && (
                                    <div>
                                        <p className="-mt-4 text-sm text-muted-foreground">
                                            Your email address is unverified.{' '}
                                            <Link
                                                href={send()}
                                                as="button"
                                                className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                            >
                                                Click here to resend the verification email.
                                            </Link>
                                        </p>

                                        {status === 'verification-link-sent' && (
                                            <div className="mt-2 text-sm font-medium text-green-600">
                                                A new verification link has been sent to your email address.
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center gap-4">
                                    <Button disabled={processing}>Save</Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-neutral-600">Saved</p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
