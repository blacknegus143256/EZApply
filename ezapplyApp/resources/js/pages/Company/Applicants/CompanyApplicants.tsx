import React, { useState, useMemo, useEffect } from "react";
import { Head, usePage, router } from "@inertiajs/react";
import "../../../../css/easyApply.css";
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
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import PermissionGate from "@/components/PermissionGate";
import { Button } from "@/components/ui/button";
import ChatButton from "@/components/ui/chat-button";
import ViewProfileDialog from "@/components/ViewProfileDialog";
import { Application } from "@/types/applicants";

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Company Applicants", href: "/company/applicants" },
];


type Applicant = {
  user: any;
  id: number;
  status: string;
  created_at: string;
};


const statusOptions = ["pending", "approved", "rejected", "interested"];

export default function CompanyApplicants() {
  const { props } = usePage<any>();
  const applicants = props.applicants ?? [];

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [createdAtFilter, setCreatedAtFilter] = useState<string>("");
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  // Modal states
  const [selectedApplicant, setSelectedApplicant] = useState<Application | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Paid + visible fields tracking
  const [visibleFields, setVisibleFields] = useState<Record<number, Record<string, boolean>>>({});
  const [paidFields, setPaidFields] = useState<Record<number, string[]>>({});

  const maskValue = (value: any) => "********";

  // Filter logic
  const filteredApplicants = useMemo(() => {
    return applicants.filter((a: any) =>{
      const firstName = a.user?.basicinfo?.first_name ?? "";
      const lastName = a.user?.basicinfo?.last_name ?? "";
      const email = a.user?.email ?? "";
      const fullName = `${firstName} ${lastName} ${email}` .toLowerCase();

      const matchesSearch = fullName.includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "" || a.status === statusFilter;

      let matchesCreatedAt = true;
      if (createdAtFilter) {
        if (a.created_at) {
          // Convert created_at (YYYY-MM-DD) to MM-DD-YYYY for comparison
          const date = new Date(a.created_at);
          const mm = String(date.getMonth() + 1).padStart(2, '0');
          const dd = String(date.getDate()).padStart(2, '0');
          const yyyy = date.getFullYear();
          const formattedDate = `${mm}-${dd}-${yyyy}`;
          matchesCreatedAt = formattedDate.includes(createdAtFilter);
        } else {
          matchesCreatedAt = false;
        }
      }

      return matchesSearch && matchesStatus && matchesCreatedAt;
    }
    );
  }, [applicants, searchTerm, statusFilter, createdAtFilter]);

  // Fetch paid fields for each applicant
  useEffect(() => {
    async function fetchPaidFields() {
      setLoading(true);
      try {
        for (const applicant of applicants) {
          const res = await fetch(`/check-applicant-view/${applicant.id}`);
          if (!res.ok) continue;
          const data = await res.json();

          if (Array.isArray(data.paid_fields)) {
            setPaidFields((prev) => ({ ...prev, [applicant.id]: data.paid_fields }));

            const revealed: Record<string, boolean> = {};
            data.paid_fields.forEach((f: string) => (revealed[f] = true));
            setVisibleFields((prev) => ({ ...prev, [applicant.id]: revealed }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch paid fields:", err);
      } finally {
        setLoading(false);
      }
    }

    if (applicants.length > 0) fetchPaidFields();
  }, [applicants]);

  const handleStatusChange = (id: number, status: string) => {
    router.put(`/company/applicants/${id}/status`, { status }, {
      preserveScroll: true,
      onSuccess: () => {
        router.reload({ only: ['applicants'] });
      }
    });
  };

  const handleCustomerClick = (application : any) => {
  setSelectedApplicant(application);
  setIsDialogOpen(true);
  }

  return (
    <PermissionGate
      permission="view_dashboard"
      role="company"
      fallback={<div className="p-6">You don't have permission to access this page.</div>}
    >
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Company Applicants" />
        <div className="bg-across-pages min-h-screen p-5">
          <Card>
            <CardHeader className="flex flex-col md:flex-row justify-between items-center gap-2">
              <CardTitle>Company Applicants</CardTitle>
              <div className="flex gap-2 w-full md:w-auto flex-wrap">
                <Input
                  type="text"
                  placeholder="Search applicant..."
                  className="max-w-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-md border-gray-300 dark:border-neutral-600 dark:bg-neutral-800 text-sm px-3 py-2"
                >
                  <option value="">All Statuses</option>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
                <Input
                  type="text"
                  placeholder="Filter by created date (MM-DD-YYYY)..."
                  className="max-w-sm"
                  value={createdAtFilter}
                  onChange={(e) => setCreatedAtFilter(e.target.value)}
                />
              </div>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        <Loader2 className="h-6 w-6 animate-spin inline-block mr-2" />
                        Loading applicants...
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-red-500">
                        {error}
                      </TableCell>
                    </TableRow>
                  ) : filteredApplicants.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        No applicants yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredApplicants.map((a: any) => (
                      <TableRow key={a.user?.id ?? a.id}>
                        <TableCell>
                          {visibleFields[a.id]?.first_name || visibleFields[a.id]?.last_name ? (
                            `${a.user?.basicinfo?.first_name ?? ""} ${a.user?.basicinfo?.last_name ?? ""}`
                          ) : (
                            maskValue("name")
                          )}
                        </TableCell>
                        <TableCell>
                          {visibleFields[a.id]?.email ? (
                            a.user?.email ?? "No email"
                          ) : (
                            maskValue("email")
                          )}
                        </TableCell>
                        <TableCell>
                          <select
                            value={a.status}
                            onChange={(e) => handleStatusChange(a.id, e.target.value)}
                            className="rounded-md border-gray-300 dark:border-neutral-600 dark:bg-neutral-800 text-sm"
                          >
                            {statusOptions.map((status) => (
                              <option key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </option>
                            ))}
                          </select>
                          <div className="mt-1">
                            {a.status === "pending" && <Badge variant="secondary">Pending 🟡</Badge>}
                            {a.status === "approved" && <Badge variant="secondary">Approved 🟢</Badge>}
                            {a.status === "rejected" && <Badge variant="destructive">Rejected 🔴</Badge>}
                            {a.status === "interested" && <Badge variant="outline">Interested 🔵</Badge>}
                          </div>
                        </TableCell>
                        <TableCell>{a.created_at ? new Date(a.created_at).toLocaleDateString() : "N/A"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button onClick={() => handleCustomerClick(a as unknown as Application)} className="view-btn btn-2 cursor-pointer">
                              Applicant Profile
                            </Button>
                            <ChatButton status={a.status} userId={a.user?.id} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Modal */}
          <ViewProfileDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            application={selectedApplicant}
          />
        </div>
      </AppLayout>
    </PermissionGate>
  );
}
