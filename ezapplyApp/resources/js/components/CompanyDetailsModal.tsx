import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge"

interface CompanyDetails {
  id: number;
  company_name: string;
  brand_name?: string;
  city?: string;
  state_province?: string;
  zip_code?: string;
  country?: string;
  company_website?: string;
  description?: string;
  year_founded?: number;
  num_franchise_locations?: number;
  status?: string;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  opportunity?: {
    franchise_type?: string;
    min_investment?: number;
    franchise_fee?: number;
    royalty_fee_structure?: string;
    avg_annual_revenue?: number;
    target_markets?: string;
    training_support?: string;
    franchise_term?: string;
    unique_selling_points?: string;
  };
  background?: {
    industry_sector?: string;
    years_in_operation?: number;
    total_revenue?: number;
    awards?: string;
    company_history?: string;
  };
  requirements?: {
    min_net_worth?: number;
    min_liquid_assets?: number;
    prior_experience?: boolean;
    experience_type?: string;
    other_qualifications?: string;
  };
  marketing?: {
    listing_title?: string;
    listing_description?: string;
    logo_path?: string;
    target_profile?: string;
    preferred_contact_method?: string;
  };
}

interface CompanyDetailsModalProps {
  company: CompanyDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CompanyDetailsModal({ company, isOpen, onClose }: CompanyDetailsModalProps) {
  if (!company) return null;


  const formatNumber = (num: number | undefined) => {
    if (!num) return 'Not specified';
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[85vw] max-w-[85vw] !max-w-[85vw] max-h-[95vh] overflow-y-auto">
        <DialogHeader className="relative">
          <DialogTitle className="text-2xl font-bold pr-8">
            {company.company_name}
            {company.brand_name && company.brand_name !== company.company_name && (
              <span className="text-lg text-gray-500 font-normal"> ({company.brand_name})</span>
            )}
          </DialogTitle>
          <DialogDescription className="text-base">
            {company.marketing?.listing_description || company.description || 'No description available.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="font-medium">Location:</span>
                <p className="text-sm text-gray-600">
                  {[company.city, company.state_province, company.country].filter(Boolean).join(', ') || 'Not specified'}
                </p>
              </div>
              
              <div className="space-y-1">
                <span className="font-medium">Website:</span>
                {company.company_website ? (
                  <a 
                    href={company.company_website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm block"
                  >
                    {company.company_website}
                  </a>
                ) : (
                  <span className="text-sm text-gray-500">Not specified</span>
                )}
              </div>

              <div className="space-y-1">
                <span className="font-medium">Founded:atay sayup description sa commit</span>
                <p className="text-sm text-gray-600">{company.year_founded || 'Not specified'}</p>
              </div>

              <div className="space-y-1">
                <span className="font-medium">Franchise Locations:</span>
                <p className="text-sm text-gray-600">{formatNumber(company.num_franchise_locations)}</p>
              </div>
            </div>
          </div>

          {/* Franchise Opportunity */}
          {company.opportunity && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Franchise Opportunity</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="font-medium">Min Investment:</span>
                  <p className="text-sm text-gray-600">{(company.opportunity.min_investment)}</p>
                </div>

                <div className="space-y-1">
                  <span className="font-medium">Franchise Fee:</span>
                  <p className="text-sm text-gray-600">{(company.opportunity.franchise_fee)}</p>
                </div>

                <div className="space-y-1">
                  <span className="font-medium">Avg Annual Revenue:</span>
                  <p className="text-sm text-gray-600">{(company.opportunity.avg_annual_revenue)}</p>
                </div>

                <div className="space-y-1">
                  <span className="font-medium">Franchise Type:</span>
                  <p className="text-sm text-gray-600">{company.opportunity.franchise_type || 'Not specified'}</p>
                </div>

                {company.opportunity.royalty_fee_structure && (
                  <div className="space-y-1 md:col-span-2">
                    <span className="font-medium">Royalty Fee Structure:</span>
                    <p className="text-sm text-gray-600">{company.opportunity.royalty_fee_structure}</p>
                  </div>
                )}

                {company.opportunity.target_markets && (
                  <div className="space-y-1 md:col-span-2">
                    <span className="font-medium">Target Markets:</span>
                    <p className="text-sm text-gray-600">{company.opportunity.target_markets}</p>
                  </div>
                )}

                {company.opportunity.unique_selling_points && (
                  <div className="space-y-1 md:col-span-2">
                    <span className="font-medium">Unique Selling Points:</span>
                    <p className="text-sm text-gray-600">{company.opportunity.unique_selling_points}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Company Background */}
          {company.background && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Company Background</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="font-medium">Industry Sector:</span>
                  <p className="text-sm text-gray-600">{company.background.industry_sector || 'Not specified'}</p>
                </div>

                <div className="space-y-1">
                  <span className="font-medium">Years in Operation:</span>
                  <p className="text-sm text-gray-600">{company.background.years_in_operation || 'Not specified'}</p>
                </div>

                <div className="space-y-1">
                  <span className="font-medium">Total Revenue:</span>
                  <p className="text-sm text-gray-600">{(company.background.total_revenue)}</p>
                </div>

                {company.background.awards && (
                  <div className="space-y-1 md:col-span-2">
                    <span className="font-medium">Awards:</span>
                    <p className="text-sm text-gray-600">{company.background.awards}</p>
                  </div>
                )}

                {company.background.company_history && (
                  <div className="space-y-1 md:col-span-2">
                    <span className="font-medium">Company History:</span>
                    <p className="text-sm text-gray-600">{company.background.company_history}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Requirements */}
          {company.requirements && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Requirements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="font-medium">Min Net Worth:</span>
                  <p className="text-sm text-gray-600">{(company.requirements.min_net_worth)}</p>
                </div>

                <div className="space-y-1">
                  <span className="font-medium">Min Liquid Assets:</span>
                  <p className="text-sm text-gray-600">{(company.requirements.min_liquid_assets)}</p>
                </div>

                <div className="space-y-1">
                  <span className="font-medium">Prior Experience Required:</span>
                  <Badge variant={company.requirements.prior_experience ? "default" : "secondary"}>
                    {company.requirements.prior_experience ? "Yes" : "No"}
                  </Badge>
                </div>

                {company.requirements.experience_type && (
                  <div className="space-y-1">
                    <span className="font-medium">Experience Type:</span>
                    <p className="text-sm text-gray-600">{company.requirements.experience_type}</p>
                  </div>
                )}

                {company.requirements.other_qualifications && (
                  <div className="space-y-1 md:col-span-2">
                    <span className="font-medium">Other Qualifications:</span>
                    <p className="text-sm text-gray-600">{company.requirements.other_qualifications}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contact Information */}
          {company.user && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Contact Information</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Contact Person:</span> {company.user.first_name} {company.user.last_name}</p>
                <p><span className="font-medium">Email:</span> {company.user.email}</p>
                {company.marketing?.preferred_contact_method && (
                  <p><span className="font-medium">Preferred Contact Method:</span> {company.marketing.preferred_contact_method}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
