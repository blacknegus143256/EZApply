import React, { useState, useMemo } from "react";
import { Head, usePage, router } from "@inertiajs/react";
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
import { Link } from "@inertiajs/react";
import ChatButton from "@/components/ui/chat-button";
import ViewProfileDialog from "@/components/ViewProfileDialog"; 
import { Application } from "@/types/applicants";


const breadcrumbs: BreadcrumbItem[] = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Company Applicants", href: "/company/applicants" },
];




const statusOptions = ["pending", "approved", "rejected", "interested"];

export default function CompanyApplicants() {
  const { props } = usePage<PageProps>();
  const applicants = props.applicants ?? [];
  const [searchTerm, setSearchTerm] = useState("");
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);
  // Modal states
  const [selectedApplicant, setSelectedApplicant] = useState<Application | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);


  // Filter logic
  const filteredApplicants = useMemo(() => {
    return applicants.filter((a) =>{
      const firstName = a.user?.basicinfo?.first_name ?? "";
      const lastName = a.user?.basicinfo?.last_name ?? "";
      const email = a.user?.email ?? "";
      const fullName = `${firstName} ${lastName} ${email}` .toLowerCase();

      
    return fullName.includes(searchTerm.toLowerCase());
    }
    );
  }, [applicants, searchTerm]);

  const handleStatusChange = (id: number, status: string) => {
    router.put(`/company/applicants/${id}/status`, { status }, { preserveScroll: true });
  };

  const handleCustomerClick = (application : Application) => {
  setSelectedApplicant(application);
  setIsDialogOpen(true);
  }

  return (
    <PermissionGate
      permission="view_dashboard" role="company"
      fallback={<div className="p-6">You don't have permission to access this page.</div>}
    >
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Company Applicants" />

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
                    <TableCell colSpan={3} className="text-center">
                      <Loader2 className="h-6 w-6 animate-spin inline-block mr-2" />
                      Loading applicants...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-red-500">
                      {error}
                    </TableCell>
                  </TableRow>
                ) : filteredApplicants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      No applicants yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApplicants.map((a) => (
                    <TableRow key={a.user?.id ?? a.id}>
                      <TableCell>
                        {a.customer?.basicinfo && (a.customer.basicinfo.first_name || a.customer.basicinfo.last_name)
                          ? `${a.customer.basicinfo.first_name ?? ""} ${a.customer.basicinfo.last_name ?? ""}`.trim()
                          : "Unknown User"}
                      </TableCell>
                      <TableCell>{a.customer?.user?.email ?? "No email"}</TableCell>
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
                        {/* Optional badge display */}
                        <div className="mt-1">
                          {a.status === "pending" && (
                            <Badge variant="secondary">Pending 🟡</Badge>
                          )}
                          {a.status === "approved" && (
                            <Badge variant="secondary">Approved 🟢</Badge>
                          )}
                          {a.status === "rejected" && (
                            <Badge variant="destructive">Rejected 🔴</Badge>
                          )}
                          {a.status === "interested" && (
                            <Badge variant="outline">Interested 🔵</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        
                      <div className="flex items-center gap-2">
                        <Button onClick={() => handleCustomerClick(a as unknown as Application)} className="view-btn btn-2 cursor-pointer">
                          Applicant Profile
                        </Button>

                        <ChatButton status={a.status} userId={a.customer?.user?.id} />
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
      </AppLayout>
    </PermissionGate>
  );
}
