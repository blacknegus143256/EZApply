import React, { useState, useEffect } from 'react';
import "../../../css/AllCompanies.css";
import EzNav from './ezapply-nav';

const AllCompanies = ({ user }: { user?: any }) => {
  const [companies, setCompanies] = useState<any[]>([]);
  const [checked, setChecked] = useState<number[]>([]);

  const [filterType, setFilterType] = useState('all');
  const [filterCompanyName, setFilterCompanyName] = useState('');
  const [filterMinInvestment, setFilterMinInvestment] = useState('');
  const [filterMaxInvestment, setFilterMaxInvestment] = useState('');

  useEffect(() => {
    fetch("/companies")
      .then((res) => res.json())
      .then((data) => setCompanies(data))
      .catch((err) => console.error("Error fetching companies:", err));
  }, []);

  const handleCheck = (companyId: number) => {
    setChecked((prev) =>
      prev.includes(companyId)
        ? prev.filter((id) => id !== companyId)
        : [...prev, companyId]
    );
  };

  const franchiseTypes = ['all', ...new Set(companies.map(c => c.opportunity?.franchise_type).filter(Boolean))];

  // Filtering logic
  let filtered = companies;

  if (filterType !== "all") {
    filtered = filtered.filter(
      (c) => c.opportunity?.franchise_type === filterType
    );
  }

  if (filterCompanyName) {
    filtered = filtered.filter((c) =>
      (c.company_name ?? "").toLowerCase().includes(filterCompanyName.toLowerCase())
    );
  }

  if (filterMinInvestment) {
    filtered = filtered.filter((c) => {
      const value = parseInt(
        c.opportunity?.minimum_investment?.replace(/[₱,~USD,\s]/g, "") || "0",
        10
      );
      return value >= parseInt(filterMinInvestment, 10);
    });
  }

  if (filterMaxInvestment) {
    filtered = filtered.filter((c) => {
      const value = parseInt(
        c.opportunity?.minimum_investment?.replace(/[₱,~USD,\s]/g, "") || "0",
        10
      );
      return value <= parseInt(filterMaxInvestment, 10);
    });
  }

  const handleClearFilters = () => {
    setFilterType('all');
    setFilterCompanyName('');
    setFilterMinInvestment('');
    setFilterMaxInvestment('');
  };

  return (
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
                  <h4><input
                      type="checkbox"
                      checked={checked.includes(company.id)}
                      onChange={() => handleCheck(company.id)}
                    /> {company.company_name}</h4>
                  <p><strong>Brand:</strong> {company.brand_name}</p>
                  <p><strong>Founded:</strong> {company.year_founded}</p>
                  <p><strong>Type:</strong> {company.opportunity?.franchise_type}</p>
                  <p><strong>Description:</strong> {company.description}</p>
                  
                    
                  
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllCompanies;
