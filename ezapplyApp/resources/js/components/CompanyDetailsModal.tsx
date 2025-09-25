import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import CompanySummaryCard from './CompanySummaryCard';
import CompanyFullDetails from '@/pages/Company/CompanyFullDetails';
import type { CompanyDetails } from '@/types/company';


interface CompanyDetailsModalProps {
  company: CompanyDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CompanyDetailsModal({ company, isOpen, onClose }: CompanyDetailsModalProps) {
  const [showFullDetails, setShowFullDetails] = useState(false);

  const handleMoreDetails = () => setShowFullDetails(true);
  const handleBackToSummary = () => setShowFullDetails(false);

  const formatNumber = (num: number | undefined) => {
    if (!num) return 'Not specified';
    return new Intl.NumberFormat('en-US').format(num);
  };

  useEffect(() => {
    if (isOpen) setShowFullDetails(false);
  }, [isOpen, company?.id]);

  if (!company) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        setShowFullDetails(false);
      }
    }}>
      <DialogContent className={`w-[95vw] ${showFullDetails ? 'max-w-6xl' : 'max-w-md'} max-h-[95vh] overflow-y-auto`}>
        {showFullDetails ? (
          <>
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
            <CompanyFullDetails company={company} onBack={handleBackToSummary} />
          </>
        ) : (
          <CompanySummaryCard company={company} onMoreDetails={handleMoreDetails} />
        )}
      </DialogContent>
    </Dialog>
  );
}
