import { Head, usePage, Link } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { Building2, User, MapPin, Search, Calendar, Filter } from "lucide-react";
import PermissionGate from '@/components/PermissionGate';
import CompanyDetailsModal from '@/components/CompanyDetailsModal';
import { useState, useEffect } from 'react';
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
    created_at?: string;
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
                    <div className="flex items-center">
                        <Building2 className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>Brand: {application.company.brand_name || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                        <Building2 className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>Franchise Type: {application.company.opportunity?.franchise_type || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>Applied: {application.created_at ? new Date(application.created_at).toLocaleDateString() : 'N/A'}</span>
                    </div>
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
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [startDateFilter, setStartDateFilter] = useState('');
    const [endDateFilter, setEndDateFilter] = useState('');
    const [brandFilter, setBrandFilter] = useState('');
    const [franchiseTypeFilter, setFranchiseTypeFilter] = useState('');
    const [uniqueFranchiseTypes, setUniqueFranchiseTypes] = useState<string[]>([]);

    // Extract unique franchise types for dropdown
    useEffect(() => {
        const types = applications
            .map(app => app.company.opportunity?.franchise_type)
            .filter((type): type is string => type !== null && type !== undefined)
            .filter((value, index, self) => self.indexOf(value) === index)
            .sort();
        setUniqueFranchiseTypes(types);
    }, [applications]);

    const filteredApplications = applications.filter(app => {
        const matchesSearch = app.company.company_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === '' || app.status === statusFilter;
        const matchesBrand = brandFilter === '' || (app.company.brand_name && app.company.brand_name.toLowerCase().includes(brandFilter.toLowerCase()));
        const matchesFranchiseType = franchiseTypeFilter === '' || (app.company.opportunity?.franchise_type && app.company.opportunity.franchise_type.toLowerCase().includes(franchiseTypeFilter.toLowerCase()));
        const matchesDateRange = (() => {
            if (!app.created_at) return false;
            const appDate = new Date(app.created_at);
            const startDate = startDateFilter ? new Date(startDateFilter) : null;
            const endDate = endDateFilter ? new Date(endDateFilter) : null;

            // Normalize dates to midnight for date-only comparison
            const normalizeDate = (date: Date) => {
                const normalized = new Date(date);
                normalized.setHours(0, 0, 0, 0);
                return normalized;
            };

            const normalizedAppDate = normalizeDate(appDate);
            const normalizedStartDate = startDate ? normalizeDate(startDate) : null;
            const normalizedEndDate = endDate ? normalizeDate(endDate) : null;

            if (normalizedStartDate && normalizedEndDate) {
                return normalizedAppDate >= normalizedStartDate && normalizedAppDate <= normalizedEndDate;
            } else if (normalizedStartDate) {
                return normalizedAppDate >= normalizedStartDate;
            } else if (normalizedEndDate) {
                return normalizedAppDate <= normalizedEndDate;
            }
            return true;
        })();
        return matchesSearch && matchesStatus && matchesBrand && matchesFranchiseType && matchesDateRange;
    });

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

                        {applications.length > 0 && (
                            <div className="mb-4 space-y-4">
                                <div className="flex flex-col lg:flex-row gap-4">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            placeholder="Search companies..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-100"
                                        />
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input
                                                type="text"
                                                placeholder="Filter by brand..."
                                                value={brandFilter}
                                                onChange={(e) => setBrandFilter(e.target.value)}
                                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-100 text-sm"
                                            />
                                        </div>
                                        <div className="relative">
                                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <select
                                                value={franchiseTypeFilter}
                                                onChange={(e) => setFranchiseTypeFilter(e.target.value)}
                                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-100 text-sm"
                                            >
                                                <option value="">All Franchise Types</option>
                                                {uniqueFranchiseTypes.map(type => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="relative">
                                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <select
                                                value={statusFilter}
                                                onChange={(e) => setStatusFilter(e.target.value)}
                                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-100"
                                            >
                                                <option value="">All Status</option>
                                                <option value="pending">Pending</option>
                                                <option value="approved">Approved</option>
                                                <option value="rejected">Rejected</option>
                                                <option value="interested">Interested</option>
                                            </select>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                <input
                                                    type="date"
                                                    placeholder="From"
                                                    value={startDateFilter}
                                                    onChange={(e) => setStartDateFilter(e.target.value)}
                                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-100 text-sm"
                                                />
                                            </div>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                <input
                                                    type="date"
                                                    placeholder="To"
                                                    value={endDateFilter}
                                                    onChange={(e) => setEndDateFilter(e.target.value)}
                                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-100 text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {applications.length === 0 ? (
                            <p className="text-neutral-600 dark:text-neutral-400">
                                No applications yet. Go back and apply to companies to see them here.
                            </p>
                        ) : (
                            <>
                                {filteredApplications.length === 0 ? (
                                    <p className="text-neutral-600 dark:text-neutral-400">
                                        No companies match your search.
                                    </p>
                                ) : (
                                    <>
                                        <div className="hidden md:block overflow-x-auto">
                                            <Table className="w-full">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Company Name</TableHead>
                                                <TableHead>Brand Name</TableHead>
                                                <TableHead>Franchise Type</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Applied Date</TableHead>
                                                <TableHead>Action</TableHead>
                                                <TableHead>Chat</TableHead>
                                            </TableRow>
                                        </TableHeader>

                                                <TableBody>
                                                {filteredApplications.map((a) => (
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
                                                            {a.company.brand_name || 'N/A'}
                                                        </TableCell>
                                                        <TableCell>
                                                            {a.company.opportunity?.franchise_type || 'N/A'}
                                                        </TableCell>
                                                        <TableCell>
                                                            <StatusBadge status={a.status || "pending"} />
                                                        </TableCell>
                                                        <TableCell>
                                                            {a.created_at ? new Date(a.created_at).toLocaleDateString() : 'N/A'}
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
                                            {filteredApplications.map((a) => (
                                                <ApplicationCard
                                                    key={a.id}
                                                    application={a}
                                                    handleCompanyClick={handleCompanyClick}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
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
