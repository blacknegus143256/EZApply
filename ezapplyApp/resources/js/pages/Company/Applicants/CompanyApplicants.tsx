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

const statusOptions = ["pending", "approved", "rejected", "interested"];

export default function CompanyApplicants() {
  const { props } = usePage<any>();
  const applicants = props.applicants ?? [];

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
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
    return applicants.filter((a: any) => {
      const firstName = a.user?.basicinfo?.first_name ?? "";
      const lastName = a.user?.basicinfo?.last_name ?? "";
      const email = a.user?.email ?? "";
      const fullName = `${firstName} ${lastName} ${email}`.toLowerCase();
      return fullName.includes(searchTerm.toLowerCase());
    });
  }, [applicants, searchTerm]);

  // Fetch paid fields for each applicant, batching state updates
  useEffect(() => {
    let isMounted = true; 
    
    async function fetchPaidFields() {
      if (!isMounted) return;

      setLoading(true);
      
      const newPaidFields: Record<number, string[]> = {};
      const newVisibleFields: Record<number, Record<string, boolean>> = {};
      
      try {
        // Use Promise.all() for concurrent fetching
        const fetchPromises = applicants.map(async (applicant: any) => {
          try {
            const res = await fetch(`/check-applicant-view/${applicant.id}`);
            if (!res.ok) {
              // Log the error to help debug backend failures
              console.error(`API call failed for ID ${applicant.id}. Status: ${res.status}`);
              return null;
            }
            
            const data = await res.json();
            
            if (Array.isArray(data.paid_fields)) {
              const revealed: Record<string, boolean> = {};
              data.paid_fields.forEach((f: string) => (revealed[f] = true));
              
              return { 
                id: applicant.id, 
                paid_fields: data.paid_fields, 
                visible_fields: revealed 
              };
            }
            return null;
          } catch (err) {
            console.error(`Failed to fetch paid fields for ID ${applicant.id}:`, err);
            return null;
          }
        });
        
        const results = await Promise.all(fetchPromises);
        
        results.forEach(result => {
          if (result) {
            newPaidFields[result.id] = result.paid_fields;
            newVisibleFields[result.id] = result.visible_fields;
          }
        });

        if (isMounted) {
          // Update state once after all fetches are complete
          setPaidFields((prev) => ({ ...prev, ...newPaidFields }));
          setVisibleFields((prev) => ({ ...prev, ...newVisibleFields }));
        }
        
      } catch (err) {
        if (isMounted) {
          console.error("Critical error during batch fetch:", err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (applicants.length > 0) fetchPaidFields();
    
    return () => {
      isMounted = false;
    };
    
  }, [applicants]);

  const handleStatusChange = (id: number, status: string) => {
    router.put(`/company/applicants/${id}/status`, { status }, { preserveScroll: true });
  };

  const handleCustomerClick = (application: Application) => {
    setSelectedApplicant(application);
    setIsDialogOpen(true);
  };

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
              <div className="flex gap-2 w-full md:w-auto">
                <Input
                  type="text"
                  placeholder="Search applicant..."
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
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        <Loader2 className="h-6 w-6 animate-spin inline-block mr-2" />
                        Loading applicants...
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-red-500">
                        {error}
                      </TableCell>
                    </TableRow>
                  ) : filteredApplicants.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        No applicants yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredApplicants.map((a: any) => (
                      <TableRow key={a.user?.id ?? a.id}>
                        {/* Name field */}
                        <TableCell>
                          {/* This check is correct based on expected backend keys */}
                          {visibleFields[a.id]?.first_name || visibleFields[a.id]?.last_name ? (
                              `${a.user?.basicinfo?.first_name ?? ""} ${a.user?.basicinfo?.last_name ?? ""}`
                            ) : (
                              maskValue("name")
                            )}
                        </TableCell>

                        {/* Email field */}
                        <TableCell>
                          {visibleFields[a.id]?.email ? (
                            a.user?.email ?? "No email"
                          ) : (
                            maskValue("email")
                          )}
                        </TableCell>

                        {/* Status */}
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

                        {/* Actions */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => handleCustomerClick(a as Application)}
                              className="view-btn btn-2 cursor-pointer"
                            >
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