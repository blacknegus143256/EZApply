import { Head, usePage, Link } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { Building2, User, MapPin } from "lucide-react"; 
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
    opportunity?: any; 
    background?: any;
    requirements?: any;
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

function ApplicationCard({ application, handleCompanyClick }: { 
    application: Application, 
    handleCompanyClick: (company: CompanyDetails, status: string) => void 
}) {
    const { company, status } = application;
    const repName = company.user 
        ? `${company.user.first_name} ${company.user.last_name}`
        : "Unknown User";

    return (
        <div className="bg-white dark:bg-neutral-800 p-4 mb-4 rounded-lg shadow border border-gray-100 dark:border-neutral-700">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <img
                        src={
                            company.marketing?.logo_path
                                ? `/storage/${company.marketing.logo_path}`
                                : "/background/default-logo.png"
                        }
                        alt={`${company.company_name} logo`}
                        className="h-10 w-10 object-contain rounded-full border-2 border-white shadow bg-gray-50"
                        loading="lazy"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = "/background/default-logo.png";
                        }}
                    />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {company.company_name}
                    </h3>
                </div>
                <StatusBadge status={status || "pending"} />
            </div>

            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 border-t pt-3 mt-3">
                <div className="flex items-center">
                    <User className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>Representative: <strong>{repName}</strong></span>
                </div>
                {application.desired_location && (
                    <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>Location: {application.desired_location}</span>
                    </div>
                )}
            </div>

            <div className="mt-4 flex flex-col gap-2">
                <button 
                    className="view-btn btn-2 w-full text-center py-2 rounded text-sm"
                    onClick={() => handleCompanyClick(company, status)}
                >
                    View Company Profile
                </button>
                <ChatButton 
                    status={status} 
                    userId={company.user?.id}
                    className="w-full text-center py-2 text-sm" 
                />
            </div>
        </div>
    );
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
                <div className="bg-across-pages min-h-screen p-5">
                    <div className="p-6 bg-white dark:bg-neutral-900 rounded-xl shadow-md">
                        <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-4">
                            Applied Companies
                        </h1>
                        
                        {applications.length === 0 ? (
                            <p className="text-neutral-600 dark:text-neutral-400">
                                No applications yet. Go back and apply to companies to see them here.
                            </p>
                        ) : (
                            <>
                                <div className="hidden md:block overflow-x-auto"> 
                                    <Table className="w-full">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Company Name</TableHead>
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
                                                        <img
                                                            src={
                                                                a.company.marketing?.logo_path
                                                                    ? `/storage/${a.company.marketing.logo_path}`
                                                                    : "/background/default-logo.png"
                                                            }
                                                            alt={`${a.company.company_name} logo`}
                                                            className="h-10 w-10 object-contain rounded-full border-2 border-white shadow-lg bg-gray-50 mr-3"
                                                            loading="lazy"
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement;
                                                                target.onerror = null;
                                                                target.src = "/background/default-logo.png";
                                                            }}
                                                        />
                                                        {a.company.company_name}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <StatusBadge status={a.status || "pending"} />
                                                </TableCell>
                                                <TableCell className="max-w-[120px]">
                                                    <button className="view-btn btn-2 cursor-pointer w-full text-sm py-1 px-2"
                                                        onClick={() => handleCompanyClick(a.company, a.status)}
                                                    >
                                                        Profile
                                                    </button>
                                                </TableCell>
                                                <TableCell className="max-w-[80px]">
                                                    <ChatButton status={a.status} userId={a.company.user?.id} />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                
                                <div className="md:hidden">
                                    {applications.map((a) => (
                                        <ApplicationCard 
                                            key={a.id} 
                                            application={a} 
                                            handleCompanyClick={handleCompanyClick} 
                                        />
                                    ))}
                                </div>
                            </>
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