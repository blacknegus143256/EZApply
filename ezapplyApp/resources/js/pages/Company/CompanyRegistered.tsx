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
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);



  // Filter logic
  const filteredCompanies = useMemo(() => {
    return (companies || []).filter((c) =>
      c.company_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [companies, searchTerm]);

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
      <div className="bg-across-pages min-h-screen p-5">
      <Card>
        <CardHeader className="flex flex-col md:flex-row justify-between items-center gap-2">
          <CardTitle>My Registered Companies</CardTitle>
          <div className="flex gap-2 w-full md:w-auto">
            {/* Search filter */}
            <Input
              type="text"
              placeholder="Search Company..."
              className="max-w-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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
