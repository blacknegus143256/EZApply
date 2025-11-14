import { useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, router as route } from '@inertiajs/react';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
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

    return (
        <Can permission="view_request_companies" fallback={<div className="p-4">You don't have permission to view roles.</div>}>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head>
                    <title>Company Request</title>
                </Head>
                <Card>
                    <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                        <div className="w-full md:w-auto">
                            <CardTitle>Registered Company Management</CardTitle>
                        </div>

                        <div className="w-full md:w-auto">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                                <Input
                                    type="text"
                                    placeholder="Search Company..."
                                    className="w-full md:max-w-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />

                                <Input
                                    type="text"
                                    placeholder="Search Agent..."
                                    className="w-full md:max-w-sm"
                                    value={agentSearchTerm}
                                    onChange={(e) => setAgentSearchTerm(e.target.value)}
                                />

                                <div className="w-full md:w-auto">
                                    <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                                        <SelectTrigger className="w-full md:w-[180px]">
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
                        </div>
                    </CardHeader>
                    <hr />
                    <CardContent>
                        {/* Desktop table */}
                        <div className="hidden md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className='text-center'>Agent Name</TableHead>
                                        <TableHead className='text-center'>Company Name</TableHead>
                                        <TableHead className='text-center'>Date Created</TableHead>
                                        <TableHead className='text-center'>Action</TableHead>
                                        <TableHead className='text-center'>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center">
                                                <Loader2 className="h-6 w-6 animate-spin inline-block mr-2" /> Loading
                                                companies...
                                            </TableCell>
                                        </TableRow>
                                    ) : error ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-red-500">
                                                {error}
                                            </TableCell>
                                        </TableRow>
                                    ) : companies.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center">
                                                No companies registered yet.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        [...filteredCompanies]
                                            .sort(
                                                (a, b) =>
                                                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                                            )
                                            .map((company) => (
                                                <TableRow key={company.id}>
                                                    <TableCell className="text-center">{company.agent_name ?? 'N/A'}</TableCell>
                                                    <TableCell className="text-center">{company.company_name}</TableCell>
                                                    <TableCell className="text-center">{new Date(company.created_at).toLocaleDateString()}</TableCell>
                                                    <TableCell className="flex gap-2 justify-center items-center">
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => {
                                                                setSelectedCompany(company);
                                                                setIsModalOpen(true);
                                                            }}
                                                        >
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
                                                            <SelectTrigger className="w-[180px]">
                                                                <SelectValue placeholder="Select Status" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectGroup>
                                                                    <SelectLabel className="text-center">Status</SelectLabel>
                                                                    <SelectItem value="pending">Pending</SelectItem>
                                                                    <SelectItem value="approved">Approved</SelectItem>
                                                                    <SelectItem value="rejected">Rejected</SelectItem>
                                                                </SelectGroup>
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {company.status === "pending" && <Badge variant="secondary">Pending</Badge>}
                                                        {company.status === "approved" && <Badge variant="success">Approved</Badge>}
                                                        {company.status === "rejected" && <Badge variant="destructive">Rejected</Badge>}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Mobile cards */}
                        <div className="md:hidden p-4 space-y-3">
                            {loading ? (
                                <div className="text-center">
                                    <Loader2 className="h-6 w-6 animate-spin inline-block mr-2" /> Loading companies...
                                </div>
                            ) : error ? (
                                <div className="text-center text-red-500">{error}</div>
                            ) : filteredCompanies.length === 0 ? (
                                <div className="text-center">No companies registered yet.</div>
                            ) : (
                                [...filteredCompanies]
                                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                    .map((company) => (
                                        <div key={company.id} className="border rounded-lg p-4 shadow-sm">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="text-sm text-gray-500">Agent</div>
                                                    <div className="font-medium">{company.agent_name ?? 'N/A'}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm text-gray-500">Added</div>
                                                    <div className="font-medium">{new Date(company.created_at).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                            <div className="mt-3">
                                                <div className="text-sm text-gray-500">Company</div>
                                                <div className="font-medium">{company.company_name}</div>
                                            </div>
                                            <div className="mt-3 flex gap-2 justify-end">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSelectedCompany(company);
                                                        setIsModalOpen(true);
                                                    }}
                                                >
                                                    View Details
                                                </Button>
                                                <Select
                                                    value={company.status}
                                                    onValueChange={(value: "pending" | "approved" | "rejected") => {
                                                        setCompanies((prev) => prev.map((c) => (c.id === company.id ? { ...c, status: value } : c)));
                                                        route.put(`/companies/${company.id}/status`, { status: value }, { preserveState: true });
                                                    }}
                                                >
                                                    <SelectTrigger className="w-[140px]">
                                                        <SelectValue placeholder="Status" />
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
                                    ))
                            )}
                        </div>
                        {selectedCompany && (
  <CompanyDetailsModal
    company={selectedCompany}
    isOpen={isModalOpen}
    onClose={handleCloseModal}
  />
)}

                    </CardContent>
                </Card>
            </AppLayout>
        </Can>
    );
}
