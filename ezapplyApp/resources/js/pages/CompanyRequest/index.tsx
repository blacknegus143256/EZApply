import { useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, router as route } from '@inertiajs/react';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Building2, Search, Eye, CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Can } from '@/components/PermissionGate';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import CompanyDetailsModal from '@/components/CompanyDetailsModal';


interface Company {
  id: number;
  company_name: string;
  brand_name: string;
  hq_address: string;
  city: string;
  state_province: string;
  zip_code: string;
  country: string;
  company_website: string;
  description: string;
  created_at: string;
  status?: 'pending' | 'approved' | 'rejected'; 
  agent_name?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Company Registration Requests',
        href: '/company-requests',
    }
];

export default function Roles({ roles }: { roles: any }) {
    const { auth } = usePage().props as any;
    const userRole = auth.user.role;

    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
  const [agentSearchTerm, setAgentSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const filteredCompanies = companies.filter((company) => {
    const matchesSearch = company.company_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesAgent = (company.agent_name ?? '')
      .toLowerCase()
      .includes(agentSearchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ? true : company.status === statusFilter;

    return matchesSearch && matchesAgent && matchesStatus;
  });

    useEffect(() => {
  fetch("/companies")
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then((data: Company[]) => {
      console.log('Fetched companies data:', data); 
      console.log('First company agent_name:', data[0]?.agent_name); 
      
      const withStatus = data.map((c) => {
        const company = {
          ...c,
          status: c.status || 'pending',
          agent_name: c.agent_name || 'N/A', 
        };
        console.log('Mapped company:', company.id, 'agent_name:', company.agent_name); 
        return company;
      });
      setCompanies(withStatus);
      setLoading(false);      
    })
    .catch((err) => {
      console.error("Error fetching companies:", err);
      setError("Failed to fetch companies.");
      setLoading(false);
    });
}, []);


function handleCloseModal() {
  setIsModalOpen(false);
  setSelectedCompany(null);
}

    const totalCompanies = companies.length;
    const pendingCount = companies.filter(c => c.status === 'pending').length;
    const approvedCount = companies.filter(c => c.status === 'approved').length;
    const rejectedCount = companies.filter(c => c.status === 'rejected').length;
    const filteredCount = filteredCompanies.length;

    return (
        <Can permission="view_request_companies" fallback={<div className="p-4">You don't have permission to view company requests.</div>}>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head>
                    <title>Company Registration Requests</title>
                </Head>
                <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
                    {/* Gradient Header */}
                    <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-white shadow-lg">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4 sm:mb-6">
                            <div className="flex-1">
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                    <span className="flex items-center gap-2 sm:gap-3">
                                        <Building2 size={32} className="sm:w-10 sm:h-10" />
                                        <span className="leading-tight">Company Registration Requests</span>
                                    </span>
                                </h1>
                                <p className="mt-2 text-orange-100 text-sm sm:text-base">Manage and review company registration requests</p>
                            </div>
                            <div className="text-left sm:text-right lg:text-right">
                                <p className="text-orange-100 text-xs sm:text-sm font-medium">Total Companies</p>
                                <p className="text-3xl sm:text-4xl lg:text-5xl font-bold">{totalCompanies}</p>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
                            <div className="bg-white/20 backdrop-blur rounded-lg p-3 sm:p-4">
                                <p className="text-orange-100 text-xs sm:text-sm font-medium">Pending</p>
                                <p className="text-2xl sm:text-3xl font-bold mt-1">{pendingCount}</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur rounded-lg p-3 sm:p-4">
                                <p className="text-orange-100 text-xs sm:text-sm font-medium">Approved</p>
                                <p className="text-2xl sm:text-3xl font-bold mt-1">{approvedCount}</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur rounded-lg p-3 sm:p-4">
                                <p className="text-orange-100 text-xs sm:text-sm font-medium">Rejected</p>
                                <p className="text-2xl sm:text-3xl font-bold mt-1">{rejectedCount}</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur rounded-lg p-3 sm:p-4">
                                <p className="text-orange-100 text-xs sm:text-sm font-medium">Filtered Results</p>
                                <p className="text-2xl sm:text-3xl font-bold mt-1">{filteredCount}</p>
                            </div>
                        </div>

                        {/* Search and Filter */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-200" size={20} />
                                <Input
                                    type="text"
                                    placeholder="Search Company..."
                                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-orange-200 focus:bg-white/20"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="relative flex-1">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-200" size={20} />
                                <Input
                                    type="text"
                                    placeholder="Search Agent..."
                                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-orange-200 focus:bg-white/20"
                                    value={agentSearchTerm}
                                    onChange={(e) => setAgentSearchTerm(e.target.value)}
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                                <SelectTrigger className="w-full sm:w-[200px] bg-white/10 border-white/20 text-white">
                                    <SelectValue placeholder="Filter by Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Status</SelectLabel>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Table Card */}
                    <Card className="shadow-lg">
                        <CardContent className="p-0">
                            {loading ? (
                                <div className="flex items-center justify-center py-16">
                                    <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                                    <span className="ml-3 text-gray-600">Loading companies...</span>
                                </div>
                            ) : error ? (
                                <div className="text-center py-16 bg-red-50 rounded-lg border-2 border-dashed border-red-300">
                                    <XCircle size={56} className="mx-auto text-red-300 mb-4" />
                                    <p className="text-red-500 font-bold text-lg">{error}</p>
                                </div>
                            ) : filteredCompanies.length === 0 ? (
                                <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                    <Building2 size={56} className="mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-500 font-bold text-lg">No companies found</p>
                                    <p className="text-sm text-gray-400 mt-2">
                                        {searchTerm || agentSearchTerm || statusFilter !== 'all' 
                                            ? 'Try adjusting your search or filter criteria' 
                                            : 'No companies registered yet'}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Desktop Table View */}
                                    <div className="hidden lg:block overflow-x-auto">
                                        <Table>
                                            <TableHeader className="bg-gray-50">
                                                <TableRow>
                                                    <TableHead className="font-semibold">Agent Name</TableHead>
                                                    <TableHead className="font-semibold">Company Name</TableHead>
                                                    <TableHead className="font-semibold">Date Created</TableHead>
                                                    <TableHead className="font-semibold">Status</TableHead>
                                                    <TableHead className="font-semibold text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {[...filteredCompanies]
                                                    .sort(
                                                        (a, b) =>
                                                            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                                                    )
                                                    .map((company) => (
                                                        <TableRow key={company.id} className="hover:bg-gray-50 transition-colors">
                                                            <TableCell>
                                                                <div className="flex items-center gap-2">
                                                                    <User size={16} className="text-orange-600" />
                                                                    <span className="font-medium">{company.agent_name ?? 'N/A'}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-2">
                                                                    <Building2 size={16} className="text-orange-600" />
                                                                    <span className="font-semibold">{company.company_name}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-gray-600">
                                                                {new Date(company.created_at).toLocaleDateString()}
                                                            </TableCell>
                                                            <TableCell>
                                                                {company.status === "pending" && (
                                                                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-200">
                                                                        <Clock size={12} className="mr-1" />
                                                                        Pending
                                                                    </Badge>
                                                                )}
                                                                {company.status === "approved" && (
                                                                    <Badge variant="success" className="bg-green-100 text-green-700 border-green-200">
                                                                        <CheckCircle size={12} className="mr-1" />
                                                                        Approved
                                                                    </Badge>
                                                                )}
                                                                {company.status === "rejected" && (
                                                                    <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200">
                                                                        <XCircle size={12} className="mr-1" />
                                                                        Rejected
                                                                    </Badge>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="flex justify-end gap-2">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => {
                                                                            setSelectedCompany(company);
                                                                            setIsModalOpen(true);
                                                                        }}
                                                                        className="gap-1"
                                                                    >
                                                                        <Eye size={14} />
                                                                        View Details
                                                                    </Button>
                                                                    <Select
                                                                        value={company.status}
                                                                        onValueChange={(value: "pending" | "approved" | "rejected") => {
                                                                            setCompanies((prev) => prev.map((c) => (c.id === company.id ? { ...c, status: value } : c)));

                                                                            route.put(
                                                                                `/companies/${company.id}/status`,
                                                                                { status: value },
                                                                                {
                                                                                    preserveState: true,
                                                                                    onError: () => {
                                                                                        setCompanies((prev) => prev.map((c) => (c.id === company.id ? { ...c, status: company.status } : c)));
                                                                                    },
                                                                                }
                                                                            );
                                                                        }}
                                                                    >
                                                                        <SelectTrigger className="w-[150px]">
                                                                            <SelectValue placeholder="Select Status" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectGroup>
                                                                                <SelectLabel>Status</SelectLabel>
                                                                                <SelectItem value="pending">Pending</SelectItem>
                                                                                <SelectItem value="approved">Approved</SelectItem>
                                                                                <SelectItem value="rejected">Rejected</SelectItem>
                                                                            </SelectGroup>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Mobile/Tablet Card View */}
                                    <div className="lg:hidden space-y-3 p-4">
                                        {[...filteredCompanies]
                                            .sort(
                                                (a, b) =>
                                                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                                            )
                                            .map((company) => (
                                                <div key={company.id} className="border rounded-lg p-4 shadow-sm bg-white hover:shadow-md transition-shadow">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Building2 size={18} className="text-orange-600" />
                                                                <span className="font-semibold text-base">{company.company_name}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                <User size={14} className="text-gray-400" />
                                                                <span>{company.agent_name ?? 'N/A'}</span>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            {company.status === "pending" && (
                                                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-200 text-xs">
                                                                    <Clock size={10} className="mr-1" />
                                                                    Pending
                                                                </Badge>
                                                            )}
                                                            {company.status === "approved" && (
                                                                <Badge variant="success" className="bg-green-100 text-green-700 border-green-200 text-xs">
                                                                    <CheckCircle size={10} className="mr-1" />
                                                                    Approved
                                                                </Badge>
                                                            )}
                                                            {company.status === "rejected" && (
                                                                <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200 text-xs">
                                                                    <XCircle size={10} className="mr-1" />
                                                                    Rejected
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-gray-500 mb-3">
                                                        Created: {new Date(company.created_at).toLocaleDateString()}
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedCompany(company);
                                                                setIsModalOpen(true);
                                                            }}
                                                            className="gap-1 flex-1 sm:flex-none"
                                                        >
                                                            <Eye size={14} />
                                                            View Details
                                                        </Button>
                                                        <Select
                                                            value={company.status}
                                                            onValueChange={(value: "pending" | "approved" | "rejected") => {
                                                                setCompanies((prev) => prev.map((c) => (c.id === company.id ? { ...c, status: value } : c)));

                                                                route.put(
                                                                    `/companies/${company.id}/status`,
                                                                    { status: value },
                                                                    {
                                                                        preserveState: true,
                                                                        onError: () => {
                                                                            setCompanies((prev) => prev.map((c) => (c.id === company.id ? { ...c, status: company.status } : c)));
                                                                        },
                                                                    }
                                                                );
                                                            }}
                                                        >
                                                            <SelectTrigger className="w-full sm:w-[140px]">
                                                                <SelectValue placeholder="Select Status" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectGroup>
                                                                    <SelectItem value="pending">Pending</SelectItem>
                                                                    <SelectItem value="approved">Approved</SelectItem>
                                                                    <SelectItem value="rejected">Rejected</SelectItem>
                                                                </SelectGroup>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {selectedCompany && (
                        <CompanyDetailsModal
                            company={selectedCompany}
                            isOpen={isModalOpen}
                            onClose={handleCloseModal}
                        />
                    )}
                </div>
            </AppLayout>
        </Can>
    );
}
