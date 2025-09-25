// resources/js/Pages/Applicant/CustomerProfile.tsx
import React from "react";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import { type BreadcrumbItem } from "@/types";
import PermissionGate from "@/components/PermissionGate";
import { Head } from "@inertiajs/react";

import BasicInfo from "./BasicInfo";
import Affiliations from "./Affiliations";
import FinancialInfo from "./FinancialInfo";
import Attachments from "./Attachments";

type CustomerProfileProps = {
  basicInfo?: any;       // object with user’s basic info
  address?: any;         // object with user’s address
  affiliations?: any[];  // array of user’s affiliations
  financial?: any;       // object with financial info
  attachments?: any[];   // array of attachments
};

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Dashboard", href: dashboard() },
  { title: "Customer Profile", href: "/applicant/profile" },
];

export default function CustomerProfile( {
  basicInfo,
  address,
  affiliations,
  financial,
  attachments,
}: CustomerProfileProps) {
  return (
    <PermissionGate
      permission="view_customer_dashboard"
      fallback={
        <div className="p-6">
          You don't have permission to access this page.
        </div>
      }
    >
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Customer Profile" />
        <div className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Section 1: Basic Info */}
          <section className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-neutral-900 p-4">
            <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              Basic Information
            </h1>
            <BasicInfo basicInfo={basicInfo} address={address} />
            <FinancialInfo financial={financial} />
          </section>

          {/* Section 2: Affiliations */}
          <section className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-neutral-900 p-4">
            <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              Affiliations
            </h1>
            <Affiliations affiliations={affiliations} />

            <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              Attachments
            </h1>
            <Attachments attachments={attachments}/>
          </section>
          </div>


        </div>
      </AppLayout>
    </PermissionGate>
  );
}
