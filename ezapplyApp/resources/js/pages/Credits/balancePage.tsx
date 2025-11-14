import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Wallet, History, PlusCircle, ArrowUp, ArrowDown } from "lucide-react";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { usePage, router } from "@inertiajs/react";
import { SharedData, Transactions } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePermissions } from "@/hooks/use-permissions";
import { Label } from "@/components/ui/label";

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
            alert("Please enter a valid amount greater than 0.");
            return;
        }

        if (isAdmin() && !selectedCompanyId) {
            alert("Please select a company to add credits to.");
            return;
        }

        setIsLoading(true);
        const payload: { amount: string; user_id?: number } = { amount: topUpAmount };
        
        if (isAdmin() && selectedCompanyId) {
            payload.user_id = parseInt(selectedCompanyId);
        }

        router.post('/credits/add', payload, {
            onSuccess: () => {
                setTopUpAmount("");
                setSelectedCompanyId("");
                setIsLoading(false);
                alert("Credits added successfully!");
            },
            onError: (errors) => {
                setIsLoading(false);
                const errorMessage = errors?.message || errors?.error || "Failed to add credits. Please try again.";
                alert(errorMessage);
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
                <div className="flex flex-col min-h-screen bg-gray-50 p-4 md:p-6"> 

                    <div className="flex justify-between relative border-b w-full max-w-lg mx-auto md:max-w-none">
                        {tabs.map((tab) => {
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

                    <div className="flex-1 flex items-center justify-center pt-8 pb-4">
                        
                        {/*Balance Tab */}
                        {activeTab === "balance" && (
                            <Card className="w-full max-w-sm shadow-xl rounded-xl">
                                <CardContent className="p-6 text-center">
                                    <h2 className="text-lg font-semibold text-gray-600 mb-2">
                                        {isAdmin() ? "Admin Credit Management" : "Current Balance"}
                                    </h2>
                                    {!isAdmin() && (
                                        <p className="text-4xl font-bold text-green-600 mb-6">ez {creditsDisplay}</p>
                                    )}
                                    {isAdmin() && (
                                        <p className="text-sm text-gray-500 mb-6">
                                            Select an Agent and add credits from the Top Up tab
                                        </p>
                                    )}
                                    <Button 
                                        className="w-full" 
                                        variant="default"
                                        onClick={() => setActiveTab("topup")}
                                    >
                                        <PlusCircle className="w-4 h-4 mr-2" /> Add Credits
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                        {/* History Tab */}
                        {activeTab === "history" && (
                            <Card className="w-full max-w-lg shadow-xl rounded-xl"> 
                                <CardContent className="p-4 md:p-6"> 
                                    <h2 className="text-lg font-semibold text-gray-600 mb-4">Transaction History</h2>
                                    <div className="overflow-x-auto"> 
                                        <ul className="divide-y divide-gray-200 min-w-full"> 
                                            {creditTransactions.length > 0 ? (
                                                creditTransactions.map((transaction) => {
                                                    const isUsage = transaction.type === 'usage';
                                                    const Icon = isUsage ? ArrowDown : ArrowUp; 
                                                    const iconColor = isUsage ? 'text-red-500' : 'text-green-500';
                                                    const amountColor = isUsage ? 'text-red-600' : 'text-green-600';
                                                    const amountSign = isUsage ? '-' : '+';

                                                    return (
                                                        <li key={transaction.id} className="py-3 flex items-center space-x-3 md:space-x-4"> 
                                                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUsage ? 'bg-red-100' : 'bg-green-100'}`}>
                                                                <Icon className={`w-5 h-5 ${iconColor}`} />
                                                            </div>
                                                            
                                                            <div className="flex-1 min-w-0"> 
                                                                                <p className="font-medium text-sm md:text-base text-gray-800 truncate">{transaction.description}</p>
                                                                                <p className="text-xs text-gray-500 mt-1">{formatDate(transaction.created_at)}</p>
                                                                                {isAdmin() && transaction.user && (
                                                                                    <p className="text-xs text-gray-500 mt-1">For: {transaction.user.company?.company_name ?? transaction.user.email ?? `${transaction.user.first_name ?? ''} ${transaction.user.last_name ?? ''}`}</p>
                                                                                )}
                                                            </div>
                                                            
                                                            <span className={`font-semibold text-sm md:text-base ${amountColor} **flex-shrink-0 whitespace-nowrap**`}>
                                                                {amountSign} {transaction.amount} credits
                                                            </span>
                                                        </li>
                                                    );
                                                })
                                            ) : (
                                                <li className="text-center text-gray-500 py-4">No transaction history available.</li>
                                            )}
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Top Up Tab */}
                        {activeTab === "topup" && (
                            <Card className="w-full max-w-sm shadow-xl rounded-xl">
                                <CardContent className="p-6">
                                    <h2 className="text-lg font-semibold text-gray-600 mb-4">
                                        {isAdmin() ? "Add Credits to Agent" : "Top Up Balance"}
                                    </h2>
                                    <div className="space-y-3">
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
                                            {isAdmin() && <Label htmlFor="amount-input">Credit Amount</Label>}
                                            <Input
                                                id="amount-input"
                                                type="number"
                                                placeholder="Enter amount"
                                                value={topUpAmount}
                                                onChange={(e) => setTopUpAmount(e.target.value)}
                                                min="1"
                                            />
                                        </div>
                                        <Button
                                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                                            variant="default"
                                            onClick={handleTopUp}
                                            disabled={isLoading || (isAdmin() && !selectedCompanyId)}
                                        >
                                            {isLoading ? "Processing..." : isAdmin() ? "Add Credits to Company" : "Confirm Top Up"}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        
                    </div>
                </div>
            </AppLayout>
    );
}