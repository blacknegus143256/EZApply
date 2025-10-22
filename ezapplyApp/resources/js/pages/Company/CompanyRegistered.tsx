import React, { useState, useMemo } from "react";
import { Head, usePage, router } from "@inertiajs/react";
import '../../../css/easyApply.css';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import AppLayout from '@/layouts/app-layout';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Company {
  id: number;
  company_name: string;
  brand_name: string;
  opportunity?: {
    franchise_type?: string | null;
  };
  year_founded?: number | null;
  country?: string | null;
  created_at: string;
  status: "pending" | "approved" | "rejected";
}

const CompanyRegistered = () => {
  const { companies } = usePage<{ companies: Company[] }>().props;
  const [searchTerm, setSearchTerm] = useState("");
  const [franchiseTypeFilter, setFranchiseTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createdAtFilter, setCreatedAtFilter] = useState("all");
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);



  // Helper function to check if date is within filter range
  const isDateInRange = (createdAt: string, filter: string) => {
    if (filter === "all") return true;
    const date = new Date(createdAt);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (filter) {
      case "today":
        return date >= today;
      case "this-week":
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return date >= weekStart;
      case "this-month":
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return date >= monthStart;
      case "this-year":
        const yearStart = new Date(now.getFullYear(), 0, 1);
        return date >= yearStart;
      default:
        return true;
    }
  };

  // Get unique franchise types
  const franchiseTypes = useMemo(() => {
    const types = new Set<string>();
    (companies || []).forEach((c) => {
      if (c.opportunity?.franchise_type) {
        types.add(c.opportunity.franchise_type);
      }
    });
    return Array.from(types).sort();
  }, [companies]);

  // Filter logic
  const filteredCompanies = useMemo(() => {
    return (companies || []).filter((c) => {
      const matchesSearch = c.company_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFranchiseType = franchiseTypeFilter === "all" || c.opportunity?.franchise_type === franchiseTypeFilter;
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      const matchesCreatedAt = createdAtFilter === "all" || isDateInRange(c.created_at, createdAtFilter);

      return matchesSearch && matchesFranchiseType && matchesStatus && matchesCreatedAt;
    });
  }, [companies, searchTerm, franchiseTypeFilter, statusFilter, createdAtFilter]);

  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Company Request", href: "/my-companies" },
  ];

  const rows = [];
  if (loading) {
    rows.push(
      <TableRow key="loading">
        <TableCell colSpan={8} className="text-center">
          <Loader2 className="h-6 w-6 animate-spin inline-block mr-2" />{" "}
          Loading companies...
        </TableCell>
      </TableRow>
    );
  } else if (error) {
    rows.push(
      <TableRow key="error">
        <TableCell colSpan={8} className="text-center text-red-500">
          {error}
        </TableCell>
      </TableRow>
    );
  } else if (filteredCompanies.length === 0) {
    rows.push(
      <TableRow key="no-companies">
        <TableCell colSpan={8} className="text-center">
          No companies registered yet.
        </TableCell>
      </TableRow>
    );
  } else {
    filteredCompanies.forEach((company) => {
      rows.push(
        <TableRow key={company.id}>
          {/* <TableCell>{company.id}</TableCell> */}
          <TableCell>{company?.company_name || "—"}</TableCell>
          <TableCell>{company.brand_name || "—"}</TableCell>
          <TableCell>
            {company.opportunity?.franchise_type || "—"}
          </TableCell>
          <TableCell>{company.year_founded || "—"}</TableCell>
          <TableCell>{company.country || "—"}</TableCell>
          <TableCell>
            {company.status === "pending" && (
              <Badge variant="secondary">Pending 🟡</Badge>
            )}
            {company.status === "approved" && (
              <Badge variant="secondary">Approved 🟢</Badge>
            )}
            {company.status === "rejected" && (
              <Badge variant="destructive">Rejected 🔴</Badge>
            )}
          </TableCell>
          <TableCell>
            {company.created_at
              ? new Date(company.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "—"}
          </TableCell>
          <TableCell>
            <div className="flex gap-2">
              <Button asChild variant="default">
                <Link href={`/companies/${company.id}/edit`}>Edit</Link>
              </Button>
            </div>
          </TableCell>
        </TableRow>
      );
    });
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Company Request" />
      <div className="bg-across-pages min-h-screen">
      <Card>
        <CardHeader className="flex flex-col md:flex-row justify-between items-center gap-2">
          <CardTitle>My Registered Companies</CardTitle>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {/* Search filter */}
            <Input
              type="text"
              placeholder="Search Company..."
              className="max-w-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {/* Franchise Type Filter */}
            <Select value={franchiseTypeFilter} onValueChange={setFranchiseTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Franchise Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {franchiseTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            {/* Created At Filter */}
            <Select value={createdAtFilter} onValueChange={setCreatedAtFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Created At" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="this-year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="gap-2 w-full md:w-auto">
              <Button variant="default" size="sm">
                 <Link href={'/company/register'}>Add Company</Link>
              </Button>
          </div>
        </CardHeader>

        <hr />

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company Name</TableHead>
                <TableHead>Brand Name</TableHead>
                <TableHead>Franchise Type</TableHead>
                <TableHead>Year Founded</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      </div>
    </AppLayout>
  );
};

export default CompanyRegistered;
