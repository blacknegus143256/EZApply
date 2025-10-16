import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
        <tr key={key} className="border-b">
          <td className="font-medium py-2 pr-4 align-top">{label}</td>
          <td className="py-2 pr-4 align-top">
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

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Company Details" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            {renderTable([
              { key: "brand_name", label: "Brand Name", value: company.brand_name },
              { key: "city", label: "City", value: company.city },
              { key: "state_province", label: "State/Province", value: company.state_province },
              { key: "zip_code", label: "Zip Code", value: company.zip_code },
              { key: "country", label: "Country", value: company.country },
              { key: "company_website", label: "Website", value: <a href={company.company_website} target="_blank" rel="noopener noreferrer">{company.company_website}</a> },
              { key: "description", label: "Description", value: company.description },
              { key: "year_founded", label: "Year Founded", value: company.year_founded },
              { key: "num_franchise_locations", label: "Number of Franchise Locations", value: company.num_franchise_locations },
            ])}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Franchise Opportunity</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Company Background</CardTitle>
          </CardHeader>
          <CardContent>
            {renderTable([
              { key: "industry_sector", label: "Industry Sector", value: company.background?.industry_sector },
              { key: "years_in_operation", label: "Years in Operation", value: company.background?.years_in_operation },
              { key: "total_revenue", label: "Total Revenue", value: company.background?.total_revenue, format: "currency" },
              { key: "awards", label: "Awards", value: company.background?.awards },
              { key: "company_history", label: "Company History", value: company.background?.company_history },
            ])}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            {renderTable([
              { key: "min_net_worth", label: "Minimum Net Worth", value: company.requirements?.min_net_worth, format: "currency" },
              { key: "min_liquid_assets", label: "Minimum Liquid Assets", value: company.requirements?.min_liquid_assets, format: "currency" },
              { key: "prior_experience", label: "Prior Experience", value: company.requirements?.prior_experience ? 'Yes' : 'No' },
              { key: "experience_type", label: "Experience Type", value: company.requirements?.experience_type },
              { key: "other_qualifications", label: "Other Qualifications", value: company.requirements?.other_qualifications },
            ])}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Marketing Information</CardTitle>
          </CardHeader>
          <CardContent>
            {renderTable([
              { key: "listing_title", label: "Listing Title", value: company.marketing?.listing_title },
              { key: "listing_description", label: "Listing Description", value: company.marketing?.listing_description },
              { key: "target_profile", label: "Target Profile", value: company.marketing?.target_profile },
              { key: "preferred_contact_method", label: "Preferred Contact Method", value: company.marketing?.preferred_contact_method },
            ])}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            {renderTable([
              { key: "contact_name", label: "Contact Name", value: `${company.user?.first_name} ${company.user?.last_name}` },
              { key: "email", label: "Email", value: company.user?.email },
            ])}
          </CardContent>
        </Card>

      </div>
    </AppLayout>
  );
};

export default CompanyFullDetails;
