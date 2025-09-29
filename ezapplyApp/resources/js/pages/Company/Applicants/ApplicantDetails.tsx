import React from "react";
import { Head, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BreadcrumbItem } from "@/types";

interface ApplicantDetailsProps {
  applicant: {
    id: number;
    status: string;
    user: {
      id: number;
      email: string;
      basicinfo?: {
        first_name: string;
        last_name: string;
        birth_date: string;
        phone: number;
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
    const { props } = usePage<{ application: any }>();
    console.log("Applicant props:", props);

  type FormatType = "number" | "currency";

      const formatValue = (value: string | number, type: FormatType = "number") => {
        if (type === "currency") {
          const num = typeof value === "string" ? parseFloat(value.replace(/,/g, "")) : value;
          if (isNaN(num)) return "";
          return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
          }).format(num);
        }

        // default: number formatting
        const strValue = String(value);
        const cleaned = strValue.replace(/[^0-9.]/g, "");
        const parts = cleaned.split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
      };
//   const { props } = usePage<{ applicant: ApplicantDetailsProps["applicant"] }>();
  const applicant = props.application;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Applicant Details" />

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>
              {applicant.user?.basicinfo?.first_name}{" "}
              {applicant.user?.basicinfo?.last_name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Email:</strong> {applicant.user?.email}</p>
            <p><strong>Phone:</strong> {applicant.user?.basicinfo?.phone}</p>
            <p><strong>Birthdate:</strong> {new Date(applicant.user?.basicinfo?.birth_date).toLocaleDateString()}</p>
            <p><strong>Status:</strong> <Badge>{applicant.status}</Badge></p>
            <p><strong>Facebook:</strong> {applicant.user?.basicinfo?.Facebook}</p>
            <p><strong>LinkedIn:</strong> {applicant.user?.basicinfo?.LinkedIn}</p>
            <p><strong>Viber:</strong> {applicant.user?.basicinfo?.Viber}</p>
          </CardContent>
        </Card>

        {/* Financial Info */}
        <Card>
          <CardHeader><CardTitle>Financial Information</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Income Source:</strong> {applicant.user?.financial?.income_source}</p>
            <p><strong>Monthly Income:</strong> {formatValue(applicant.user?.financial?.monthly_income, "currency")}</p>
            <p><strong>Other Income:</strong> {applicant.user?.financial?.other_income}</p>
            <p><strong>Monthly Expenses:</strong> {formatValue(applicant.user?.financial?.monthly_expenses, "currency")}</p>
            <p><strong>Existing Loans:</strong> {formatValue(applicant.user?.financial?.existing_loans, "currency")}</p>
          </CardContent>
        </Card>

        {/* Affiliations */}
        <Card>
          <CardHeader><CardTitle>Affiliations</CardTitle></CardHeader>
          <CardContent>
            {applicant.user?.affiliations?.length ? (
              <ul className="list-disc ml-6">
                {applicant.user.affiliations.map((a, i) => (
                  <li key={i}>{a.institution} – {a.position}</li>
                ))}
              </ul>
            ) : (
              <p>No affiliations</p>
            )}
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader><CardTitle>Address</CardTitle></CardHeader>
          <CardContent>
            <p>
              {applicant.user?.address?.barangay_name},{" "}
              {applicant.user?.address?.citymun_name},{" "}
              {applicant.user?.address?.province_name},{" "}
              {applicant.user?.address?.region_name}
            </p>
          </CardContent>
        </Card>

        {/* Attachments (full width) */}
        <Card className="md:col-span-2">
          <CardHeader><CardTitle>Attachments</CardTitle></CardHeader>
          <CardContent>
            {applicant.user?.attachments?.length ? (
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {applicant.user.attachments.map((att, i) => (
                  <li
                    key={i}
                    className="p-2 border rounded-lg shadow-sm bg-gray-50"
                  >
                    {att.attachment_type}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No attachments</p>
            )}
          </CardContent>
        </Card>

      </div>
    </AppLayout>
  );
}
