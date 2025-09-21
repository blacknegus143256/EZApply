// resources/js/Pages/Company/CompanyEditWrapper.tsx
import { usePage } from '@inertiajs/react';
import FranchiseRegister from './FranchiseRegister';

export default function CompanyEditWrapper() {
  const { props } = usePage<{ company: any }>();
  const company = props.company || {};

  return (
    <FranchiseRegister
      initialData={{
        // Company Info
        company_name: company.company_name || '',
        brand_name: company.brand_name || '',
        city: company.city || '',
        state_province: company.state_province || '',
        zip_code: company.zip_code || '',
        country: company.country || '',
        company_website: company.company_website || '',
        description: company.description || '',
        year_founded: company.year_founded || '',
        num_franchise_locations: company.num_franchise_locations || '',

        // Opportunity
        franchise_type: company.opportunity?.franchise_type || '',
        min_investment: company.opportunity?.min_investment || '',
        franchise_fee: company.opportunity?.franchise_fee || '',
        royalty_fee_structure: company.opportunity?.royalty_fee_structure || '',
        avg_annual_revenue: company.opportunity?.avg_annual_revenue || '',
        target_markets: company.opportunity?.target_markets || '',
        training_support: company.opportunity?.training_support || '',
        franchise_term: company.opportunity?.franchise_term || '',
        unique_selling_points: company.opportunity?.unique_selling_points || '',

        // Background
        industry_sector: company.background?.industry_sector || '',
        years_in_operation: company.background?.years_in_operation || '',
        total_revenue: company.background?.total_revenue || '',
        awards: company.background?.awards || '',
        company_history: company.background?.company_history || '',

        // Requirements
        min_net_worth: company.requirements?.min_net_worth || '',
        min_liquid_assets: company.requirements?.min_liquid_assets || '',
        prior_experience: company.requirements?.prior_experience || false,
        experience_type: company.requirements?.experience_type || '',
        other_qualifications: company.requirements?.other_qualifications || '',

        // Marketing
        listing_title: company.marketing?.listing_title || '',
        listing_description: company.marketing?.listing_description || '',
        target_profile: company.marketing?.target_profile || '',
        preferred_contact_method: company.marketing?.preferred_contact_method || '',
        logo: null as File | null,

        // Optional uploads
        // dti_sbc: null,
        // bir_2303: null,
        // ipo_registration: null,
      }}
      companyId={company.id}
      // mode="edit" // can be used inside FranchiseRegister to differentiate between create & edit
    />
  );
}
