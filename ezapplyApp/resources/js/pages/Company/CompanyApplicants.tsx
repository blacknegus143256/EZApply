import React, { useState, useMemo } from "react";
import { usePage, router } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, SharedData } from "@/types";
import PermissionGate from "@/components/PermissionGate";
import { Button } from "@/components/ui/button";
import ChatButton from "@/components/ui/chat-button";
import PaymentConfirmationDialog from "./PaymentConfirm";
import ViewProfileDialog from "./ViewProfileDialog";
import { Application } from "@/types/applicants";

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Company Applicants", href: "/company/applicants" },
];

export default function CompanyApplicants() {
  type PagePropsWithAuth = {
    applicants?: Application[];
    user: { id: number; balance: number };
  } & SharedData;

  const { props } = usePage<PagePropsWithAuth>();
  const applicants = props.applicants ?? [];
  const [searchTerm, setSearchTerm] = useState("");
  const [balance, setBalance] = useState(props.auth.user?.credits ?? 0);

  const [pendingApplicant, setPendingApplicant] = useState<Application | null>(
    null
  );
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);

  const cost = 50;

  const filteredApplicants = useMemo(() => {
    return applicants.filter((a) =>
      `${a.user?.first_name ?? ""} ${a.user?.last_name ?? ""}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [applicants, searchTerm]);

  const handleStatusChange = (id: number, status: string) => {
    router.put(
      `/company/applicants/${id}/status`,
      { status },
      { preserveScroll: true }
    );
  };

  const handleViewProfileClick = async (applicant: Application) => {
  setPendingApplicant(applicant);

  try {
    const res = await fetch(`/company/check-applicant-view/${applicant.id}`, {
      headers: {
        'Accept': 'application/json', 
      },
    });

    if (!res.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await res.json();

    if (data.already_viewed) {
      setShowProfileDialog(true);
    } else if (balance >= cost) {
      setShowPaymentDialog(true);
    } else {
      alert('Insufficient balance to view this profile.');
    }
  } catch (error) {
    console.error(error);
    alert('Error checking applicant view status.');
  }
};



  const confirmPayment = async () => {
  if (!pendingApplicant) return;

  try {
    await router.post(
      "/company/view-applicant",
      { application_id: pendingApplicant.id }, 
      {
        onSuccess: (page) => {
          if (page.props?.already_paid) {
            setShowProfileDialog(true);
            return;
          }

          if (page.props.auth?.user?.credits !== undefined) {
            setBalance(page.props.auth.user.credits);
          } else {
            setBalance((prev) => prev - cost);
          }

          setShowProfileDialog(true);
        },
        onError: () => {
          alert("Payment failed. Please check your balance.");
        },
      }
    );
  } catch {
    alert("Something went wrong.");
  }
};


  return (
    <PermissionGate
      permission="view_company_dashboard"
      fallback={<div className="p-6">You don't have permission.</div>}
    >
      <AppLayout breadcrumbs={breadcrumbs}>
        <Card>
          <CardHeader className="flex flex-col md:flex-row justify-between items-center gap-2">
            <CardTitle>Company Applicants</CardTitle>
            <Input
              type="text"
              placeholder="Search applicant..."
              className="max-w-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </CardHeader>
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
                {filteredApplicants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No applicants found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApplicants.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>{`${a.user?.first_name ?? ""} ${
                        a.user?.last_name ?? ""
                      }`.trim()}</TableCell>
                      <TableCell>{a.user?.email}</TableCell>
                      <TableCell>
                        <select
                          value={a.status}
                          onChange={(e) =>
                            handleStatusChange(a.id, e.target.value)
                          }
                          className="rounded-md border-gray-300 dark:border-neutral-600 dark:bg-neutral-800 text-sm"
                        >
                          {["pending", "approved", "rejected", "interested"].map(
                            (status) => (
                              <option key={status} value={status}>
                                {status.charAt(0).toUpperCase() +
                                  status.slice(1)}
                              </option>
                            )
                          )}
                        </select>
                        <div className="mt-1">
                          {a.status === "pending" && (
                            <Badge variant="secondary">Pending 🟡</Badge>
                          )}
                          {a.status === "approved" && (
                            <Badge variant="success">Approved 🟢</Badge>
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
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleViewProfileClick(a)}
                            // disabled={balance < cost}
                          >
                            View Profile
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

        {pendingApplicant && (
          <PaymentConfirmationDialog
            open={showPaymentDialog}
            onOpenChange={setShowPaymentDialog}
            cost={cost}
            balance={balance}
            onConfirm={confirmPayment}
          />
        )}

        {pendingApplicant && (
          <ViewProfileDialog
            open={showProfileDialog}
            onOpenChange={setShowProfileDialog}
            application={pendingApplicant}
          />
        )}
      </AppLayout>
    </PermissionGate>
  );
}
