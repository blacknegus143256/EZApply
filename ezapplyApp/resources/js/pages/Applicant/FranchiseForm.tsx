import { useState, useEffect } from "react";
import axios from "axios";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { Head, usePage } from "@inertiajs/react";
import PermissionGate from '@/components/PermissionGate';
import '../../../css/easyApply.css';

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Franchise Application", href: "/applicant/franchise" },
];


interface PageProps {
  auth: {
    user: {
      id: number;
      name: string;
      email: string;
      email_verified_at: string | null;
    };
  };
  [key: string]: unknown;
}

const FranchiseForm = () => {
  const { auth } = usePage<PageProps>().props;
  const url = usePage().url;

  const user = auth.user;

  const searchParams = new URLSearchParams(url.split("?")[1]);
  const initialTab = (searchParams.get("tab") as "financial" | "interest") || "financial";
  const [companies, setCompanies] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [checked, setChecked] = useState<number[]>([]);
  const [budget, setBudget] = useState<number | ''>('');
  const [type, setType] = useState('all');
  const [amount, setAmount] = useState('all');
  const [currentTab, setCurrentTab] = useState<"financial" | "interest">(initialTab);
  const [formVisible, setFormVisible] = useState(true); // toggle for collapse

  const [formData, setFormData] = useState({
    investment_budget: "",
    location: "",
    net_worth: "",
    liquid_assets: "",
    source_of_funds: "",
    annual_income: "",
    preferred_location: "",
    timeline: "",
    franchise_type: "",
  });

  const [selectedCompanies, setSelectedCompanies] = useState<number[]>([]);

  useEffect(() => {
    const savedData = localStorage.getItem("franchiseForm");
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const newData = { ...formData, [e.target.name]: e.target.value };
    setFormData(newData);
    localStorage.setItem("franchiseForm", JSON.stringify(newData));
  };

  const toggleCompanySelection = (id: number) => {
    setSelectedCompanies((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

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
  filtered = filtered.filter((c) => c.opportunity.franchise_type === type);
}
if (budget !== '') {
  filtered = filtered.filter((c) => {
    // Assuming c.opportunity.min_investment is a number
    return c.opportunity.min_investment <= budget;
  });
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

const franchiseTypes = Array.from(
  new Set(companies.map(c => c.opportunity.franchise_type).filter(Boolean))
);


  return (
    <PermissionGate permission="apply_for_franchises" fallback={<div className="p-6">You don't have permission to access franchise applications.</div>}>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Form */}
          {formVisible && (
            <div>
              {/* Tabs */}
              <div className="flex gap-4 mb-4 border-b">
                <h3
                  className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-4">
                  Interest Info
                </h3>
              </div>


                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium">Preferred Location</label>
                    <input
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      type="text"
                      className="mt-1 block w-full rounded-lg border px-3 py-2"
                    />
                  </div>
                  <div>
                <label className="block text-sm font-medium">Budget</label>
                <input
                  name="budget"
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value ? parseInt(e.target.value) : '')}
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
                  <div>
                    <label className="block text-sm font-medium">Timeline for Starting Franchise</label>
                    <input
                      name="timeline"
                      value={formData.timeline}
                      onChange={handleChange}
                      type="date"  
                      className="mt-1 block w-full rounded-lg border px-3 py-2"
                    />
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
        <div key={company.id} className="ezapply-company-card-small">
          <div className="ezapply-company-card-small-header">
            <input
              type="checkbox"
              checked={checked.includes(company.id)}
              onChange={() => handleCheck(company.id)}
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
              <strong>Type:</strong> {company.opportunity.franchise_type}
            </p>
            <p>
              <strong>Investment:</strong> {company.opportunity.min_investment}
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


          </div>
        </div>

      </AppLayout>
    </PermissionGate>
  );
};

export default FranchiseForm;
