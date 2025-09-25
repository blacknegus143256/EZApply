import React, { useState, useEffect } from "react";
import "../../../css/easyApply.css";
import { Link, usePage } from "@inertiajs/react";
import Services from "./services";
import About from "./about";
import EzNav from "./ezapply-nav";

export default function EasyApplyLanding({ user }: { user?: any }) {
  const [companies, setCompanies] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [checked, setChecked] = useState<number[]>([]);
  const [type, setType] = useState("all");
  const [amount, setAmount] = useState("all");
  const [visibleCount, setVisibleCount] = useState(5);

  

  const handleCheck = (companyId: number) => {
    setChecked((prev) =>
      prev.includes(companyId)
        ? prev.filter((id) => id !== companyId)
        : [...prev, companyId]
    );
  };


  useEffect(() => {
    fetch("/companies")
      .then((res) => res.json())
      .then((data) => setCompanies(data))
      .catch((err) => console.error("Error fetching companies:", err));
  }, []);

  // Extract franchise types dynamically
  const franchiseTypes = Array.from(
    new Set(companies.map((c) => c.opportunity?.franchise_type).filter(Boolean))
  );

  // Filtering logic
  let filtered = companies;
  
  filtered = filtered.filter((c) => c.status === "approved");

  if (type !== "all") {
    filtered = filtered.filter(
      (c) => c.opportunity?.franchise_type === type
    );
  }

  if (amount !== "all") {
    filtered = filtered.filter((c) => {
      const value = parseInt(
        c.opportunity?.minimum_investment
          ?.replace(/[₱,~USD\s]/g, "") || "0",
        10
      );
      if (amount === "10m") return value <= 10000000;
      if (amount === "35m") return value <= 35000000;
      if (amount === "1m") return value <= 1000000;
      return true;
    });
  }

  filtered = filtered.filter((c) =>
    (c.company_name ?? "").toLowerCase().includes(search.toLowerCase())
  );
  const { auth } = usePage().props as any;
    const users = auth?.user;
  return (
    <div className="ezapply-landing">
      {/* Hero Section */}
      <section className="hero">
        <h1 className="hero-title">
          Find Your Perfect <span>Franchise</span> Today with EZApply
        </h1>
        <p className="hero-subtitle">
          Browse trusted opportunities and grow your business with confidence.
        </p>
        <div className="hero-buttons">
          <a href="/list-companies" className="hero-btn primary" target="_blank">
            All companies list
          </a>
          <a href="#services" className="hero-btn secondary">
            Our Services
          </a>
        </div>

        {/* Filter Section */}
        <div className="ezapply__filter-row">
          <div className="ezapply__filter-card">
            <h3 className="ezapply__filter-title">
              Looking for the right company to franchise?
            </h3>

            <div className="ezapply__filter-search">
              <label htmlFor="ezapply-search" className="ezapply__filter-label">
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
                <label htmlFor="ezapply-type" className="ezapply__filter-label">
                  Filter by Type
                </label>
                <select
                  id="ezapply-type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="ezapply__filter-select"
                >
                  <option value="all">All Types</option>
                  {franchiseTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
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
      </section>

      <EzNav user={users} />

      {/* Main Section */}
      <main className="ezapply-main-content" id="companies">
        <div className="ezapply__company-grid-header mb-2">
          <h1 className="ezapply__section-title text-2xl font-bold mb-2 mt-5">
            Top Companies
          </h1>
        </div>

        <div className="ezapply__company-grid">
          {filtered.length === 0 ? (
            <div className="ezapply__no-companies">No companies found.</div>
          ) : (
            <>
              {filtered.slice(0, visibleCount).map((company) => (
                <div key={company.id} className="ezapply__company-card">
                  <div className="ezapply__company-header">
                    <input
                      type="checkbox"
                      checked={checked.includes(company.id)}
                      onChange={() => handleCheck(company.id)}
                      className="ezapply__checkbox"
                    />
                    <img
                      src={"/favicon.svg"}
                      alt={company.company_name + " logo"}
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
                      <strong>Type:</strong>{" "}
                      {company.opportunity?.franchise_type}
                    </p>
                    <p>
                      <strong>Description:</strong> {company.description}
                    </p>

                    <div className="ezapply__view-details">
                  <a href={`/companies/${company.id}`} className="view-details-link" onClick={(e) => {
                      if (!users) {
                        e.preventDefault();
                        alert("Please log in to view company details.");
                        return ('/login');
                      }
                    }}>
                    View Details
                  </a>
                  </div>
                  </div>
                </div>
              ))}

            </>
          )}
        </div>
        <Link className="ezapply-link-show-more" href={'/list-companies'}>
                Show more
              </Link>
      </main>

      {/* Submit */}
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

      {/* Services */}
      <Services />
      {/* About */}
      <About />

      {/* CTA */}
      <section className="cta-section">
        <h2>Ready to Start Your Franchise Journey?</h2>
        <p>Join hundreds of entrepreneurs finding success with EZApply.</p>
        <Link href="/register" className="cta-btn">
          Get Started
        </Link>
      </section>
    </div>
  );
}
