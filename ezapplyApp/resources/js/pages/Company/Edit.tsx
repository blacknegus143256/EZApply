import FranchiseRegister from './FranchiseRegister';
import { usePage } from '@inertiajs/react';

export default function Edit() {
  const { props } = usePage<{ company: any }>(); 
  const company = props.company || {};
  // edit sa existing data
  return (
    <FranchiseRegister
      initialData={{
        company_name: company.company_name || '',
        brand_name: company.brand_name || '',
        city: company.city || '',
        state_province: company.state_province || '',
        zip_code: company.zip_code || '',
        country: company.country || '',
        company_website: company.company_website || null,
        description: company.description || '',
        year_founded: company.year_founded || '',
        num_franchise_locations: company.num_franchise_locations || '',

        franchise_type: company.opportunity?.franchise_type || '',
        min_investment: company.opportunity?.min_investment || '',
        franchise_fee: company.opportunity?.franchise_fee || '',
        royalty_fee: company.opportunity?.royalty_fee || '',
        avg_annual_revenue: company.opportunity?.avg_annual_revenue || '',
        target_markets: company.opportunity?.target_markets || '',
        training_support: company.opportunity?.training_support || null,
        franchise_term: company.opportunity?.franchise_term || '',
        unique_selling_points: company.opportunity?.unique_selling_points || null,

        industry_sector: company.background?.industry_sector || '',
        date_started: company.background?.date_started || '', // Renamed from years_in_operation
        total_revenue: company.background?.total_revenue || '',
        awards: company.background?.awards || null,
        company_history: company.background?.company_history || null,

        min_net_worth: company.requirements?.min_net_worth || '',
        min_liquid_assets: company.requirements?.min_liquid_assets || '',
        prior_experience: company.requirements?.prior_experience || false,
        experience_type: company.requirements?.experience_type || null,
        other_qualifications: company.requirements?.other_qualifications || null,

        listing_title: company.marketing?.listing_title || null,
        listing_description: company.marketing?.listing_description || null,
        logo: null,
        target_profile: company.marketing?.target_profile || null,
        preferred_contact_method: company.marketing?.preferred_contact_method || null,

        dti_sbc: null,
        bir_2303: null,
        ipo_registration: null,
      }}
      companyId={company.id}  
    />
  );
}
