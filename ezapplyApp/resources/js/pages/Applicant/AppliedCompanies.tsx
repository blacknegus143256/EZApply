import { Head, usePage, Link } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { Building2, User } from "lucide-react";
import PermissionGate from '@/components/PermissionGate';
import CompanyDetailsModal from '@/components/CompanyDetailsModal';
import { useState } from 'react';
import '../../../css/easyApply.css';
import ChatButton from "@/components/ui/chat-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Applied Companies", href: "/applicant/franchise/appliedcompanies" },
];

type PageProps = {
  applications?: Application[];
};

type CompanyDetails = {
  id: number;
  company_name: string;
  brand_name?: string;
  city?: string;
  state_province?: string;
  zip_code?: string;
  country?: string;
  company_website?: string;
  description?: string;
  year_founded?: number;
  num_franchise_locations?: number;
  status?: string;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  opportunity?: {
    franchise_type?: string;
    min_investment?: number;
    franchise_fee?: number;
    royalty_fee_structure?: string;
    avg_annual_revenue?: number;
    target_markets?: string;
    training_support?: string;
    franchise_term?: string;
    unique_selling_points?: string;
  };
  background?: {
    industry_sector?: string;
    years_in_operation?: number;
    total_revenue?: number;
    awards?: string;
    company_history?: string;
  };
  requirements?: {
    min_net_worth?: number;
    min_liquid_assets?: number;
    prior_experience?: boolean;
    experience_type?: string;
    other_qualifications?: string;
  };
  marketing?: {
    listing_title?: string;
    listing_description?: string;
    logo_path?: string;
    target_profile?: string;
    preferred_contact_method?: string;
  };
};

type Application = {
  id: number;
  status: string;
  desired_location?: string | null;
  deadline_date?: string | null;
  company: CompanyDetails;
};

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    approved: 'bg-green-100 text-green-800 border-green-300',
    rejected: 'bg-red-100 text-red-800 border-red-300',
    interested: 'bg-blue-100 text-blue-800 border-blue-300',
  };
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  const cls = map[status] || map['pending'];
  return <span className={`ml-auto inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${cls}`}>{label}</span>;
}

export default function AppliedCompanies() {
  const { props } = usePage<PageProps>();
  const applications = props.applications ?? [];
  const [selectedCompany, setSelectedCompany] = useState<CompanyDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCompanyClick = (company: CompanyDetails, status: string) => {
      setSelectedCompany(company);
      setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCompany(null);
  };

  return (
    <PermissionGate permission="view_customer_dashboard" fallback={<div className="p-6">You don't have permission to access this page.</div>}>
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Applied Companies" />
        <div className="bg-across-pages min-h-screen">
        <div className="p-6 bg-white dark:bg-neutral-900 rounded-xl shadow-md">
          <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-4">
            Applied Companies
          </h1>
          {applications.length === 0 ? (
            <p className="text-neutral-600 dark:text-neutral-400">
              No applications yet. Go back and apply to companies to see them here.
            </p>
          ) : (
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company Name</TableHead>
                      <TableHead>Representative</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Chat</TableHead>
                    </TableRow>
                  </TableHeader>
                  
              <TableBody>
              {applications.map((a) => (
                   <TableRow key={a.id}>
                    <TableCell>
                    <span className="flex items-center font-semibold text-gray-900 dark:text-gray-100">
                      <Building2 className="w-4 h-4 mr-1 text-blue-500" />
                      {a.company.company_name}
                    </span>
                    </TableCell>
                    <TableCell>
                    <span className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <User className="w-4 h-4 mr-1 text-gray-400" />
                      {a.company.user
                        ? `${a.company.user.first_name} ${a.company.user.last_name}`
                        : "Unknown User"}
                    </span>
                    </TableCell>
                    <TableCell>
                    <StatusBadge status={a.status || "pending"} />
                    </TableCell>
                    <TableCell className="flex gap-2">
                        <button className="view-btn btn-2 cursor-pointer"
                        onClick={() => handleCompanyClick(a.company, a.status)}
                        >Company Profile</button>
                        </TableCell>
                        <TableCell>
                    {/* Chat button */}
                    <ChatButton status={a.status} userId={a.company.user?.id} />
                    </TableCell>
                  </TableRow>
              ))}
              </TableBody>
              </Table>
          )}
        </div>
        </div>
        <CompanyDetailsModal
          company={selectedCompany}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </AppLayout>
    </PermissionGate>
  );
}
