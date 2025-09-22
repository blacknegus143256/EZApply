import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Wallet, History, PlusCircle } from "lucide-react";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import PermissionGate from '@/components/PermissionGate';

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Credits", href: "/credit-balance" },
];

const tabs = [
  { id: "balance", label: "Balance", icon: Wallet },
  { id: "history", label: "History", icon: History },
  { id: "topup", label: "Top Up", icon: PlusCircle },
];

export default function BalancePage() {
  const [activeTab, setActiveTab] = useState("balance");

  return (
    <PermissionGate role="company">
        <AppLayout breadcrumbs={breadcrumbs}>
        <div className="flex flex-col min-h-screen bg-gray-50 p-6">

      <div className="flex justify-around relative border-b">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center relative py-3 px-4 transition-colors ${
                activeTab === tab.id ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors ${
                  activeTab === tab.id ? "bg-blue-100" : "hover:bg-gray-100"
                }`}
              >
                <Icon className="w-6 h-6" />
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

      
      <div className="flex-1 flex items-center justify-center">
        {activeTab === "balance" && (
          <Card className="w-full max-w-md shadow-lg">
            <CardContent className="p-6 text-center">
              <h2 className="text-lg font-semibold text-gray-600 mb-2">Current Balance</h2>
              <p className="text-4xl font-bold text-green-600 mb-6">₱ 1,200.00</p>
              <Button className="w-full" variant="default">
                <PlusCircle className="w-4 h-4 mr-2" /> Add Credits
              </Button>
            </CardContent>
          </Card>
        )}

        {activeTab === "history" && (
          <Card className="w-full max-w-md shadow-lg">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-600 mb-4">Transaction History</h2>
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between border-b pb-2">
                  <span>Top Up ₱500</span>
                  <span className="text-green-600">+₱500</span>
                </li>
                <li className="flex justify-between border-b pb-2">
                  <span>Purchase Service</span>
                  <span className="text-red-600">-₱300</span>
                </li>
                <li className="flex justify-between">
                  <span>Top Up ₱1000</span>
                  <span className="text-green-600">+₱1000</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        )}

        {activeTab === "topup" && (
          <Card className="w-full max-w-md shadow-lg">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-600 mb-4">Top Up Balance</h2>
              <div className="space-y-3">
                <Input type="number" placeholder="Enter amount (₱)" />
                <Button className="w-full" variant="success">
                  Confirm Top Up
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </AppLayout>
    </PermissionGate>
  );
}
