import React, { useEffect, useState } from "react";
import { Head, usePage, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { BreadcrumbItem } from "@/types";

interface ApplicantDetailsProps {
  application: {
    id: number;
    status: string;
    user: {
      id: number;
      email: string;
      basicinfo?: {
        first_name: string;
        last_name: string;
        birth_date: string;
        phone: number | string;
        Facebook?: string;
        LinkedIn?: string;
        Viber?: string;
      };
      affiliations?: { institution: string; position: string }[];
      financial?: {
        income_source?: string;
        monthly_income?: number;
        other_income?: string;
        monthly_expenses?: number;
        existing_loans?: number;
      } | null;
      attachments?: { attachment_type?: string }[];
      address?: {
        region_name: string;
        province_name: string;
        citymun_name: string;
        barangay_name: string;
      };
    };
  };
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Company Applicants", href: "/company/applicants" },
  { title: "Applicant Details", href: "#" },
];

export default function ApplicantDetails() {
  const { props } = usePage<{ application: ApplicantDetailsProps["application"], auth: { user: { credit?: { balance: number }, credits?: number } } }>(); // Added auth type
  const applicant = props.application;

  // UI state
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>({});
  const [paidFields, setPaidFields] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [dontAskAgain, setDontAskAgain] = useState(false);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number | null>(
    props.auth?.user?.credit?.balance ?? props.auth?.user?.credits ?? null
  );

  const cost = 5; 

  const revealField = (fieldKey: string) => {
    setVisibleFields((prev) => ({ ...prev, [fieldKey]: true }));
  };

  const toggleFieldVisibility = (fieldKey: string) => {
    setVisibleFields((prev) => ({ ...prev, [fieldKey]: !prev[fieldKey] }));
  };

  const maskValue = (value: any) => "********";

  const formatValue = (value: string | number | undefined, type: "number" | "currency" = "number") => {
    if (value === undefined || value === null) return "";
    if (type === "currency") {
      const num = typeof value === "string" ? parseFloat(String(value).replace(/,/g, "")) : value;
      if (isNaN(Number(num))) return String(value);
      return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(Number(num));
    }
    const strValue = String(value);
    const cleaned = strValue.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };

  const handleViewClick = async (fieldKey: string) => {
    if (visibleFields[fieldKey]) return; 

    if (dontAskAgain) {
      revealField(fieldKey);
      return;
    }

    try {
      const res = await fetch(`/check-applicant-view/${applicant.id}`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();

      if (data.paid_fields && Array.isArray(data.paid_fields) && data.paid_fields.includes(fieldKey)) {
        revealField(fieldKey);
        return;
      }

      setSelectedField(fieldKey);
      setDialogOpen(true);
    } catch (err) {
      console.error("Failed to check field status or fetch already paid fields:", err);
      alert("Could not check field status. Please try again.");
    }
  };

  // Confirm payment
  const handleConfirmPayment = () => {
    if (!selectedField) return;
    setLoading(true);

    router.post("/view-applicant", { application_id: applicant.id, field_key: selectedField }, 
      {
        onSuccess: (page) => {
          revealField(selectedField);
          setDialogOpen(false);
          setLoading(false);

          const newBalance = page.props?.auth?.user?.credit?.balance ?? page.props?.auth?.user?.credits ?? null;
          if (newBalance !== undefined) setBalance(newBalance as number);

          if (!paidFields.includes(selectedField)) {
            setPaidFields((prev) => [...prev, selectedField]);
          }
           alert("Payment successful!");
        },
        onError: (errors) => {
          setLoading(false);
          const msg = errors?.balance || errors?.message || "Transaction failed.";
          alert(msg);
        },
        preserveScroll: true,
        preserveState: true, 
      }
    );
  };

  const renderTable = (rows: { key: string; label: string; value: any; format?: "number" | "currency" }[]) => (
    <table className="w-full text-sm">
      <tbody>
        {rows.map(({ key, label, value, format }) => (
          <tr key={key} className="border-b">
            <td className="font-medium py-2 pr-4 align-top">{label}</td>
            <td className="py-2 pr-4 align-top">
              {visibleFields[key] ? (format === "currency" ? formatValue(value, "currency") : value ?? "") : maskValue(value)}
            </td>
            <td className="py-2 text-right align-top">
              {!visibleFields[key] ? (
                <Button size="sm" variant="outline" onClick={() => handleViewClick(key)}>
                  View
                </Button>
              ) : (
                <Button size="sm" variant="ghost" onClick={() => toggleFieldVisibility(key)}>
                  Hide
                </Button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  useEffect(() => {
    async function fetchPaidFields() {
      try {
        const res = await fetch(`/check-applicant-view/${applicant.id}`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        if (Array.isArray(data.paid_fields)) {
          setPaidFields(data.paid_fields);
          const revealed: Record<string, boolean> = {};
          data.paid_fields.forEach((f: string) => (revealed[f] = true));
          setVisibleFields(revealed);
        }
      } catch (err) {
        console.error("Failed to fetch paid fields:", err);
      }
    }
    fetchPaidFields();
  }, [applicant.id]);
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Applicant Details" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <Card>
          <CardHeader>
            <CardTitle>
              {applicant.user?.basicinfo?.first_name} {applicant.user?.basicinfo?.last_name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderTable([
              { key: "email", label: "Email", value: applicant.user?.email },
              { key: "phone", label: "Phone", value: applicant.user?.basicinfo?.phone },
              {
                key: "birth_date",
                label: "Birthdate",
                value: applicant.user?.basicinfo?.birth_date
                  ? new Date(applicant.user?.basicinfo?.birth_date).toLocaleDateString()
                  : "",
              },
              { key: "status", label: "Status", value: <Badge>{applicant.status}</Badge> },
              { key: "Facebook", label: "Facebook", value: applicant.user?.basicinfo?.Facebook },
              { key: "LinkedIn", label: "LinkedIn", value: applicant.user?.basicinfo?.LinkedIn },
              { key: "Viber", label: "Viber", value: applicant.user?.basicinfo?.Viber },
            ])}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Information</CardTitle>
          </CardHeader>
          <CardContent>
            {applicant.user?.financial ? (
              renderTable([
                { key: "income_source", label: "Income Source", value: applicant.user.financial.income_source },
                { key: "monthly_income", label: "Monthly Income", value: applicant.user.financial.monthly_income, format: "currency" },
                { key: "other_income", label: "Other Income", value: applicant.user.financial.other_income },
                { key: "monthly_expenses", label: "Monthly Expenses", value: applicant.user.financial.monthly_expenses, format: "currency" },
                { key: "existing_loans", label: "Existing Loans", value: applicant.user.financial.existing_loans, format: "currency" },
              ])
            ) : (
              <p>No financial information</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Affiliations</CardTitle>
          </CardHeader>
          <CardContent>
            {applicant.user?.affiliations?.length
              ? renderTable(
                  applicant.user.affiliations.map((a, i) => ({
                    key: `affiliation-${i}`,
                    label: a.institution, 
                    value: a.position,
                  }))
                )
              : <p>No affiliations</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Address</CardTitle>
          </CardHeader>
          <CardContent>
            {applicant.user?.address ? (
              renderTable([
                { key: "region", label: "Region", value: applicant.user.address.region_name },
                { key: "province", label: "Province", value: applicant.user.address.province_name },
                { key: "city", label: "City/Municipality", value: applicant.user.address.citymun_name },
                { key: "barangay", label: "Barangay", value: applicant.user.address.barangay_name },
              ])
            ) : (
              <p>No address information</p>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Attachments</CardTitle>
          </CardHeader>
          <CardContent>
            {applicant.user?.attachments?.length
              ? renderTable(
                  applicant.user.attachments.map((att, i) => ({
                    key: `attachment-${i}`,
                    label: `Attachment ${i + 1}`,
                    value: att.attachment_type,
                  }))
                )
              : <p>No attachments</p>}
          </CardContent>
        </Card>
      </div>


      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="p-6 rounded-md max-w-md mx-auto mt-5 bg-white dark:bg-neutral-800">
          <DialogTitle className="text-lg font-bold mb-4">Confirm Transaction</DialogTitle>

          <p>This will cost <strong>{cost} credits</strong>. Do you want to proceed?</p>

          <div className="mt-4 flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline" disabled={loading}>Cancel</Button>
            </DialogClose>
            <Button onClick={handleConfirmPayment} disabled={loading}>
              {loading ? "Processing..." : "Proceed"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}