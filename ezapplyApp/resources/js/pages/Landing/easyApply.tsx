import React, { useState, useEffect } from 'react';
import '../../../css/easyApply.css';
import { Link } from '@inertiajs/react';



export default function EasyApplyLanding({ user }: { user?: any }) {
  const [companies, setCompanies] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [checked, setChecked] = useState<number[]>([]);
  const [type, setType] = useState('all');
  const [amount, setAmount] = useState('all');

  const handleCheck = (companyId: number) => {
    setChecked(prev => 
      prev.includes(companyId) 
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
    );
  };

  const isVerified =
    !!user && typeof user === 'object' && Object.keys(user).length > 0;

    useEffect(() => {
    fetch('/companies')
      .then((res) => res.json())
      .then((data) => setCompanies(data))
      .catch((err) => console.error('Error fetching companies:', err));
  }, []);

  // Start with all companies
let filtered = companies;

// Filter by type
if (type !== 'all') {
  filtered = filtered.filter((c) => c.franchise_type === type);
}

// Filter by investment amount
if (amount !== 'all') {
  filtered = filtered.filter((c) => {
    const value = parseInt(c.minimumInvestment?.replace(/[₱,~USD\s]/g, '') || '0', 10);
    if (amount === '10m') return value <= 10000000;
    if (amount === '35m') return value <= 35000000;
    if (amount === '1m') return value <= 1000000;
    return true;
  });
}

// Search filter
filtered = filtered.filter((c) =>
  (c.name ?? '').toLowerCase().includes(search.toLowerCase())
);
// const handleCheck = (id: number) => {
//   setChecked((prev) =>
//     prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
//   );
// };


  return (
    <div className="ezapply-landing">
      <nav className="ezapply-nav">
        <div className="ezapply-logo">EZApply</div>
        <div className="ezapply-navlinks">
          <div className="ezapply-navlink">Home</div>
          <div className="ezapply-navlink">Services</div>
          <div className="ezapply-navlink">About</div>
          <div className="ezapply-navlink">Contact</div>
        </div>
        <div className="ezapply-login-container">
          {!isVerified ? (
            <div>
              <Link
                href="/login"
                className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
              >
                Login
              </Link>{' '}
              <Link
                href="/register"
                className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
              >
                Register
              </Link>
            </div>
          ) : (
            <Link
              href="/dashboard"
              className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
            >
              Dashboard
            </Link>
          )}
        </div>
      </nav>

      
      <main className="ezapply-main-content">
        
        <div className="ezapply__filter-row">
          <div className="ezapply__filter-card">
            <h3 className="ezapply__filter-title">
              Looking for the right company to franchise?
            </h3>

            
            <div className="ezapply__filter-search">
              <label
                htmlFor="ezapply-search"
                className="ezapply__filter-label"
              >
                Search
              </label>
              <input
                id="ezapply-search"
                type="text"
                placeholder="Search companies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="ezapply__filter-input"
              />
            </div>

            
            <div className="ezapply__filters">
              
              <div>
                <label
                  htmlFor="ezapply-type"
                  className="ezapply__filter-label"
                >
                  Filter by Type
                </label>
                <select
                  id="ezapply-type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="ezapply__filter-select"
                  title="Select company type"
                >
                  <option value="all">All Types</option>
                  <option value="Food">Food</option>
                  <option value="Cafe">Cafe</option>
                  <option value="Drinks">Drinks</option>
                </select>
              </div>

              
              <div>
                <label
                  htmlFor="ezapply-amount"
                  className="ezapply__filter-label"
                >
                  Filter by Investment Amount
                </label>
                <select
                  id="ezapply-amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="ezapply__filter-select"
                  title="Filter by minimum investment"
                >
                  <option value="all">All Amounts</option>
                  <option value="10m">₱10,000,000+</option>
                  <option value="35m">₱35,000,000+</option>
                  <option value="1m">₱1,000,000+</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        
        <div className="ezapply__company-grid">
          {filtered.length === 0 ? (
            <div className="ezapply__no-companies">No companies found.</div>
          ) : (
            filtered.map((company) => (
              <div key={company.id} className="ezapply__company-card">
                <div className="ezapply__company-header">
                  <input
                    type="checkbox"
                    checked={checked.includes(company.id)}
                    onChange={() => handleCheck(company.id)}
                    className="ezapply__checkbox"
                    aria-label={`Select ${company.company_name}`}
                  />
                  <img
                    src={'/favicon.svg'}
                    alt={company.company_name + ' logo'}
                    className="ezapply__company-logo"
                  />
                  <span className="ezapply__company-name">
                    {company.company_name}
                  </span>
                </div>
                <div className="ezapply__company-details">
                  <p>
                    <strong>Brand:</strong> {company.brand_name}
                  </p>
                  <p>
                    <strong>Founded:</strong> {company.year_founded}
                  </p>
                  <p>
                    <strong>Headquarters:</strong> {company.hq_address}
                  </p>
                  <p>
                    <strong>Type:</strong> {company.opportunity.franchise_type}
                  </p>
                  <p>
                    <strong>Investment:</strong> {company.opportunity.min_investment}
                  </p>
                  <p>
                    <strong>Branches:</strong> {company.num_franchise_locations}
                  </p>
                  <p>
                    <strong>Description:</strong> {company.description}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <div className="ezapply__submit-row">
        <button
          type="button"
          className="ezapply-submit-btn mb-5"
          disabled={checked.length === 0}
          onClick={() =>
            alert(`Selected company IDs: ${checked.join(', ')}`)
          }
        >
          Submit Selected
        </button>
      </div>
    </div>
  );
}
