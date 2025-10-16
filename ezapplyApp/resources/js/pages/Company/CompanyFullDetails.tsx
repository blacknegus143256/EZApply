import React from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useInitials } from '@/hooks/use-initials';
import { ArrowLeft } from 'lucide-react';
import { BreadcrumbItem } from '@/types'; 
import type { CompanyDetails } from '@/types/company';

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

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "All Companies", href: "/list-companies" },
  { title: "Company Details", href: "#" },
];

const renderTable = (rows: { key: string; label: string; value: any; format?: "number" | "currency" }[]) => (
  <table className="w-full text-sm">
    <tbody>
      {rows.map(({ key, label, value, format }) => (
        <tr key={key} className="border-b last:border-b-0">
          <td className="font-medium text-muted-foreground py-3 pr-6 align-top w-1/3">{label}</td>
          <td className="py-3 align-top whitespace-pre-wrap">
            {format === "currency" ? formatValue(value, "currency") : value ?? ""}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

const CompanyFullDetails: React.FC = () => {
  const { props } = usePage<{ company: CompanyDetails }>();
  const company = props.company;
  const getInitials = useInitials();

  return (
    <>
      <Head title="Company Details" />

      {/* Back Button */}
      <div className="flex justify-start mb-4">
        <Link
          href="/applicant/franchise"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition-all duration-200 hover:shadow-lg"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      {/* Company Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-12 p-6 bg-card rounded-lg border">
        <Avatar className="h-32 w-32 md:h-40 md:w-40 mx-auto md:mx-0">
          <AvatarImage
            className="object-contain"
            src={company.marketing?.logo_path ? `/storage/${company.marketing.logo_path}` : "/storage/logos/default-logo.png"}
            alt={`${company.brand_name} logo`}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/storage/logos/default-logo.png";
            }}
          />
          <AvatarFallback className="text-3xl">
            {getInitials(company.brand_name || company.company_name)}
          </AvatarFallback>
        </Avatar>
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold mb-2">{company.brand_name || company.company_name}</h1>
          {company.company_website && (
            <a 
              href={company.company_website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {company.company_website}
            </a>
          )}
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Basic Information and Company Background side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Basic Information */}
          <section className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Basic Information</h2>
            {renderTable([
              { key: "description", label: "Description", value: company.description },
              { key: "year_founded", label: "Year Founded", value: company.year_founded },
              { key: "num_franchise_locations", label: "Number of Franchise Locations", value: company.num_franchise_locations },
              { key: "city", label: "City", value: company.city },
              { key: "state_province", label: "State/Province", value: company.state_province },
              { key: "zip_code", label: "Zip Code", value: company.zip_code },
              { key: "country", label: "Country", value: company.country },
            ])}
          </section>

          {/* Company Background */}
          <section className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Company Background</h2>
            {renderTable([
              { key: "industry_sector", label: "Industry Sector", value: company.background?.industry_sector },
              { key: "years_in_operation", label: "Years in Operation", value: company.background?.years_in_operation },
              { key: "total_revenue", label: "Total Revenue", value: company.background?.total_revenue, format: "currency" },
              { key: "awards", label: "Awards", value: company.background?.awards },
              { key: "company_history", label: "Company History", value: company.background?.company_history },
            ])}
          </section>
        </div>

        {/* Franchise Opportunity and Requirements side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <details className="bg-card rounded-lg border">
            <summary className="cursor-pointer p-6 text-xl font-semibold hover:bg-muted/50 transition-colors">Franchise Opportunity</summary>
            <div className="p-6 pt-0">
              {renderTable([
                { key: "franchise_type", label: "Franchise Type", value: company.opportunity?.franchise_type },
                { key: "min_investment", label: "Minimum Investment", value: company.opportunity?.min_investment, format: "currency" },
                { key: "franchise_fee", label: "Franchise Fee", value: company.opportunity?.franchise_fee, format: "currency" },
                { key: "royalty_fee_structure", label: "Royalty Fee Structure", value: company.opportunity?.royalty_fee_structure },
                { key: "avg_annual_revenue", label: "Average Annual Revenue", value: company.opportunity?.avg_annual_revenue, format: "currency" },
                { key: "target_markets", label: "Target Markets", value: company.opportunity?.target_markets },
                { key: "training_support", label: "Training Support", value: company.opportunity?.training_support },
                { key: "franchise_term", label: "Franchise Term", value: company.opportunity?.franchise_term },
                { key: "unique_selling_points", label: "Unique Selling Points", value: company.opportunity?.unique_selling_points },
              ])}
            </div>
          </details>

          <details className="bg-card rounded-lg border">
            <summary className="cursor-pointer p-6 text-xl font-semibold hover:bg-muted/50 transition-colors">Requirements</summary>
            <div className="p-6 pt-0">
              {renderTable([
                { key: "min_net_worth", label: "Minimum Net Worth", value: company.requirements?.min_net_worth, format: "currency" },
                { key: "min_liquid_assets", label: "Minimum Liquid Assets", value: company.requirements?.min_liquid_assets, format: "currency" },
                { key: "prior_experience", label: "Prior Experience", value: company.requirements?.prior_experience ? 'Yes' : 'No' },
                { key: "experience_type", label: "Experience Type", value: company.requirements?.experience_type },
                { key: "other_qualifications", label: "Other Qualifications", value: company.requirements?.other_qualifications },
              ])}
            </div>
          </details>
        </div>

        {/* Marketing Information and Contact Information side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <details className="bg-card rounded-lg border">
            <summary className="cursor-pointer p-6 text-xl font-semibold hover:bg-muted/50 transition-colors">Marketing Information</summary>
            <div className="p-6 pt-0">
              {renderTable([
                { key: "listing_title", label: "Listing Title", value: company.marketing?.listing_title },
                { key: "listing_description", label: "Listing Description", value: company.marketing?.listing_description },
                { key: "target_profile", label: "Target Profile", value: company.marketing?.target_profile },
                { key: "preferred_contact_method", label: "Preferred Contact Method", value: company.marketing?.preferred_contact_method },
              ])}
            </div>
          </details>

          <details className="bg-card rounded-lg border">
            <summary className="cursor-pointer p-6 text-xl font-semibold hover:bg-muted/50 transition-colors">Contact Information</summary>
            <div className="p-6 pt-0">
              {renderTable([
                { key: "contact_name", label: "Contact Name", value: `${company.user?.first_name} ${company.user?.last_name}` },
                { key: "email", label: "Email", value: company.user?.email },
              ])}
            </div>
          </details>
        </div>
      </div>
    </>
  );
};

export default CompanyFullDetails;
