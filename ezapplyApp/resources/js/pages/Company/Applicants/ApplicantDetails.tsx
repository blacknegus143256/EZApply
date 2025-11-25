import React from "react";
import { Head, usePage, Link } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BreadcrumbItem } from "@/types";
import { ArrowLeft, User, DollarSign, Building2, MapPin, Paperclip } from "lucide-react";

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
  const { props } = usePage<{ application: ApplicantDetailsProps["application"] }>();
  const applicant = props.application;

  // Format numbers and currency
  const formatValue = (
    value: string | number | undefined,
    type: "number" | "currency" = "number"
  ) => {
    if (value === undefined || value === null) return "";
    if (type === "currency") {
      const num =
        typeof value === "string"
          ? parseFloat(String(value).replace(/,/g, ""))
          : value;
      if (isNaN(Number(num))) return String(value);
      return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
      }).format(Number(num));
    }
    const strValue = String(value);
    const cleaned = strValue.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };

  // Render table
  const renderTable = (
    rows: { key: string; label: string; value: any; format?: "number" | "currency" }[]
  ) => (
    <table className="w-full text-sm">
      <tbody>
        {rows.map(({ key, label, value, format }) => (
          <tr key={key} className="border-b">
            <td className="font-medium py-2 pr-4 align-top">{label}</td>
            <td className="py-2 pr-4 align-top">
              {format === "currency"
                ? formatValue(value, "currency")
                : value ?? ""}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Applicant Details" />

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <User size={32} className="sm:w-10 sm:h-10" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Applicant Details</h1>
                <p className="text-blue-100 text-sm sm:text-base mt-1">
                  {applicant.user?.basicinfo?.first_name && applicant.user?.basicinfo?.last_name
                    ? `${applicant.user.basicinfo.first_name} ${applicant.user.basicinfo.last_name}`
                    : applicant.user?.email || 'Applicant Information'}
                </p>
              </div>
            </div>
            <Link href="/company-applicants">
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <ArrowLeft size={18} className="mr-2" />
                Back to Applicants
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Info */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
            {renderTable([
              {
                key: "full_name",
                label: "Full Name",
                value: `${applicant.user?.basicinfo?.first_name} ${applicant.user?.basicinfo?.last_name}`,
              },
              { key: "email", label: "Email", value: applicant.user?.email },
              { key: "phone", label: "Phone", value: applicant.user?.basicinfo?.phone },
              {
                key: "birth_date",
                label: "Birthdate",
                value: applicant.user?.basicinfo?.birth_date
                  ? new Date(
                      applicant.user?.basicinfo?.birth_date
                    ).toLocaleDateString()
                  : "",
              },
              {
                key: "status",
                label: "Status",
                value: <Badge>{applicant.status}</Badge>,
              },
              {
                key: "Facebook",
                label: "Facebook",
                value: applicant.user?.basicinfo?.Facebook,
              },
              {
                key: "LinkedIn",
                label: "LinkedIn",
                value: applicant.user?.basicinfo?.LinkedIn,
              },
              {
                key: "Viber",
                label: "Viber",
                value: applicant.user?.basicinfo?.Viber,
              },
            ])}
          </CardContent>
        </Card>

          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Financial Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
            {applicant.user?.financial ? (
              renderTable([
                {
                  key: "income_source",
                  label: "Income Source",
                  value: applicant.user.financial.income_source,
                },
                {
                  key: "monthly_income",
                  label: "Monthly Income",
                  value: applicant.user.financial.monthly_income,
                  format: "currency",
                },
                {
                  key: "other_income",
                  label: "Other Income",
                  value: applicant.user.financial.other_income,
                },
                {
                  key: "monthly_expenses",
                  label: "Monthly Expenses",
                  value: applicant.user.financial.monthly_expenses,
                  format: "currency",
                },
                {
                  key: "existing_loans",
                  label: "Existing Loans",
                  value: applicant.user.financial.existing_loans,
                  format: "currency",
                },
              ])
            ) : (
              <p>No financial information</p>
            )}
          </CardContent>
        </Card>

          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                Affiliations
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
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

          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-600" />
                Address
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
            {applicant.user?.address ? (
              renderTable([
                {
                  key: "region",
                  label: "Region",
                  value: applicant.user.address.region_name,
                },
                {
                  key: "province",
                  label: "Province",
                  value: applicant.user.address.province_name,
                },
                {
                  key: "city",
                  label: "City/Municipality",
                  value: applicant.user.address.citymun_name,
                },
                {
                  key: "barangay",
                  label: "Barangay",
                  value: applicant.user.address.barangay_name,
                },
              ])
            ) : (
              <p>No address information</p>
            )}
          </CardContent>
        </Card>

          <Card className="md:col-span-2 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20">
              <CardTitle className="flex items-center gap-2">
                <Paperclip className="w-5 h-5 text-gray-600" />
                Attachments
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
            {applicant.user?.attachments?.length
              ? renderTable(
                  applicant.user.attachments.map((att, i) => ({
                    key: `attachment-${i}`,
                    label: `Attachment ${i + 1}`,
                    value: att.attachment_type,
                  }))
                )
              : <p className="text-gray-500 dark:text-gray-400">No attachments</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
