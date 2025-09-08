import { useState, useEffect } from "react";
import axios from "axios";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { Head, router } from "@inertiajs/react";
import '../../../css/easyApply.css';

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Franchise Application", href: "/applicant/franchise" },
];
 type Company = {

  id: number;
  company_name: string;
  description?: string;
  opportunity: {
    franchise_type: string;
    min_investment: number;
  };
  minimumInvestment?: string;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
};

const FranchiseForm = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [search] = useState('');
  const [checked, setChecked] = useState<number[]>([]);
  const [budget, setBudget] = useState<number | ''>('');
  const [type, setType] = useState('all');
  const [formVisible, setFormVisible] = useState(true); // toggle for collapse

  useEffect(() => {
    axios.get("/companies")
    .then((res) => {
      setCompanies(res.data);
    })
    .catch((err) => {
      console.error("Error fetching companies:", err);
    });
  }, []);






  // Start with all companies
let filtered = companies;

// Filter by type
if (type !== 'all') {
  filtered = filtered.filter((c) => c.opportunity?.franchise_type === type);
}
if (budget !== '') {
  filtered = filtered.filter((c) => {
    // Assuming c.opportunity.min_investment is a number
    return (c.opportunity?.min_investment?? Infinity) <= budget;
  });
}

// Filter by investment amount

// Search filter
filtered = filtered.filter((c) =>
  (c.company_name ?? '').toLowerCase().includes(search.toLowerCase())
);
const franchiseTypes = Array.from(
  new Set(companies.map(c => c.opportunity?.franchise_type).filter((t): t is string => Boolean(t)))
);

const handleCheck = (id: number) => {
  setChecked((prev) =>
    prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
  );
};
const handleApply = () => { 
    router.visit("/applicant/franchise/appliedcompanies", {
      method: "get",
      data: { companyIds: checked},
      });
     };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Franchise Application" />
      <div className="p-6 bg-white dark:bg-neutral-900 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-4">
          Franchise Information Form
        </h1>

        {/* Toggle Button for Form */}
        <button
          onClick={() => setFormVisible((prev) => !prev)}
          className="mb-4 rounded-lg bg-gray-200 dark:bg-neutral-700 px-4 py-2 text-sm font-medium hover:bg-gray-300 dark:hover:bg-neutral-600 transition"
        >
          {formVisible ? "Hide Form" : "Show Form"}
        </button>

        <div  className={`grid gap-8 ${
    formVisible ? "grid-cols-1 lg:grid-cols-[auto_1fr]" : "grid-cols-1"
  }`}>
          {/* Left Column: Form */}
          {formVisible && (
            <div>
              {/* Tabs */}
              <div className="w-full max-w-md mb-6">
                <h3
                  className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-4">
                  Interest Info
                </h3>
              </div>


                <div className="space-y-4">
                  <div>
                <label className="block text-sm font-medium">Budget</label>
                <input
                  name="budget"
                  type="number"
                  value={budget}
                  onChange={(e) => {
                    const value = e.target.value;
                    setBudget(value === '' ? '' :Number(value))}}
                  className="mt-1 block w-full rounded-lg border px-3 py-2"
                  placeholder="Enter your budget"
                />
              </div>

                  <div>
                    <label className="block text-sm font-medium">Franchise Type / Category</label>
                    <select
                      id="ezapply-type"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="ezapply__filter-select"
                      title="Select company type"
                    >
                      <option value="all">All Types</option>
                      {franchiseTypes.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
                      
            </div>
          )}
            <main className="ezapply-main-content">
          <div className="ezapply-company-card-small-grid">
            {filtered.length === 0 ? (
              <div className="ezapply__no-companies">No companies found.</div>
            ) : (
              filtered.map((company) => (
                <div
                  key={company.id}
                  className={`ezapply-company-card-small cursor-pointer ${
                    checked.includes(company.id) ? "ring-3 ring-blue-500" : ""
                  }`}
                  onClick={() =>
                    setChecked((prev) =>
                      prev.includes(company.id)
                        ? prev.filter((id) => id !== company.id)
                        : [...prev, company.id]
                    )
                  }
                >
                  <div className="ezapply-company-card-small-header">
                    <input
                      type="checkbox"
                      checked={checked.includes(company.id)}
                      onChange={(e) => {
                        e.stopPropagation(); // prevent card click from firing twice
                        handleCheck(company.id);
                      }}
                      className="ezapply__checkbox"
                      aria-label={`Select ${company.company_name}`}
                    />
                    <img
                      src={"/favicon.svg"}
                      alt={company.company_name + " logo"}
                      className="ezapply__company-logo"
                    />
                    <span className="ezapply-company-card-small-name">
                      {company.company_name}
                    </span>
                  </div>
                  <div className="ezapply-company-card-small-details">
                    <p>
                      <strong>Type:</strong> {company.opportunity?.franchise_type ??  'N/A'}
                    </p>
                    <p>
                      <strong>Investment:</strong> {company.opportunity?.min_investment ??  'N/A'}
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


            <button
              onClick={() => {
              handleApply();
              }}
              className="fixed bottom-6 right-6 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 transition"
            >
              Apply
            </button>
          </div>
        </div>

    </AppLayout>
  );
};

export default FranchiseForm;
