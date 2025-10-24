import { useState, useEffect } from "react";
import axios from "axios";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { Head, usePage, router } from "@inertiajs/react";
import PermissionGate from '@/components/PermissionGate';
import CompanyDetailsModal from '@/components/CompanyDetailsModal';
import { useProfileStatus } from '@/hooks/useProfileStatus';
import '../../../css/easyApply.css';

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

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Franchise Application", href: "/applicant/franchise" },
];


type CompanyDetails = {
  id: number;
  company_name: string;
  brand_name: string;
  city?: string;
  state_province?: string;
  zip_code?: string;
  country?: string;
  company_website?: string;
  description?: string;
  year_founded?: number;
  num_franchise_locations?: number;
  status: string;
  minimumInvestment?: string;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  opportunity?: {
    franchise_type?: string;
    min_investment?: number;
    franchise_fee?: number;
    royalty_fee_structure?: string;
    avg_annual_revenue?: number;
    target_markets?: string;
    training_support?: string;
    franchise_term?: string;
    unique_selling_points?: string;
  };
  background?: {
    industry_sector?: string;
    years_in_operation?: number;
    total_revenue?: number;
    awards?: string;
    company_history?: string;
  };
  requirements?: {
    min_net_worth?: number;
    min_liquid_assets?: number;
    prior_experience?: boolean;
    experience_type?: string;
    other_qualifications?: string;
  };
  marketing?: {
    listing_title?: string;
    listing_description?: string;
    logo_path?: string;
    target_profile?: string;
    preferred_contact_method?: string;
  };
};

type Company = CompanyDetails;


const FranchiseForm = () => {
  const { props } = usePage();
  const companies: Company[] = Array.isArray((usePage().props as any).companies) ? (usePage().props as any).companies : [];

  const { isProfileComplete, hasAnyData } = useProfileStatus();
  
  // const [companies, setCompanies] = useState<Company[]>([]);
  const [anywhere, setAnywhere] = useState(false);
  const [anytime, setAnytime] = useState(false);
  const [bulkAnywhere, setBulkAnywhere] = useState(false);
  const [bulkAnytime, setBulkAnytime] = useState(false);
  
  const [showProfileIncompleteModal, setShowProfileIncompleteModal] = useState(false);

  const [search] = useState('');
  const [checked, setChecked] = useState<number[]>([]);
  const [budget, setBudget] = useState<number | ''>('');
  const [type, setType] = useState('all');
  const [applicationFilter, setApplicationFilter] = useState('all');
  const [applied, setApplied] = useState<number[]>([]);
  const [applying, setApplying] = useState<number | null>(null);
  const [applyModal, setApplyModal] = useState<{open: boolean; companyId: number | null; desired_location: string; deadline_date: string}>({ open: false, companyId: null, desired_location: '', deadline_date: '' });
  // Bulk apply modal
  const [bulkModal, setBulkModal] = useState<{open: boolean; desired_location: string; deadline_date: string}>({ open: false, desired_location: '', deadline_date: '' });
  // PSGC for per-card modal
  const [applyRegions, setApplyRegions] = useState<any[]>([]);
  const [applyProvinces, setApplyProvinces] = useState<any[]>([]);
  const [applyCities, setApplyCities] = useState<any[]>([]);
  const [applyBarangays, setApplyBarangays] = useState<any[]>([]);
  const [applyAddressCodes, setApplyAddressCodes] = useState<{
    region_code: string;
    region_name:string; 
    province_code: string;
    province_name:string; 
    citymun_code: string; 
    citymun_name:string;
    barangay_code: string;
    barangay_name:string;
  }
    >
    ({ region_code: '', region_name: '' ,  province_code: '', province_name: '' , citymun_code: '', citymun_name: '' , barangay_code: '', barangay_name: ''});
  // PSGC for bulk modal
  const [bulkRegions, setBulkRegions] = useState<any[]>([]);
  const [bulkProvinces, setBulkProvinces] = useState<any[]>([]);
  const [bulkCities, setBulkCities] = useState<any[]>([]);
  const [bulkBarangays, setBulkBarangays] = useState<any[]>([]);
  const [bulkAddressCodes, setBulkAddressCodes] = useState<{
    region_code: string; 
    region_name: string;
    province_code: string; 
    province_name:string;
    citymun_code: string;
    citymun_name:string; 
    barangay_code: string;
    barangay_name: string;
  }>({ 
    region_code: '', 
    province_code: '', 
    citymun_code: '', 
    barangay_code: '', 
    region_name: '', 
    province_name: '', 
    citymun_name: '', 
    barangay_name: '' 
  });

  const [selectedCompany, setSelectedCompany] = useState<CompanyDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  useEffect(() => {
    // Fetch companies

    // Fetch applied company IDs
    axios.get("/api/applied-company-ids")
    .then((res) => {
      setApplied(res.data);
    })
    .catch((err) => {
      console.error("Error fetching applied company IDs:", err);
    });
  }, []);

  // Load regions when modal opens
  useEffect(() => {
    if (applyModal.open && applyRegions.length === 0) {
      fetch('/psgc/regions')
        .then((res) => res.json())
        .then((data) => setApplyRegions(data))
        .catch(() => {});
    }
  }, [applyModal.open]);
  // Load regions for bulk modal
  useEffect(() => {
    if (bulkModal.open && bulkRegions.length === 0) {
      fetch('/psgc/regions')
        .then((res) => res.json())
        .then((data) => setBulkRegions(data))
        .catch(() => {});
    }
  }, [bulkModal.open]);
  useEffect(() => {
    const saved = localStorage.getItem("pendingApplications");
    if (saved) {
      const ids = JSON.parse(saved);
      if (Array.isArray(ids) && ids.length > 0) {
        setChecked(ids); // ✅ restore previously selected companies
        // Optionally open the apply modal immediately if profile now complete
        if (isProfileComplete) {
          localStorage.removeItem("pendingApplications"); // cleanup after resume
        }
      }
    }
  }, [isProfileComplete]);
  const onApplyRegionChange = (regionCode: string) => {
  const region = applyRegions.find((r) => r.code === regionCode);
    setApplyAddressCodes({
    region_code: regionCode,
    region_name: region?.name || '',
    province_code: '',
    province_name: '',
    citymun_code: '',
    citymun_name: '',
    barangay_code: '',
    barangay_name: '',
   });
    setApplyProvinces([]); setApplyCities([]); setApplyBarangays([]);
    if (regionCode) {
      fetch(`/psgc/regions/${regionCode}/provinces`).then(r => r.json()).then(setApplyProvinces).catch(() => {});
    }
  };
  const onApplyProvinceChange = (provinceCode: string) => {
    
  const province = applyProvinces.find((p) => p.code === provinceCode);
    setApplyAddressCodes((prev) => ({ 
      ...prev,
      province_code: provinceCode,
      province_name: province?.name || '',
      citymun_code: '',
      citymun_name: '',
      barangay_code: '',
      barangay_name: '',
    }));
    setApplyCities([]); setApplyBarangays([]);
    if (provinceCode) {
      fetch(`/psgc/provinces/${provinceCode}/cities-municipalities`).then(r => r.json()).then(setApplyCities).catch(() => {});
    }
  };
  const onApplyCityChange = (cityCode: string) => {
    const city = applyCities.find((c) => c.code === cityCode);
    setApplyAddressCodes((prev) => ({ 
      ...prev,
      citymun_code: cityCode,
      citymun_name: city?.name || '',
      barangay_code: '',
      barangay_name: '',
   }));
    setApplyBarangays([]);
    if (cityCode) {
      fetch(`/psgc/cities-municipalities/${cityCode}/barangays`).then(r => r.json()).then(setApplyBarangays).catch(() => {});
    }
  };
  const onApplyBarangayChange = (barangayCode: string) => {
    const barangay = applyBarangays.find((b) => b.code === barangayCode);
    setApplyAddressCodes((prev) => ({ ...prev, barangay_code: barangayCode, 
    barangay_name: barangay?.name || '', }));
  };

  // Bulk PSGC handlers
  const onBulkRegionChange = (regionCode: string) => {
  const region = applyRegions.find((r) => r.code === regionCode);
    setBulkAddressCodes({ 
    region_code: regionCode,
    region_name: region?.name || '',
    province_code: '',
    province_name: '', 
    citymun_code: '', 
    citymun_name: '', 
    barangay_code: '', 
    barangay_name: '' });
    setBulkProvinces([]); setBulkCities([]); setBulkBarangays([]);
    if (regionCode) fetch(`/psgc/regions/${regionCode}/provinces`).then(r=>r.json()).then(setBulkProvinces).catch(()=>{});
  };
  const onBulkProvinceChange = (provinceCode: string) => {
    const province = applyProvinces.find((p) => p.code === provinceCode);
    setBulkAddressCodes((prev) => ({ 
      ...prev, province_code: provinceCode, 
    province_name: province?.name || '',
    citymun_code: '', 
    citymun_name: '',
    barangay_code: '',  
    barangay_name: '', 
  }));
  
    setBulkCities([]); setBulkBarangays([]);
    if (provinceCode) fetch(`/psgc/provinces/${provinceCode}/cities-municipalities`).then(r=>r.json()).then(setBulkCities).catch(()=>{});
  };
  const onBulkCityChange = (cityCode: string) => {
  const city = applyCities.find((c) => c.code === cityCode);
    setBulkAddressCodes((prev) => ({ 
      ...prev,
    citymun_code: cityCode,
    citymun_name: city?.name || '',
    barangay_code: '',
    barangay_name: '', }));
    setBulkBarangays([]);
    if (cityCode) fetch(`/psgc/cities-municipalities/${cityCode}/barangays`).then(r=>r.json()).then(setBulkBarangays).catch(()=>{});
  };
  const onBulkBarangayChange = (barangayCode: string) => {
  const barangay = applyBarangays.find((b) => b.code === barangayCode);
    setBulkAddressCodes((prev) => ({ 
      ...prev,
       barangay_code: barangayCode,
      barangay_name: barangay?.name || '',
       }));
  };

  const handleCheck = (companyId: number) => {
    setChecked(prev => {
      
      const updated = prev.includes(companyId) 
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
            localStorage.setItem("pendingApplications", JSON.stringify(updated));
    return updated;
  });
  };

  const handleCompanyClick = (company: Company) => {
  if (!isProfileComplete) {
    setShowProfileIncompleteModal(true);
    return;
  }

  handleCheck(company.id);
};
// Start with all companies
let filtered = companies;

filtered = filtered.filter((c) => c.status === 'approved');

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

// Filter by application status
if (applicationFilter === 'applied') {
  filtered = filtered.filter((c) => applied.includes(c.id));
} else if (applicationFilter === 'not-applied') {
  filtered = filtered.filter((c) => !applied.includes(c.id));
}

// Search filter
filtered = filtered.filter((c) =>
  (c.company_name ?? '').toLowerCase().includes(search.toLowerCase())
);

const franchiseTypes = Array.from(
  new Set(companies.map(c => c.opportunity?.franchise_type).filter((t): t is string => Boolean(t)))
);

const handleApplySingle = (companyId: number, desired_location?: string, deadline_date?: string) => {
  if(!isProfileComplete){   alert("Please complete your customer profile before applying. Go to profile now?");
    router.get('/applicant/profile');
    return;
      }
      if (confirm("Are you sure you want to apply?")) {
      router.post(`/applicant/franchise/apply/${companyId}`);
    }
  if (applying !== null) return;
  setApplying(companyId);
  axios.post("/applicant/applications", { company_id: companyId, desired_location, deadline_date })
    .then(() => {
      setApplied((prev) => (prev.includes(companyId) ? prev : [...prev, companyId]));
      setApplyModal({ open: false, companyId: null, desired_location: '', deadline_date: '' });
    })
    .catch((err) => {
      console.error('Apply failed', err);
    })
    .finally(() => {
      setApplying(null);
    });
};

  const handleViewDetails = (e: React.MouseEvent, company: Company) => {
    e.preventDefault();
    setSelectedCompany(company);
    setIsModalOpen(true);
  };


  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCompany(null);
  };
  return (
    <PermissionGate permission="apply_for_franchises"  fallback={<div className="p-6">You don't have permission to access franchise applications.</div>}>
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Franchise Application" />

        <div className="p-6 bg-white dark:bg-neutral-900 rounded-xl shadow-md">
          <section className="hero">
        <h1 className="text-2xl font-bold text-white dark:text-neutral-100 mb-4">
          Looking for a Company to Franchise?
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium">Budget</label>
            <input
              name="budget"
              type="number"
              value={budget}
              onChange={(e) => {
                const value = e.target.value;
                setBudget(value === '' ? '' : Number(value))}}
              className="mt-1 block w-full rounded-lg border px-3 py-2 bg-white text-black"
              placeholder="Enter your budget"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Franchise Type / Category</label>
            <select
              id="ezapply-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="ezapply__filter-select w-full bg-white"
              title="Select company type"
            >
              <option value="all">All Types</option>
              {franchiseTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Application Status</label>
            <select
              value={applicationFilter}
              onChange={(e) => setApplicationFilter(e.target.value)}
              className="ezapply__filter-select w-full bg-white"
              title="Filter by application status"
            >
              <option value="all">All Companies</option>
              <option value="applied">Applied</option>
              <option value="not-applied">Not Applied</option>
            </select>
          </div>
        </div>
        {checked.length > 0 && (
          !isProfileComplete ? (
            <button
              type="button"
              onClick={() => setShowProfileIncompleteModal(true)}
              className="apply-selected-btn bg-yellow-500 text-white hover:bg-yellow-600"
            >
              Complete Profile to Apply Selected ({checked.length})
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setBulkModal({ open: true, desired_location: '', deadline_date: '' })}
              className="apply-selected-btn"
            >
              Apply Selected ({checked.length})
            </button>
          )
        )}
</section>
        
            
          <div className="all-companies-page">
            <div className="company-list-container">
            {filtered.length === 0 ? (
              <div className="ezapply__no-companies">No companies found.</div>
            ) : (    
            <div className="company-grid">            
              {filtered.map((company) => (
              
                  <div
                    key={company.id}
                    onClick={(e) => {
                      if (!(e.target as HTMLElement).closest('button')) {
                        handleCheck(company.id);
                      }
                    }}
                    className={`group hover:shadow-xl company-card relative transition-all duration-300 shadow-md bg-white/80 backdrop-blur-sm p-0 ${
                      applied.includes(company.id)
                        ? 'cursor-not-allowed applied-card'
                        : checked.includes(company.id)
                        ? 'cursor-pointer selected-card hover:-translate-y-2'
                        : 'cursor-pointer hover:-translate-y-1'
                    }`}>
                    {applied.includes(company.id) && (
                      <div className="applied-badge">
                        <span className="applied-text">✓ Applied</span>
                      </div>
                    )}
                    <div className="company-header">
                      <input
                        type="checkbox"
                        checked={checked.includes(company.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleCheck(company.id);
                        }}
                        disabled={applied.includes(company.id)}
                      />
                         <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
                          <img
                            src={
                              company.marketing?.logo_path
                                ? `/storage/${company.marketing.logo_path}`
                                : "/background/default-logo.png"
                            }
                            alt={`${company.company_name} logo`}
                            className="h-30 w-30 md:h-22 md:w-22 object-contain rounded-full border-4 border-white shadow-lg bg-gray-50 transition-transform duration-300 hover:scale-105"
                            loading="lazy"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = "/background/default-logo.png";
                            }}
                          />
                        </div>

                    </div>        
                                <div className="flex-1 min-w-0">
                                  <CardTitle className="text-xl font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                    {company.company_name}
                                  </CardTitle>
                                </div>
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

                    {/* <div className="company-details ">
                      
                      <span className="company-name pt-4 pb-4 px-4 text-center">{company.company_name}</span>
                      <p><strong>Brand:</strong> {company.brand_name}</p>
                      <p><strong>Founded:</strong> {company.year_founded}</p>
                      <p><strong>Type:</strong> {company.opportunity?.franchise_type}</p>
                      <p className="company-description"><strong>Description:</strong> {company.description}</p>
                    </div> */}
                  <Button variant="outline" size="sm"
                  className={`view-details-link  ${applied.includes(company.id) ? 'applied-link' : ''}`}
                      onClick={(e) => { e.stopPropagation(); handleViewDetails(e, company); }}>
                    View Details
                  </Button>
                    {/* <button
                      className={`view-details-link  ${applied.includes(company.id) ? 'applied-link' : ''}`}
                      onClick={(e) => handleViewDetails(e, company)}
                    >
                      View Details
                    </button> */}
                    <div className="flex flex-wrap gap-2 justify-center items-center">
                    {!isProfileComplete ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowProfileIncompleteModal(true);
                      }}
                      className="bg-yellow-500 text-white hover:bg-yellow-600"
                    >
                      Apply
                    </Button>
                    ) : !applied.includes(company.id) ? (
                    <Button variant="link" size="sm"
                      onClick={(e) => {
                        e.nativeEvent.stopImmediatePropagation();
                        setApplyModal({ open: true, companyId: company.id, desired_location: '', deadline_date: '' });
                      }}
                      disabled={applied.includes(company.id) || applying === company.id}
                      className={`apply-button rounded-md text-white transition ${applied.includes(company.id) ? 'applied' : (applying === company.id ? 'applying' : '')}`}
                    >
                      {applied.includes(company.id) ? 'Applied' : (applying === company.id ? 'Applying…' : 'Apply')}
                    </Button>
                     ) : (
                        <>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              setApplyModal({ open: true, companyId: company.id, desired_location: '', deadline_date: '' });
                            }}
                            className="apply-button applied bg-green-600 text-white px-4 py-2 rounded-md"
                          >
                            Applied
                          </Button>
                          <Button variant="destructive" size="sm"
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (confirm("Are you sure you want to cancel your application?")) {
                                try {
                                  await axios.delete(`/applicant/applications/${company.id}`);
                                  setApplied((prev) => prev.filter((id) => id !== company.id));
                                } catch (err) {
                                  console.error('Cancel application failed', err);
                                  alert('Failed to cancel application. Please try again.');
                                }
                              }
                            }}
                            className="cancel-button bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                          >
                            Cancel Apply
                          </Button>
                        </>
                        )}
                      </div>
                  </div>
                   ))}
                  </div>
               )}
          </div>
          
            

            {/* Apply modal */}
            {applyModal.open && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setApplyModal({ open: false, companyId: null, desired_location: '', deadline_date: '' })}>
                <div className="w-full max-w-md rounded-lg bg-white dark:bg-neutral-900 p-6" onClick={(e) => e.stopPropagation()}>
                  <h3 className="text-lg font-semibold mb-4">Additional Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Desired Location</label>
                        <label className="flex items-center gap-2 mb-2 text-sm">
                          <input
                            type="checkbox"
                            checked={anywhere}
                            onChange={(e) => {
                              setAnywhere(e.target.checked);
                              if (e.target.checked) {
                                setApplyAddressCodes({
                                  region_code: "",
                                  province_code: "",
                                  citymun_code: "",
                                  barangay_code: "",
                                  region_name: "",
                                  province_name: "",
                                  citymun_name: "",
                                  barangay_name: "",
                                });
                              }
                            }}
                          />
                          Anywhere
                        </label>
                   {!anywhere && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-neutral-500 mb-1">Region</label>
                          <select
                            className="w-full rounded-lg border px-3 py-2"
                            value={applyAddressCodes.region_code}
                            onChange={(e) => onApplyRegionChange(e.target.value)}
                          >
                            <option value="">Select Region</option>
                            {applyRegions.map((r: any) => (
                              <option key={r.code} value={r.code}>{r.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-neutral-500 mb-1">Province</label>
                          <select
                            className="w-full rounded-lg border px-3 py-2"
                            value={applyAddressCodes.province_code}
                            onChange={(e) => onApplyProvinceChange(e.target.value)}
                            disabled={!applyAddressCodes.region_code}
                          >
                            <option value="">Select Province</option>
                            {applyProvinces.map((p: any) => (
                              <option key={p.code} value={p.code}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-neutral-500 mb-1">City / Municipality</label>
                          <select
                            className="w-full rounded-lg border px-3 py-2"
                            value={applyAddressCodes.citymun_code}
                            onChange={(e) => onApplyCityChange(e.target.value)}
                            disabled={!applyAddressCodes.province_code}
                          >
                            <option value="">Select City/Municipality</option>
                            {applyCities.map((c: any) => (
                              <option key={c.code} value={c.code}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-neutral-500 mb-1">Barangay</label>
                          <select
                            className="w-full rounded-lg border px-3 py-2"
                            value={applyAddressCodes.barangay_code}
                            onChange={(e) => onApplyBarangayChange(e.target.value)}
                            disabled={!applyAddressCodes.citymun_code}
                          >
                            <option value="">Select Barangay</option>
                            {applyBarangays.map((b: any) => (
                              <option key={b.code} value={b.code}>{b.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                   )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Deadline Date</label>
                      <label className="flex items-center gap-2 mb-2 text-sm">
                        <input
                          type="checkbox"
                          checked={anytime}
                          onChange={(e) => {
                            setAnytime(e.target.checked);
                            if (e.target.checked) {
                              setApplyModal((s) => ({ ...s, deadline_date: "" }));
                            }
                          }}
                        />
                        Anytime
                      </label>
                {!anytime && (
                      <input
                        type="date"
                        className="mt-1 block w-full rounded-lg border px-3 py-2"
                        value={applyModal.deadline_date}
                        onChange={(e) => setApplyModal((s) => ({ ...s, deadline_date: e.target.value }))}
                      />
                )}
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end gap-2">
                    <button
                      className="px-4 py-2 rounded-md bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600"
                      onClick={() => setApplyModal({ open: false, companyId: null, desired_location: '', deadline_date: '' })}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                      onClick={() => {
                        if (applyModal.companyId) {
                          const { region_name, province_name, citymun_name, barangay_name } = applyAddressCodes;

                          const locationStr = [region_name, province_name, citymun_name, barangay_name].filter(Boolean).join(' - ');
                          handleApplySingle(applyModal.companyId, locationStr, applyModal.deadline_date);

                        }
                      }}
                    >
                      Confirm Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* Bulk Apply modal */}
            {bulkModal.open && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setBulkModal({ open: false, desired_location: '', deadline_date: '' })}>
                <div className="w-full max-w-md rounded-lg bg-white dark:bg-neutral-900 p-6" onClick={(e) => e.stopPropagation()}>
                  <h3 className="text-lg font-semibold mb-4">Apply to {checked.length} selected companies</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Desired Location</label>
                      <label className="flex items-center gap-2 mb-2 text-sm">
                          <input
                            type="checkbox"
                            checked={anywhere}
                            onChange={(e) => {
                              setAnywhere(e.target.checked);
                              if (e.target.checked) {
                                setBulkAddressCodes({
                                  region_code: "",
                                  province_code: "",
                                  citymun_code: "",
                                  barangay_code: "",
                                  region_name: "",
                                  province_name: "",
                                  citymun_name: "",
                                  barangay_name: "",
                                });
                              }
                            }}
                          />
                          Anywhere
                        </label>
                {!anywhere && (   
                        <div className="space-y-3">
                        <div>
                          
                          <label className="block text-xs text-neutral-500 mb-1">Region</label>
                          <select className="w-full rounded-lg border px-3 py-2" value={bulkAddressCodes.region_code} onChange={(e)=>onBulkRegionChange(e.target.value)}>
                            <option value="">Select Region</option>
                            {bulkRegions.map((r: any) => (<option key={r.code} value={r.code}>{r.name}</option>))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-neutral-500 mb-1">Province</label>
                          <select className="w-full rounded-lg border px-3 py-2" value={bulkAddressCodes.province_code} onChange={(e)=>onBulkProvinceChange(e.target.value)} disabled={!bulkAddressCodes.region_code}>
                            <option value="">Select Province</option>
                            {bulkProvinces.map((p: any) => (<option key={p.code} value={p.code}>{p.name}</option>))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-neutral-500 mb-1">City / Municipality</label>
                          <select className="w-full rounded-lg border px-3 py-2" value={bulkAddressCodes.citymun_code} onChange={(e)=>onBulkCityChange(e.target.value)} disabled={!bulkAddressCodes.province_code}>
                            <option value="">Select City/Municipality</option>
                            {bulkCities.map((c: any) => (<option key={c.code} value={c.code}>{c.name}</option>))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-neutral-500 mb-1">Barangay</label>
                          <select className="w-full rounded-lg border px-3 py-2" value={bulkAddressCodes.barangay_code} onChange={(e)=>onBulkBarangayChange(e.target.value)} disabled={!bulkAddressCodes.citymun_code}>
                            <option value="">Select Barangay</option>
                            {bulkBarangays.map((b: any) => (<option key={b.code} value={b.code}>{b.name}</option>))}
                          </select>
                        </div>
                      </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium">Deadline Date</label>
                      <label className="flex items-center gap-2 mb-2 text-sm">
                      <input
                        type="checkbox"
                        checked={anytime}
                        onChange={(e) => {
                          setAnytime(e.target.checked);
                          if (e.target.checked) {
                            setApplyModal((s) => ({ ...s, deadline_date: "" }));
                          }
                        }}
                      />
                      Anytime
                    </label>
                {!anytime && (
                      <input type="date" className="mt-1 block w-full rounded-lg border px-3 py-2" value={bulkModal.deadline_date} onChange={(e)=>setBulkModal((s)=>({...s, deadline_date: e.target.value}))} />
                      
                )}
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end gap-2">
                    <button className="px-4 py-2 rounded-md bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600" onClick={()=>setBulkModal({ open: false, desired_location: '', deadline_date: '' })}>Cancel</button>
                    <button className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700" onClick={()=>{
                      if (checked.length > 0) {
                        const { region_name, province_name, citymun_name, barangay_name } = bulkAddressCodes;
                        const locationStr = [region_name, province_name, citymun_name, barangay_name].filter(Boolean).join('-');
                        axios.post('/applicant/applications', { companyIds: checked, desired_location: locationStr, deadline_date: bulkModal.deadline_date })
                          .then(()=>{
                            setApplied((prev)=> Array.from(new Set([...prev, ...checked])));
                            setBulkModal({ open: false, desired_location: '', deadline_date: '' });
                          })
                          .catch((err)=>console.error('Bulk apply failed', err));
                      }
                    }}>Confirm Apply</button>
                  </div>
                </div>
              </div>
            )}
          </div>
                  {showProfileIncompleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-2 text-red-600">
                Incomplete Profile
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                You cannot apply yet because your profile is incomplete. You need to fill in your Basic Information (first name) and Financial Information (income source).
                Would you like to Fill it now?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowProfileIncompleteModal(false)}
                  className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-neutral-700 dark:hover:bg-neutral-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowProfileIncompleteModal(false);
                    router.get('/applicant/profile');
                  }}
                  className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                 Fill Up Profile
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
        <CompanyDetailsModal
          company={selectedCompany}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </AppLayout>
    </PermissionGate>
  );
};

export default FranchiseForm;
