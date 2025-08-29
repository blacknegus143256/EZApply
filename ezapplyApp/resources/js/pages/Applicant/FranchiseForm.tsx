import { useState, useEffect } from "react";
import axios from "axios";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { Head, usePage } from "@inertiajs/react";

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Franchise Application", href: "/applicant/franchise" },
];

interface Company {
  id: number;
  name: string;
  industry: string;
  investment_required: number;
}
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

  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<number[]>([]);

  useEffect(() => {
    const savedData = localStorage.getItem("franchiseForm");
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  useEffect(() => {
    axios
      .get("/api/companies")
      .then((res) => setCompanies(res.data))
      .catch((err) => console.error(err));
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
const handleSave = async () => {
  try {
    const payload = {
      net_worth: formData.net_worth || null,
      liquid_assets: formData.liquid_assets || null,
      source_of_funds: formData.source_of_funds || null,
      annual_income: formData.annual_income || null,
      investment_budget: formData.investment_budget || null,
      location: formData.location || null,
      franchise_type: formData.franchise_type || null,
      timeline: formData.timeline || null,
      interested_companies: selectedCompanies,
    };

    await axios.post("/franchise-information", payload);

    alert("Franchise information saved successfully!");
    localStorage.removeItem("franchiseForm");
  } catch (err) {
    console.error(err);
    alert("Failed to save franchise information.");
  }
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Form */}
          {formVisible && (
            <div>
              {/* Tabs */}
              <div className="flex gap-4 mb-4 border-b">
                <button
                  onClick={() => setCurrentTab("financial")}
                  className={`pb-2 ${
                    currentTab === "financial"
                      ? "border-b-2 border-blue-600 font-semibold"
                      : "text-gray-500"
                  }`}
                >
                  Financial Info
                </button>
                <button
                  onClick={() => setCurrentTab("interest")}
                  className={`pb-2 ${
                    currentTab === "interest"
                      ? "border-b-2 border-blue-600 font-semibold"
                      : "text-gray-500"
                  }`}
                >
                  Interest Info
                </button>
              </div>

              {currentTab === "financial" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium">Net Worth</label>
                    <input
                      name="net_worth"
                      value={formData.net_worth}
                      onChange={handleChange}
                      type="number"
                      className="mt-1 block w-full rounded-lg border px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Liquid Assets</label>
                    <input
                      name="liquid_assets"
                      value={formData.liquid_assets}
                      onChange={handleChange}
                      type="number"
                      className="mt-1 block w-full rounded-lg border px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Source of Funds</label>
                    <input
                      name="source_of_funds"
                      value={formData.source_of_funds}
                      onChange={handleChange}
                      type="text"
                      className="mt-1 block w-full rounded-lg border px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Annual Income</label>
                    <input
                      name="annual_income"
                      value={formData.annual_income}
                      onChange={handleChange}
                      type="number"
                      className="mt-1 block w-full rounded-lg border px-3 py-2"
                    />
                  </div>
                  <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 transition"
                  >
                    Save
                  </button>
                </div>
                </div>
              )}

              {currentTab === "interest" && (
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
                    <label className="block text-sm font-medium">Franchise Type / Brand</label>
                    <select
                      name="franchise_type"
                      value={formData.franchise_type}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border px-3 py-2"
                    >
                      <option value="">-- Select Type --</option>
                      <option value="food">Food</option>
                      <option value="service">Service</option>
                      <option value="retail">Retail</option>
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
                  <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 transition"
                  >
                    Save
                  </button>
                </div>
                </div>
                
              )}
            </div>
          )}

          {/* Right Column: Available Companies */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Available Companies</h2>
            {companies.length === 0 ? (
              <p className="text-sm text-gray-500">No companies available.</p>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto border rounded-lg p-3">
                {companies.map((company) => (
                  <label key={company.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedCompanies.includes(company.id)}
                      onChange={() => toggleCompanySelection(company.id)}
                    />
                    <span>
                      {company.name} — {company.industry} (₱
                      {company.investment_required.toLocaleString()})
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </AppLayout>
  );
};

export default FranchiseForm;
