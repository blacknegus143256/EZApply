import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@inertiajs/react';
import { useRef } from 'react';
import { AlertTriangle, Clock, Trash2, Shield } from 'lucide-react';

export default function DeleteUser() {
    const passwordInput = useRef<HTMLInputElement>(null);

    return (
        <Card className="border-red-200 dark:border-red-800 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20">
                <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <Shield size={20} />
                    Account Deactivation
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                <div className="space-y-4 rounded-lg border-2 border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-900/10 p-6">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" size={24} />
                        <div className="space-y-2">
                            <p className="font-semibold text-red-800 dark:text-red-300">Deactivation Notice</p>
                            <p className="text-sm text-red-700 dark:text-red-400">
                                Requesting account deactivation will immediately log you out. Your account will be scheduled for deactivation in 5 days, during which time you can contact support to cancel the request.
                            </p>
                            <div className="flex items-center gap-2 mt-3 p-3 bg-white dark:bg-neutral-800 rounded-lg border border-red-200 dark:border-red-800">
                                <Clock size={18} className="text-orange-600 dark:text-orange-400" />
                                <div className="text-sm">
                                    <p className="font-medium text-gray-900 dark:text-gray-100">Processing Period</p>
                                    <p className="text-gray-600 dark:text-gray-400">5 days grace period before final deactivation</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="destructive" size="lg" className="w-full sm:w-auto">
                            <Trash2 size={18} className="mr-2" />
                            Request Account Deactivation
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            <AlertTriangle size={24} />
                            Confirm Account Deactivation Request
                        </DialogTitle>
                        <DialogDescription className="space-y-3">
                            <p>
                                You are about to request deactivation of your account. This action will:
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-sm ml-2">
                                <li>Immediately log you out</li>
                                <li>Schedule your account for deactivation in 5 days</li>
                                <li>Archive all your data after the grace period</li>
                                <li>Prevent you from logging in during the grace period</li>
                            </ul>
                            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <p className="text-sm text-blue-800 dark:text-blue-300">
                                    <strong>Note:</strong> You can contact support within the 5-day period to cancel this request and restore your account access.
                                </p>
                            </div>
                            <p className="mt-3 font-medium">
                                Please enter your password to confirm you would like to request account deactivation.
                            </p>
                        </DialogDescription>

                        <Form
                            {...ProfileController.destroy.form()}
                            options={{
                                preserveScroll: true,
                            }}
                            onError={() => passwordInput.current?.focus()}
                            resetOnSuccess
                            className="space-y-6"
                        >
                            {({ resetAndClearErrors, processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="password">
                                            Password
                                        </Label>

                                        <Input
                                            id="password"
                                            type="password"
                                            name="password"
                                            ref={passwordInput}
                                            placeholder="Enter your password"
                                            autoComplete="current-password"
                                            className={errors.password ? 'border-red-500' : ''}
                                        />

                                        <InputError message={errors.password} />
                                    </div>

                                    <DialogFooter className="gap-2 flex-col sm:flex-row">
                                        <DialogClose asChild>
                                            <Button 
                                                variant="secondary" 
                                                onClick={() => resetAndClearErrors()}
                                                className="w-full sm:w-auto"
                                            >
                                                Cancel
                                            </Button>
                                        </DialogClose>

                                        <Button 
                                            variant="destructive" 
                                            disabled={processing} 
                                            type="submit"
                                            className="w-full sm:w-auto"
                                        >
                                            {processing ? (
                                                <>
                                                    <div className="loader scale-50 mr-2" />
                                                    <span>Processing...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Trash2 size={18} className="mr-2" />
                                                    <span>Confirm Deactivation Request</span>
                                                </>
                                            )}
                                        </Button>
                                    </DialogFooter>
                                </>
                            )}
                        </Form>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
