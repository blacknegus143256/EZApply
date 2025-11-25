import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Wallet, History, PlusCircle, ArrowUp, ArrowDown, DollarSign, CreditCard, TrendingUp, AlertCircle, Loader2, Info, X, FileText } from "lucide-react";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { Head, usePage, router } from "@inertiajs/react";
import { SharedData, Transactions } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePermissions } from "@/hooks/use-permissions";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Credits", href: "/credit-balance" },
];

interface Company {
    id: number;
    name: string;
    email: string;
}

const tabs = [
    { id: "balance", label: "Balance", icon: Wallet },
    { id: "history", label: "History", icon: History },
    { id: "topup", label: "Top Up", icon: PlusCircle },
    { id: "pricing", label: "Pricing", icon: DollarSign },
];

export default function BalancePage() {
    const [activeTab, setActiveTab] = useState("balance");
    const [topUpAmount, setTopUpAmount] = useState("");
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const { props } = usePage<SharedData>();
    const { isAdmin } = usePermissions();
    const creditsDisplay = props.balance ?? 0;
    const companies: Company[] = (props.companies as Company[]) ?? [];
    const creditTransactions: Transactions[] = props.credit_transactions ?? [];
    const pricing = (props.pricing as { package_cost: number }) ?? null;
    const recentPricingNotification = (props as any).recent_pricing_notification ?? null;
    const [packageCost, setPackageCost] = useState<string>(pricing?.package_cost?.toString() ?? "1");
    const [isSavingPricing, setIsSavingPricing] = useState(false);
    const [showPricingNotice, setShowPricingNotice] = useState(true);

    // Sync pricing state when props change
    useEffect(() => {
        if (pricing) {
            setPackageCost(pricing.package_cost?.toString() ?? "1");
        }
    }, [pricing]);

    // Handle flash messages
    useEffect(() => {
        const flash = (props as any).flash;
        if (flash?.message) {
            toast.success(flash.message);
        }
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [(props as any).flash]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleTopUp = () => {
        if (!topUpAmount || parseFloat(topUpAmount) <= 0) {
            toast.error("Please enter a valid amount greater than 0.");
            return;
        }

        if (isAdmin() && !selectedCompanyId) {
            toast.error("Please select a company to add credits to.");
            return;
        }

        setIsLoading(true);
        const payload: { amount: string; user_id?: number } = { amount: topUpAmount };
        
        if (isAdmin() && selectedCompanyId) {
            payload.user_id = parseInt(selectedCompanyId);
        }

        router.post('/credits/add', payload, {
            preserveScroll: true,
            onSuccess: () => {
                setTopUpAmount("");
                setSelectedCompanyId("");
                setIsLoading(false);
                toast.success("Credits added successfully!");
                router.reload({ only: ['balance', 'credit_transactions'] });
            },
            onError: (errors) => {
                setIsLoading(false);
                const errorMessage = errors?.message || errors?.error || "Failed to add credits. Please try again.";
                toast.error(errorMessage);
            },
        });
    };

    const { hasRole, hasPermission, isAdmin: checkIsAdmin } = usePermissions();
    const hasAccess = checkIsAdmin() || hasRole('company') || hasPermission('view_balance');

    if (!hasAccess) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <p className="text-gray-600">You don't have permission to access this page.</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Credits Balance" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <CreditCard size={32} className="sm:w-10 sm:h-10" />
                        <h1 className="text-2xl sm:text-3xl font-bold">Credits Management</h1>
                    </div>
                    <p className="text-blue-100 text-sm sm:text-base">
                        {isAdmin() ? "Manage credits for agents and companies" : "View your credit balance and transaction history"}
                    </p>
                </div>

                {/* Pricing Change Notice for Agents */}
                {!isAdmin() && recentPricingNotification && showPricingNotice && (
                    <Card className="border-l-4 border-l-orange-500 shadow-lg bg-orange-50 dark:bg-orange-900/20">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded-lg flex-shrink-0">
                                    <Info className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
                                        Pricing Update Notice
                                    </h3>
                                    <p className="text-sm text-orange-800 dark:text-orange-200 mb-2">
                                        {recentPricingNotification.data?.message || 'Pricing has been updated. Please review the new costs.'}
                                    </p>
                                    {recentPricingNotification.data && (
                                        <div className="text-xs text-orange-700 dark:text-orange-300 space-y-1">
                                            {recentPricingNotification.data.old_package_cost !== recentPricingNotification.data.new_package_cost && (
                                                <p>
                                                    <strong>Package Cost:</strong> ₱{recentPricingNotification.data.old_package_cost.toLocaleString()} → ₱{recentPricingNotification.data.new_package_cost.toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                                        Updated: {new Date(recentPricingNotification.created_at).toLocaleString()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowPricingNotice(false);
                                        // Mark notification as read
                                        router.post(`/api/notifications/${recentPricingNotification.id}/read`, {}, {
                                            preserveScroll: true,
                                            preserveState: true,
                                        });
                                    }}
                                    className="text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-200 flex-shrink-0"
                                    aria-label="Dismiss notice"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Current Pricing Display for Agents */}
                {!isAdmin() && pricing && (
                    <Card className="shadow-md border-l-4 border-l-purple-500 max-w-md">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Package Cost</p>
                                    <p className="text-2xl font-bold text-purple-600">ez {pricing.package_cost.toLocaleString()}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Full applicant profile</p>
                                </div>
                                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                                    <DollarSign className="text-purple-600 dark:text-purple-400" size={24} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="flex flex-col"> 

                    {/* Tabs Navigation */}
                    <Card className="shadow-lg">
                        <CardContent className="p-4">
                            <div className="flex justify-between relative border-b w-full">
                                {tabs.filter(tab => tab.id !== 'pricing' || isAdmin()).map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex flex-col items-center relative py-3 flex-1 transition-colors ${ 
                                                activeTab === tab.id ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
                                            }`}
                                        >
                                            <div
                                                className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full transition-colors ${
                                                    activeTab === tab.id ? "bg-blue-100" : "hover:bg-gray-100"
                                                }`}
                                            >
                                                <Icon className="w-5 h-5 md:w-6 md:h-6" />
                                            </div>
                                            <span className="text-xs mt-1">{tab.label}</span>
                                            {activeTab === tab.id && (
                                                <motion.div
                                                    layoutId="underline"
                                                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500"
                                                />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex-1 flex items-center justify-center py-6">
                        
                        {/*Balance Tab */}
                        {activeTab === "balance" && (
                            <Card className="w-full max-w-md shadow-lg">
                                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                                    <CardTitle className="flex items-center gap-2">
                                        <Wallet className="w-5 h-5 text-green-600" />
                                        {isAdmin() ? "Credit Management" : "Current Balance"}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 text-center">
                                    {!isAdmin() && (
                                        <>
                                            <div className="mb-6">
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Available Credits</p>
                                                <p className="text-5xl font-bold text-green-600 mb-2">ez {creditsDisplay}</p>
                                                <p className="text-xs text-gray-500">Use credits to purchase applicant information</p>
                                            </div>
                                            <Button 
                                                className="w-full bg-green-600 hover:bg-green-700 text-white" 
                                                variant="default"
                                                onClick={() => setActiveTab("topup")}
                                            >
                                                <PlusCircle className="w-4 h-4 mr-2" /> Add Credits
                                            </Button>
                                        </>
                                    )}
                                    {isAdmin() && (
                                        <>
                                            <div className="mb-6">
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                                    Select an Agent and add credits from the Top Up tab
                                                </p>
                                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                                        Total Companies: {companies.length}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button 
                                                className="w-full" 
                                                variant="default"
                                                onClick={() => setActiveTab("topup")}
                                            >
                                                <PlusCircle className="w-4 h-4 mr-2" /> Add Credits to Agent
                                            </Button>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                        {/* History Tab */}
                        {activeTab === "history" && (
                            <Card className="w-full max-w-2xl shadow-lg"> 
                                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                                    <CardTitle className="flex items-center gap-2">
                                        <History className="w-5 h-5 text-purple-600" />
                                        Transaction History
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6"> 
                                    {creditTransactions.length > 0 ? (
                                        <div className="overflow-x-auto"> 
                                            <ul className="divide-y divide-gray-200 min-w-full"> 
                                                {creditTransactions.map((transaction) => {
                                                    const isUsage = transaction.type === 'usage' || transaction.type === 'purchase_info';
                                                    const Icon = isUsage ? ArrowDown : ArrowUp; 
                                                    const iconColor = isUsage ? 'text-red-500' : 'text-green-500';
                                                    const amountColor = isUsage ? 'text-red-600' : 'text-green-600';
                                                    const amountSign = isUsage ? '-' : '+';
                                                    const displayAmount = Math.abs(transaction.amount);

                                                    return (
                                                        <li key={transaction.id} className="py-4 flex items-center space-x-4 hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors"> 
                                                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isUsage ? 'bg-red-100 dark:bg-red-900/20' : 'bg-green-100 dark:bg-green-900/20'}`}>
                                                                <Icon className={`w-5 h-5 ${iconColor}`} />
                                                            </div>
                                                            
                                                            <div className="flex-1 min-w-0"> 
                                                                <p className="font-medium text-sm md:text-base text-gray-900 dark:text-gray-100 truncate">{transaction.description}</p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatDate(transaction.created_at)}</p>
                                                                {isAdmin() && transaction.user && (
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                        For: {transaction.user.company?.company_name ?? transaction.user.email ?? `${transaction.user.first_name ?? ''} ${transaction.user.last_name ?? ''}`}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            
                                                            <span className={`font-semibold text-base ${amountColor} flex-shrink-0 whitespace-nowrap`}>
                                                                {amountSign}{displayAmount} credits
                                                            </span>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <History className="mx-auto text-gray-400 mb-4" size={48} />
                                            <p className="text-gray-600 dark:text-gray-400 font-medium">No transaction history</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                                                Your credit transactions will appear here
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Pricing Tab */}
                        {activeTab === "pricing" && isAdmin() && (
                            <Card className="w-full max-w-md shadow-lg">
                                <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20">
                                    <CardTitle className="flex items-center gap-2">
                                        <DollarSign className="w-5 h-5 text-orange-600" />
                                        Pricing Management
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                        Configure the credit cost for purchasing full applicant packages.
                                    </p>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="package-cost">Package Cost (₱)</Label>
                                            <Input
                                                id="package-cost"
                                                type="number"
                                                placeholder="Enter package cost"
                                                value={packageCost}
                                                onChange={(e) => setPackageCost(e.target.value)}
                                                min="0"
                                                step="0.01"
                                            />
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Cost for full package purchases (includes complete applicant profile)
                                            </p>
                                        </div>
                                        <Button
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                            variant="default"
                                            onClick={async () => {
                                                if (!packageCost || parseFloat(packageCost) < 0) {
                                                    toast.error("Please enter a valid pricing value (≥ 0).");
                                                    return;
                                                }
                                                setIsSavingPricing(true);
                                                router.post('/credits/pricing', {
                                                    package_cost: parseFloat(packageCost),
                                                }, {
                                                    preserveScroll: true,
                                                    onSuccess: () => {
                                                        toast.success("Pricing updated successfully!");
                                                        router.reload({ only: ['pricing'] });
                                                    },
                                                    onError: (errors) => {
                                                        console.error('Pricing update errors:', errors);
                                                        const errorMessage = errors?.error || errors?.message || Object.values(errors).flat().join(', ') || 'Failed to update pricing. Please try again.';
                                                        toast.error(errorMessage);
                                                    },
                                                    onFinish: () => {
                                                        setIsSavingPricing(false);
                                                    },
                                                });
                                            }}
                                            disabled={isSavingPricing}
                                        >
                                            {isSavingPricing ? "Saving..." : "Save Pricing"}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Top Up Tab */}
                        {activeTab === "topup" && (
                            <Card className="w-full max-w-md shadow-lg">
                                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                                    <CardTitle className="flex items-center gap-2">
                                        <PlusCircle className="w-5 h-5 text-green-600" />
                                        {isAdmin() ? "Add Credits to Agent" : "Top Up Balance"}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        {isAdmin() && (
                                            <div className="space-y-2">
                                                <Label htmlFor="company-select">Select Agent</Label>
                                                <Select
                                                    value={selectedCompanyId}
                                                    onValueChange={setSelectedCompanyId}
                                                >
                                                    <SelectTrigger id="company-select">
                                                        <SelectValue placeholder="Choose an Agent" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {companies.length > 0 ? (
                                                            companies.map((company) => (
                                                                <SelectItem key={company.id} value={company.id.toString()}>
                                                                    {company.name} ({company.email})
                                                                </SelectItem>
                                                            ))
                                                        ) : (
                                                            <SelectItem value="no-companies" disabled>
                                                                No companies available
                                                            </SelectItem>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                        <div className="space-y-2">
                                            <Label htmlFor="amount-input">Credit Amount</Label>
                                            <Input
                                                id="amount-input"
                                                type="number"
                                                placeholder="Enter amount"
                                                value={topUpAmount}
                                                onChange={(e) => setTopUpAmount(e.target.value)}
                                                min="1"
                                            />
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Enter the number of credits to {isAdmin() ? 'add' : 'purchase'}
                                            </p>
                                        </div>
                                        <Button
                                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                                            variant="default"
                                            onClick={handleTopUp}
                                            disabled={isLoading || (isAdmin() && !selectedCompanyId)}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <PlusCircle className="w-4 h-4 mr-2" />
                                                    {isAdmin() ? "Add Credits to Company" : "Confirm Top Up"}
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                    </div>
                </div>
            </div>
        </AppLayout>
    );
}