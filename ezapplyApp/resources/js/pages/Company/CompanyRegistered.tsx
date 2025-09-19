import React, { useState, useMemo } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
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
import { BreadcrumbItem } from "@/types";
import { Button } from "@/components/ui/button";

interface Company {
  id: number;
  company_name: string;
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

  const breadcrumbs : BreadcrumbItem[] = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Company Request", href: "/companies/my" },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Company Request" />

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
        </CardHeader>

        <hr />

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Company Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    <Loader2 className="h-6 w-6 animate-spin inline-block mr-2" />{" "}
                    Loading companies...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-red-500">
                    {error}
                  </TableCell>
                </TableRow>
              ) : filteredCompanies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    No companies registered yet.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCompanies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell>{company.id}</TableCell>
                    <TableCell>{company.company_name}</TableCell>
                    <TableCell>
                      {company.status === "pending" && (
                        <Badge variant="secondary">Pending 🟡</Badge>
                      )}
                      {company.status === "approved" && (
                        <Badge variant="success">Approved 🟢 </Badge>
                      )}
                      {company.status === "rejected" && (
                        <Badge variant="destructive">Rejected 🔴</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Link href={`/companies/${company.id}`}>
                        <Button variant={'destructive'} size={'sm'}>
                          Delete
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default CompanyRegistered;
