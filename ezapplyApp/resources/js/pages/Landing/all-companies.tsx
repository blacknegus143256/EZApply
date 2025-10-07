import React, { useState, useEffect } from 'react';
import "../../../css/AllCompanies.css";
import EzNav from './ezapply-nav';
import { usePage } from '@inertiajs/react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import CompanyDetailsModal from '@/components/CompanyDetailsModal';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, DollarSign, Building2 } from "lucide-react";

const formatInvestment = (amount?: number) => {
  if (amount == null || isNaN(amount)) return "N/A";
  try {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `₱${amount.toLocaleString()}`;
  }
};

const CompanyCard = ({
  company,
  checked,
  onCheck,
  onViewDetails,
}: {
  company: any;
  checked: boolean;
  onCheck: () => void;
  onViewDetails: (e: React.MouseEvent) => void;
}) => {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:-translate-y-1 bg-white/80 backdrop-blur-sm p-0">
      <CardHeader className="pb-4 px-4 pt-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 w-full">
            <Checkbox
              checked={checked}
              onCheckedChange={() => onCheck()}
              className="mt-1 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                {company.company_name}
              </CardTitle>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-4 pb-4 pt-0">
        <div className="grid grid-cols-1 gap-3 text-sm">
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {company.marketing?.listing_description ||
              company.description ||
              "No description available"}
          </p>

          <div className="flex items-center gap-3 text-gray-600">
            <div className="p-2 bg-blue-50 rounded-lg">
              <MapPin className="h-4 w-4 text-blue-600" />
            </div>
            <span className="truncate font-medium">
              {[company.city, company.state_province, company.country]
                .filter(Boolean)
                .join(", ") || "Location not specified"}
            </span>
          </div>

          {company.year_founded && (
            <div className="flex items-center gap-3 text-gray-600">
              <div className="p-2 bg-green-50 rounded-lg">
                <Calendar className="h-4 w-4 text-green-600" />
              </div>
              <span className="font-medium">Est. {company.year_founded}</span>
            </div>
          )}

          {company.opportunity?.min_investment !== undefined && (
            <div className="flex items-center gap-3 text-gray-600">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <DollarSign className="h-4 w-4 text-yellow-600" />
              </div>
              <span className="font-medium">
                From {formatInvestment(company.opportunity.min_investment)}
              </span>
            </div>
          )}

          {company.opportunity?.franchise_type && (
            <div className="flex items-center gap-3 text-gray-600">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Building2 className="h-4 w-4 text-purple-600" />
              </div>
              <span className="font-medium">
                {company.opportunity.franchise_type}
              </span>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-gray-100">
          <Button
            variant="outline"
            className="w-full group-hover:bg-blue-50 group-hover:border-blue-200 group-hover:text-blue-700 transition-all duration-200"
            onClick={onViewDetails}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const AllCompanies = ({ user }: { user?: any }) => {
  const [companies, setCompanies] = useState<any[]>([]);
  const [checked, setChecked] = useState<number[]>([]);

  const [filterType, setFilterType] = useState("All");
  const [filterCompanyName, setFilterCompanyName] = useState("");
  const [filterMinInvestment, setFilterMinInvestment] = useState("");
  const [filterMaxInvestment, setFilterMaxInvestment] = useState("");

  const [open, setOpen] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { auth } = usePage().props as any;
  const users = auth?.user;

  const handleViewDetails = (e: React.MouseEvent, company: any) => {
    e.preventDefault();
    if (!users) {
      setRedirectUrl(`/companies/${company.id}`);
      setOpen(true);
    } else {
      setSelectedCompany(company);
      setIsModalOpen(true);
    }
  };

  const handleDialogChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen && redirectUrl) {
      window.location.href = `/login?redirect=${encodeURIComponent(
        redirectUrl
      )}`;
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCompany(null);
  };

  useEffect(() => {
    fetch("/companies")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched companies:", data);
        setCompanies(data);
      })
      .catch((err) => console.error("Error fetching companies:", err));
  }, []);

  const handleCheck = (companyId: number) => {
    setChecked((prev) =>
      prev.includes(companyId)
        ? prev.filter((id) => id !== companyId)
        : [...prev, companyId]
    );
  };

  const franchiseTypes = [
    "All",
    ...new Set(
      companies.map((c) => c.opportunity?.franchise_type).filter(Boolean)
    ),
  ];

  // Filtering logic
  let filtered = companies.filter((c) => c.status === "approved");

  if (filterType !== "All") {
    filtered = filtered.filter(
      (c) => c.opportunity?.franchise_type === filterType
    );
  }

  if (filterCompanyName) {
    filtered = filtered.filter((c) =>
      (c.company_name ?? "")
        .toLowerCase()
        .includes(filterCompanyName.toLowerCase())
    );
  }

  if (filterMinInvestment) {
    filtered = filtered.filter((c) => {
      const value = c.opportunity?.min_investment || 0;
      return value >= parseInt(filterMinInvestment, 10);
    });
  }

  if (filterMaxInvestment) {
    filtered = filtered.filter((c) => {
      const value = c.opportunity?.min_investment || 0;
      return value <= parseInt(filterMaxInvestment, 10);
    });
  }

  const handleClearFilters = () => {
    setFilterType("All");
    setFilterCompanyName("");
    setFilterMinInvestment("");
    setFilterMaxInvestment("");
  };

  return (
    <>
      <EzNav user={users} />
      <div className="list-page">
        <div className="header-section">
          <div className="page-header">
            <h2>All Companies</h2>
            <p>Explore our diverse range of investments across various industries.</p>

            <div className="filter-section-container">
              <div className="filter-group">
                <label htmlFor="companyType">Type:</label>
                <select
                  id="companyType"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="filter-select"
                >
                  {franchiseTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="companyName">Company Name:</label>
                <input
                  type="text"
                  id="companyName"
                  placeholder="e.g., Jollibee"
                  value={filterCompanyName}
                  onChange={(e) => setFilterCompanyName(e.target.value)}
                  className="filter-input"
                />
              </div>

              <div className="filter-group">
                <label>Investment Amount:</label>
                <div className="investment-range">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filterMinInvestment}
                    onChange={(e) => setFilterMinInvestment(e.target.value)}
                    className="filter-input small"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filterMaxInvestment}
                    onChange={(e) => setFilterMaxInvestment(e.target.value)}
                    className="filter-input small"
                  />
                </div>
              </div>

              <button onClick={handleClearFilters} className="clear-filters-btn">
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        <div className="all-companies-page">
          <div className="company-list-container">
            {filtered.length === 0 ? (
              <div className="no-results">No companies found.</div>
            ) : (
              <div className="company-grid">
                {filtered.map((company) => (
                  <div key={company.id} className="company-card-wrapper">
                    <CompanyCard
                      company={company}
                      checked={checked.includes(company.id)}
                      onCheck={() => handleCheck(company.id)}
                      onViewDetails={(e) => handleViewDetails(e, company)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="ezapply__submit-row">
          <button
            type="button"
            className="ezapply-submit-btn"
            disabled={checked.length === 0}
            onClick={() => alert(`Selected company IDs: ${checked.join(", ")}`)}
          >
            Submit Selected
          </button>
        </div>
      </div>

      {/* Dialog modal */}
      <Dialog open={open} onOpenChange={handleDialogChange}>
        <DialogContent className="dialog-content">
          <DialogTitle>Please Log In</DialogTitle>
          <p>You must be logged in to view company details.</p>
        </DialogContent>
      </Dialog>

      {/* Company Details Modal */}
      <CompanyDetailsModal
        company={selectedCompany}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default AllCompanies;
