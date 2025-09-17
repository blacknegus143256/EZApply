import React, { useState, useEffect } from 'react';
import "../../../css/AllCompanies.css";
import EzNav from './ezapply-nav';
import { usePage } from '@inertiajs/react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import CompanyDetailsModal from '@/components/CompanyDetailsModal';

const AllCompanies = ({ user }: { user?: any }) => {

  const [companies, setCompanies] = useState<any[]>([]);
  const [checked, setChecked] = useState<number[]>([]);

  const [filterType, setFilterType] = useState('All');
  const [filterCompanyName, setFilterCompanyName] = useState('');
  const [filterMinInvestment, setFilterMinInvestment] = useState('');
  const [filterMaxInvestment, setFilterMaxInvestment] = useState('');

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
      window.location.href = `/login?redirect=${encodeURIComponent(redirectUrl)}`;
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

  const franchiseTypes = ['All', ...new Set(companies.map(c => c.opportunity?.franchise_type).filter(Boolean))];

  // Filtering logic
  let filtered = companies;
  console.log("Initial companies count:", companies.length);

  // Show all companies - no status filtering for public listing

  if (filterType !== "All") {
    filtered = filtered.filter(
      (c) => c.opportunity?.franchise_type === filterType
    );
    console.log("After type filter:", filtered.length);
  }

  if (filterCompanyName) {
    filtered = filtered.filter((c) =>
      (c.company_name ?? "").toLowerCase().includes(filterCompanyName.toLowerCase())
    );
    console.log("After name filter:", filtered.length);
  }

  if (filterMinInvestment) {
    filtered = filtered.filter((c) => {
      const value = c.opportunity?.min_investment || 0;
      return value >= parseInt(filterMinInvestment, 10);
    });
    console.log("After min investment filter:", filtered.length);
  }

  if (filterMaxInvestment) {
    filtered = filtered.filter((c) => {
      const value = c.opportunity?.min_investment || 0;
      return value <= parseInt(filterMaxInvestment, 10);
    });
    console.log("After max investment filter:", filtered.length);
  }

  console.log("Final filtered count:", filtered.length);

  const handleClearFilters = () => {
    setFilterType('All');
    setFilterCompanyName('');
    setFilterMinInvestment('');
    setFilterMaxInvestment('');
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
                    <option key={type} value={type}>{type}</option>
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
                  <div key={company.id} className="company-card">
                    <div className="company-header">
                      <input
                        type="checkbox"
                        checked={checked.includes(company.id)}
                        onChange={() => handleCheck(company.id)}
                      />
                      <img
                        src={"/favicon.svg"}
                        alt={company.company_name + " logo"}
                        className="ezapply__company-logo"
                      />
                      <span className="company-name">{company.company_name}</span>
                    </div>

                    <p><strong>Brand:</strong> {company.brand_name}</p>
                    <p><strong>Founded:</strong> {company.year_founded}</p>
                    <p><strong>Type:</strong> {company.opportunity?.franchise_type}</p>
                    <p><strong>Description:</strong> {company.description}</p>

                    <button
                      className="view-details-link"
                      onClick={(e) => handleViewDetails(e, company)}
                    >
                      View Details
                    </button>
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
