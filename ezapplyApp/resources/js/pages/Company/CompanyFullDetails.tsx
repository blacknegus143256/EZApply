import React from 'react';
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

interface CompanyFullDetailsProps {
  company: CompanyDetails;
  onBack: () => void;
}

const CompanyFullDetails: React.FC<CompanyFullDetailsProps> = ({ company, onBack }) => {
  return (
    <div className="p-6 bg-white dark:bg-neutral-900 rounded-xl shadow-md">
      <button onClick={onBack} className="text-blue-600 hover:underline mb-4">Back to Summary</button>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Basic Information</h2>
        <p><strong>Brand Name:</strong> {company.brand_name}</p>
        <p><strong>City:</strong> {company.city}</p>
        <p><strong>State/Province:</strong> {company.state_province}</p>
        <p><strong>Zip Code:</strong> {company.zip_code}</p>
        <p><strong>Country:</strong> {company.country}</p>
        <p><strong>Website:</strong> <a href={company.company_website} target="_blank" rel="noopener noreferrer">{company.company_website}</a></p>
        <p><strong>Description:</strong> {company.description}</p>
        <p><strong>Year Founded:</strong> {company.year_founded}</p>
        <p><strong>Number of Franchise Locations:</strong> {company.num_franchise_locations}</p>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Franchise Opportunity</h2>
        <p><strong>Franchise Type:</strong> {company.opportunity?.franchise_type}</p>
        <p><strong>Minimum Investment:</strong> {company.opportunity?.min_investment != null ? formatValue(company.opportunity.min_investment, "currency") : 'Not specified'}</p>
        <p><strong>Franchise Fee:</strong> {company.opportunity?.franchise_fee != null ? formatValue(company.opportunity.franchise_fee, "currency") : 'Not specified'}</p>
        <p><strong>Royalty Fee Structure:</strong> {company.opportunity?.royalty_fee_structure}</p>
        <p><strong>Average Annual Revenue:</strong> {company.opportunity?.avg_annual_revenue != null ? formatValue(company.opportunity.avg_annual_revenue, "currency") : 'Not specified'}</p>
        <p><strong>Target Markets:</strong> {company.opportunity?.target_markets}</p>
        <p><strong>Training Support:</strong> {company.opportunity?.training_support}</p>
        <p><strong>Franchise Term:</strong> {company.opportunity?.franchise_term}</p>
        <p><strong>Unique Selling Points:</strong> {company.opportunity?.unique_selling_points}</p>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Company Background</h2>
        <p><strong>Industry Sector:</strong> {company.background?.industry_sector}</p>
        <p><strong>Years in Operation:</strong> {company.background?.years_in_operation}</p>
        <p><strong>Total Revenue:</strong> {formatValue(company.background?.total_revenue || 0, "currency")}</p>
        <p><strong>Awards:</strong> {company.background?.awards}</p>
        <p><strong>Company History:</strong> {company.background?.company_history}</p>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Requirements</h2>
        <p><strong>Minimum Net Worth:</strong> {company.requirements?.min_net_worth != null ? formatValue(company.requirements.min_net_worth, "currency") : 'Not specified'}</p>
        <p><strong>Minimum Liquid Assets:</strong> {company.requirements?.min_liquid_assets != null ? formatValue(company.requirements.min_liquid_assets, "currency") : 'Not specified'}</p>
        <p><strong>Prior Experience:</strong> {company.requirements?.prior_experience ? 'Yes' : 'No'}</p>
        <p><strong>Experience Type:</strong> {company.requirements?.experience_type}</p>
        <p><strong>Other Qualifications:</strong> {company.requirements?.other_qualifications}</p>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Marketing Information</h2>
        <p><strong>Listing Title:</strong> {company.marketing?.listing_title}</p>
        <p><strong>Listing Description:</strong> {company.marketing?.listing_description}</p>
        <p><strong>Target Profile:</strong> {company.marketing?.target_profile}</p>
        <p><strong>Preferred Contact Method:</strong> {company.marketing?.preferred_contact_method}</p>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Contact Information</h2>
        <p><strong>Contact Name:</strong> {company.user?.first_name} {company.user?.last_name}</p>
        <p><strong>Email:</strong> {company.user?.email}</p>
      </section>
    </div>
  );
};

export default CompanyFullDetails;
