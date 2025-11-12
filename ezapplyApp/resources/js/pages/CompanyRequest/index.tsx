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
    const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const filteredCompanies = companies.filter((company) => {
    const matchesSearch = company.company_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ? true : company.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

    useEffect(() => {
  fetch("/companies")
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then((data: Company[]) => {
      console.log('Fetched companies data:', data); // Debug log
      console.log('First company agent_name:', data[0]?.agent_name); // Debug log
      
      const withStatus = data.map((c) => {
        const company = {
          ...c,
          status: c.status || 'pending',
          agent_name: c.agent_name || 'N/A', // Explicitly preserve agent_name
        };
        console.log('Mapped company:', company.id, 'agent_name:', company.agent_name); // Debug
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
                    <CardHeader className="flex flex-col md:flex-row justify-between items-center gap-2">
        <CardTitle>Registered Company Management</CardTitle>
        <div className="flex gap-2 w-full md:w-auto">
          {/* Search filter */}
          <Input
            type="text"
            placeholder="Search Company..."
            className="max-w-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Status filter */}
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
            <SelectTrigger className="w-[180px]">
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
      </CardHeader>
                    <hr />
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Agent Name</TableHead>
                                    <TableHead>Company Name</TableHead>
                                    <TableHead>Date Created</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Status</TableHead>
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
      .map((company) => {
        console.log('Rendering company:', company.id, 'agent_name:', company.agent_name); // Debug
        return (
        <TableRow key={company.id}>
          <TableCell>
            {company.agent_name ?? 'N/A'}
          </TableCell>
          <TableCell>{company.company_name}</TableCell>
          <TableCell>
            {new Date(company.created_at).toLocaleDateString()}
          </TableCell>

          <TableCell className="flex gap-2">
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
                setCompanies((prev) =>
                  prev.map((c) =>
                    c.id === company.id ? { ...c, status: value } : c
                  )
                );

                route.put(
                  `/companies/${company.id}/status`,
                  { status: value },
                  {
                    preserveState: true,
                    onError: () => {
                      setCompanies((prev) =>
                        prev.map((c) =>
                          c.id === company.id
                            ? { ...c, status: company.status }
                            : c
                        )
                      );
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

          <TableCell>
            {company.status === "pending" && (
              <Badge variant="secondary">Pending</Badge>
            )}
            {company.status === "approved" && (
              <Badge variant="success">Approved</Badge>
            )}
            {company.status === "rejected" && (
              <Badge variant="destructive">Rejected</Badge>
            )}
          </TableCell>

        </TableRow>
        );
      })
  )}
</TableBody>

                        </Table>
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
