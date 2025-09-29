import React from 'react';
import { Button } from '@/components/ui/button';

// Type-only import for CompanyDetails from the centralized types file
import type { CompanyDetails } from '@/types/company';

type CompanySummaryCardProps = {
  company: CompanyDetails;
  onMoreDetails: () => void;
  className?: string; // Optional className prop for container flexibility
};

const CompanySummaryCard: React.FC<CompanySummaryCardProps> = ({ company, onMoreDetails, className }) => {
  const displayName = company.brand_name && company.brand_name !== company.company_name
    ? `${company.company_name} (${company.brand_name})`
    : company.company_name;

  const displayDescription = company.marketing?.listing_description || company.description || 'No description available';

  const displayLocation = [company.city, company.state_province, company.country]
    .filter(Boolean)
    .join(', ') || 'Location not specified';

  return (
    <div className={`w-full border rounded-lg shadow-sm p-4 ${className || ''}`}>
      <h2 className="text-lg font-semibold mb-2">{displayName}</h2>
      <p className="text-sm text-muted-foreground mb-4">{displayDescription}</p>
      <p className="text-sm text-muted-foreground mb-4">{displayLocation}</p>
      <Button variant="link" onClick={onMoreDetails} className="mt-2">
        More details
      </Button>
    </div>
  );
};

export default CompanySummaryCard;