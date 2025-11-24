import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { logout, reactivation } from '@/routes';
import { AlertCircle, CheckCircle2, Clock, Mail, AlertTriangle, ArrowLeft } from 'lucide-react';
import InputError from '@/components/input-error';

interface AccountReactivationProps {
    user: {
        id: number;
        email: string;
        is_deactivated: boolean;
    };
    pendingRequest?: {
        id: number;
        status: string;
        created_at: string;
        reason?: string;
    };
}

export default function AccountReactivation({ user, pendingRequest }: AccountReactivationProps) {
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        reason: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(reactivation().store);
    };

    return (
        <>
            <Head title="Account Reactivation Request" />

            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 px-4 py-12">
                <div className="w-full max-w-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                            <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Account Deactivated
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Your account has been deactivated. Request reactivation below.
                        </p>
                    </div>

                    <Card className="shadow-xl border-2 border-red-200 dark:border-red-800">
                        <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20">
                            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                <AlertCircle size={24} />
                                Reactivation Request
                            </CardTitle>
                            <CardDescription className="text-gray-700 dark:text-gray-300">
                                Account: <span className="font-semibold">{user.email}</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {pendingRequest ? (
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                        <Clock className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" size={20} />
                                        <div className="flex-1">
                                            <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                                                Request Already Submitted
                                            </p>
                                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                                You have a pending reactivation request submitted on{' '}
                                                {new Date(pendingRequest.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </p>
                                            {pendingRequest.reason && (
                                                <div className="mt-3 p-3 bg-white dark:bg-neutral-800 rounded border border-blue-200 dark:border-blue-700">
                                                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        Your reason:
                                                    </p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {pendingRequest.reason}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                        <Mail size={20} className="text-yellow-600 dark:text-yellow-400" />
                                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                            An admin will review your request shortly. You will be notified once a decision has been made.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={submit} className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                                <strong>Note:</strong> Please provide a reason for requesting account reactivation. 
                                                This will help our admin team review your request more efficiently.
                                            </p>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="reason">
                                                Reason for Reactivation <span className="text-gray-500">(Optional)</span>
                                            </Label>
                                            <Textarea
                                                id="reason"
                                                value={data.reason}
                                                onChange={(e) => setData('reason', e.target.value)}
                                                placeholder="Please explain why you would like your account to be reactivated..."
                                                className="min-h-[120px]"
                                                maxLength={1000}
                                            />
                                            <p className="text-xs text-gray-500">
                                                {data.reason.length}/1000 characters
                                            </p>
                                            <InputError message={errors.reason} />
                                        </div>
                                    </div>

                                    {recentlySuccessful && (
                                        <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                            <CheckCircle2 size={20} className="text-green-600 dark:text-green-400" />
                                            <p className="text-sm text-green-800 dark:text-green-200">
                                                Your reactivation request has been submitted successfully!
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                        >
                                            {processing ? (
                                                <>
                                                    <div className="loader scale-50 mr-2" />
                                                    <span>Submitting...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Mail size={18} className="mr-2" />
                                                    <span>Submit Reactivation Request</span>
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => window.location.href = logout().url}
                                            className="sm:w-auto"
                                        >
                                            <ArrowLeft size={18} className="mr-2" />
                                            Logout
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </CardContent>
                    </Card>

                    <div className="mt-6 text-center">
                        <Link
                            href="/"
                            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 underline"
                        >
                            Return to homepage
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

