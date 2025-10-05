import { useState, useRef } from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import PermissionGate from '@/components/PermissionGate';
import AddressForm from '@/components/AddressForm';

// Steps definition
export const STEPS = [
  'Company Info',
  'Opportunity', 
  'Background',
  'Requirements',
  'Marketing / Listing',
  'Documents',
];

// Breadcrumbs
const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: dashboard(),
  },
];

// Update CompanyForm to remove duplicates and ensure all fields are strictly typed
interface CompanyForm {
  company_name: string;
  brand_name: string;
  region_code: string;
  region_name: string;
  province_code: string;
  province_name: string;
  citymun_code: string;
  citymun_name: string;
  barangay_code: string;
  barangay_name: string;
  postal_code: string;
  country: string;
  city: string;
  state_province: string;
  zip_code: string;
  company_website: string;

  description: string;
  year_founded: string | null;
  num_franchise_locations: string | null;

  franchise_type: string;
  min_investment: string | null;
  franchise_fee: string | null;
  royalty_fee_structure: string;
  avg_annual_revenue: string | null;
  target_markets: string;
  training_support: string;
  franchise_term: string;
  unique_selling_points: string;

  industry_sector: string;
  years_in_operation: string | null;
  total_revenue: string | null;
  awards: string;
  company_history: string;

  min_net_worth: string | null;
  min_liquid_assets: string | null;
  prior_experience: boolean;
  experience_type: string;
  other_qualifications: string;

  listing_title: string;
  listing_description: string;

  target_profile: string;
  logo: File | null;
  preferred_contact_method: string;
  dti_sbc: File | null;
  bir_2303: File | null;
  ipo_registration: File | null;
}



function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-xs text-black">
      {label}
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className = '', ...rest } = props;
  return (
    <input
      {...rest}
      className={`w-full rounded-md border border-gray-700 bg-gray-800 p-2 text-gray-100 ${className}`}
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = '', ...rest } = props;
  return (
    <textarea
      {...rest}
      className={`w-full rounded-md border border-gray-700 bg-gray-800 p-2 text-gray-100 ${className}`}
    />
  );
}

function ErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-400">{message}</p>;
}

// Ensure hydrateAddressData outputs strictly string values
function hydrateAddressData(initialData: Partial<CompanyForm>): CompanyForm {
  return {
    company_name: initialData.company_name || '',
    brand_name: initialData.brand_name || '',
    region_code: initialData.region_code || '',
    region_name: initialData.region_name || '',
    province_code: initialData.province_code || '',
    province_name: initialData.province_name || '',
    citymun_code: initialData.citymun_code || '',
    citymun_name: initialData.citymun_name || '',
    barangay_code: initialData.barangay_code || '',
    barangay_name: initialData.barangay_name || '',
    postal_code: initialData.postal_code || '',
    country: initialData.country || 'Philippines',
    city: initialData.city || '',
    state_province: initialData.state_province || '',
    zip_code: initialData.zip_code || '',
    company_website: initialData.company_website || '',

    description: initialData.description || '',
    year_founded: initialData.year_founded || '',
    num_franchise_locations: initialData.num_franchise_locations || '',

    franchise_type: initialData.franchise_type || '',
    min_investment: initialData.min_investment || '',
    franchise_fee: initialData.franchise_fee || '',
    royalty_fee_structure: initialData.royalty_fee_structure || '',
    avg_annual_revenue: initialData.avg_annual_revenue || '',
    target_markets: initialData.target_markets || '',
    training_support: initialData.training_support || '',
    franchise_term: initialData.franchise_term || '',
    unique_selling_points: initialData.unique_selling_points || '',

    industry_sector: initialData.industry_sector || '',
    years_in_operation: initialData.years_in_operation || '',
    total_revenue: initialData.total_revenue || '',
    awards: initialData.awards || '',
    company_history: initialData.company_history || '',

    min_net_worth: initialData.min_net_worth || '',
    min_liquid_assets: initialData.min_liquid_assets || '',
    prior_experience: initialData.prior_experience || false,
    experience_type: initialData.experience_type || '',
    other_qualifications: initialData.other_qualifications || '',

    listing_title: initialData.listing_title || '',
    listing_description: initialData.listing_description || '',

    target_profile: initialData.target_profile || '',
    logo: initialData.logo || null,
    preferred_contact_method: initialData.preferred_contact_method || '',
    dti_sbc: initialData.dti_sbc || null,
    bir_2303: initialData.bir_2303 || null,
    ipo_registration: initialData.ipo_registration || null,
  };
}

export default function FranchiseRegister({ initialData, companyId }: { initialData?: Partial<CompanyForm>, companyId?: number }) {
  const hydratedData = hydrateAddressData(initialData || {});

  const { data, setData, post, put, processing, errors, reset } = useForm<CompanyForm>(() => ({
    ...hydratedData,
    company_name: initialData?.company_name || '',
    brand_name: initialData?.brand_name || '',
    region_code: initialData?.region_code || '',
    province_code: initialData?.province_code || '',
    citymun_code: initialData?.citymun_code || '',
    barangay_code: initialData?.barangay_code || '',
    city: initialData?.city || '',
    state_province: initialData?.state_province || '',
    zip_code: initialData?.zip_code || '',
    country: initialData?.country || '',
    company_website: initialData?.company_website || '',
    description: initialData?.description || '',
    year_founded: initialData?.year_founded || '',
    num_franchise_locations: initialData?.num_franchise_locations || '',

    franchise_type: initialData?.franchise_type || '',
    min_investment: initialData?.min_investment || '',
    franchise_fee: initialData?.franchise_fee || '',
    royalty_fee_structure: initialData?.royalty_fee_structure || '',
    avg_annual_revenue: initialData?.avg_annual_revenue || '',
    target_markets: initialData?.target_markets || '',
    training_support: initialData?.training_support || '',
    franchise_term: initialData?.franchise_term || '',
    unique_selling_points: initialData?.unique_selling_points || '',

    industry_sector: initialData?.industry_sector || '',
    years_in_operation: initialData?.years_in_operation || '',
    total_revenue: initialData?.total_revenue || '',
    awards: initialData?.awards || '',
    company_history: initialData?.company_history || '',

    min_net_worth: initialData?.min_net_worth || '',
    min_liquid_assets: initialData?.min_liquid_assets || '',
    prior_experience: initialData?.prior_experience || false,
    experience_type: initialData?.experience_type || '',
    other_qualifications: initialData?.other_qualifications || '',

    listing_title: initialData?.listing_title || '',
    listing_description: initialData?.listing_description || '',
    target_profile: initialData?.target_profile || '',
    logo: initialData?.logo || null,
    preferred_contact_method: initialData?.preferred_contact_method || '',
    dti_sbc: initialData?.dti_sbc || null,
    bir_2303: initialData?.bir_2303 || null,
    ipo_registration: initialData?.ipo_registration || null,
  }));


  const [step, setStep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  function validateStep(step: number) {
    const requiredFields: Record<number, (keyof typeof data)[]> = {
      0: ['company_name', 'city', 'state_province', 'country', 'description', 'year_founded'], // removed zip_code since postal code is skipped
      1: ['franchise_type', 'min_investment', 'franchise_fee', 'royalty_fee_structure', 'target_markets', 'franchise_term'],
      2: ['industry_sector', 'years_in_operation'],
      3: ['min_net_worth', 'min_liquid_assets'],
      4: [],
      5: ['dti_sbc', 'bir_2303', 'ipo_registration'], // Add validation for documents step
    };

   for (const field of requiredFields[step] || []) {
    if (data[field] === null || data[field] === '' || data[field] === undefined) return false;
  }
  return true;
}

  function next() {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }



  function doSubmit() {
    const transformedData = {
      ...data,
      prior_experience: data.prior_experience,
      year_founded: data.year_founded === '' ? null : data.year_founded,
      num_franchise_locations: data.num_franchise_locations === '' ? null : data.num_franchise_locations,
      min_investment: data.min_investment === '' ? null : data.min_investment,
      franchise_fee: data.franchise_fee === '' ? null : data.franchise_fee,
      avg_annual_revenue: data.avg_annual_revenue === '' ? null : data.avg_annual_revenue,
      years_in_operation: data.years_in_operation === '' ? null : data.years_in_operation,
      total_revenue: data.total_revenue === '' ? null : data.total_revenue,
      min_net_worth: data.min_net_worth === '' ? null : data.min_net_worth,
      min_liquid_assets: data.min_liquid_assets === '' ? null : data.min_liquid_assets,
    };

   if (companyId) {
      console.log(data.company_name, transformedData);
      put(`/companies/${companyId}`, {
        ...transformedData,
        onSuccess: () => {
          window.location.href = '/my-companies';
        },
        onError: (error: unknown) => {
          console.error('Update failed:', error);
          console.error('Request data:', transformedData);
          console.error('Company ID:', companyId);
          alert('Update failed. Please check console for details.');
        },
      });
    } else {
      post('/companies', {
        ...transformedData,
        onSuccess: () => {
          reset();
          setStep(0);
          window.location.href = '/my-companies';
        },
        onError: (error: unknown) => {
          console.error('Submission failed:', error);
          console.error('Request data:', transformedData);
          alert('Submission failed. Please check console for details.');
        },
      });
    }
  }


  return (
      <PermissionGate permission="create_companies" fallback={<div className="p-6">You don't have permission to register companies.</div>}>
        <AppLayout breadcrumbs={breadcrumbs}>
          <Head title="Dashboard" />

          <div
            ref={containerRef}
            className="relative overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border md:col-span-3"
          >
            <div className="relative z-10 px-4 pb-4 max-h-[70vh] overflow-y-auto">
              <div className="mb-4 flex items-center justify-between pt-4">
                <div>
                  <h3 className="text-sm font-semibold text-black">Register your Company/Franchise</h3>
                  <p className="text-xs text-black">Step {step + 1} of {STEPS.length}</p>
                </div>
              </div>
            
                  {/* chips */}
                  <div className="mb-4 flex flex-wrap gap-2">
                    {STEPS.map((label, i) => (
                      <span key={i} className={`px-2 py-1 rounded-full text-[11px] ${i <= step ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                        {i + 1}. {label}
                      </span>
                    ))}
                  </div>

                  {/* FORM */}
                  <form
                    onSubmit={(e) => e.preventDefault()}
                    onKeyDownCapture={(e) => {
                      const last = STEPS.length - 1;
                      if (e.key === 'Enter' && step < last) {
                        e.preventDefault();
                        if (validateStep(step)) next();
                      }
                    }}
                    encType="multipart/form-data"
                    className="space-y-4"
                  >
                    {/* Step 1: Company */}
                    {step === 0 && (
                      <div className="grid gap-3">
                        <Field label="Company Name *">
                          <Input id="company_name" name="company_name" value={data.company_name} onChange={(e) => setData('company_name', e.target.value)} required />
                          <ErrorText message={errors?.company_name} />
                        </Field>
                        <Field label="Brand Name *">
                          <Input name="brand_name" value={data.brand_name ?? ''} onChange={(e) => setData('brand_name', e.target.value)} required/>
                          <ErrorText message={errors?.brand_name} />
                        </Field>
                        
                        <h3 className="text-md font-semibold mt-4">Headquarters Address</h3>
                      <AddressForm
                            value={{
                              region_code: data.region_code,
                              region_name: data.region_name,
                              province_code: data.province_code,
                              province_name: data.province_name,
                              citymun_code: data.citymun_code,
                              citymun_name: data.citymun_name,
                              barangay_code: data.barangay_code,
                              barangay_name: data.barangay_name,
                              postal_code: data.postal_code,
                              country: data.country || 'Philippines',
                            }}
                            onChange={(val) => {
                              setData((prev) => ({
                                ...prev,
                                region_code: val.region_code,
                                region_name: val.region_name,
                                province_code: val.province_code,
                                province_name: val.province_name,
                                citymun_code: val.citymun_code,
                                citymun_name: val.citymun_name,
                                barangay_code: val.barangay_code,
                                barangay_name: val.barangay_name,
                                postal_code: val.postal_code,
                                zip_code: val.postal_code, // legacy compatibility
                                city: val.citymun_name,
                                state_province: val.province_name,
                                country: val.country || 'Philippines',
                              }));
                            }}
                            errors={{
                              region_code: errors.region_code || '',
                              province_code: errors.province_code || '',
                              citymun_code: errors.citymun_code || '',
                              barangay_code: errors.barangay_code || '',
                              postal_code: errors.postal_code || '',
                              country: errors.country || '',
                            }}
                            disabled={processing}
                          />

                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Company Website (optional)">
                            <Input name="company_website" value={data.company_website ?? ''} onChange={(e) => setData('company_website', e.target.value)} />
                            <ErrorText message={errors?.company_website} />
                          </Field>
  <Field label="Year Founded *">
    <Input
      name="year_founded"
      type="number"
      min={1800}
      max={new Date().getFullYear()}
      value={data.year_founded ?? ''}
      onChange={(e) => setData('year_founded', e.target.value)}
      required
    />
    <ErrorText message={errors?.year_founded} />
  </Field>
                        </div>

                        <Field label="Description *">
                          <Textarea name="description" rows={2} value={data.description} onChange={(e) => setData('description', e.target.value)} required />
                          <ErrorText message={errors?.description} />
                        </Field>

  <Field label="Number of Existing Franchise Locations (optional)">
    <Input
      name="num_franchise_locations"
      type="number"
      min={0}
      value={data.num_franchise_locations ?? ''}
      onChange={(e) => setData('num_franchise_locations', e.target.value)}
    />
    <ErrorText message={errors?.num_franchise_locations} />
  </Field>
                        

                      </div>
                      
                    )}

                    {/* Step 2: Opportunity */}
                    {step === 1 && (
                      <div className="grid gap-3">
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Franchise Type *"><Input name="franchise_type" value={data.franchise_type} onChange={(e) => setData('franchise_type', e.target.value)} required /></Field>
                          <Field label="Franchise Term *"><Input name="franchise_term" value={data.franchise_term} onChange={(e) => setData('franchise_term', e.target.value)} required /></Field>
  <Field label="Minimum Investment Required *"><Input name="min_investment" type="number" step="0.01" value={data.min_investment ?? ''} onChange={(e) => setData('min_investment', e.target.value)} required /></Field>
  <Field label="Franchise Fee *"><Input name="franchise_fee" type="number" step="0.01" value={data.franchise_fee ?? ''} onChange={(e) => setData('franchise_fee', e.target.value)} required /></Field>
  <Field label="Royalty Fee Structure*">
    <Input
      name="royalty_fee_structure"   // ✅ fixed (was royalty_fee)
      value={data.royalty_fee_structure}
      onChange={(e) => setData("royalty_fee_structure", e.target.value)}
    />
    {errors.royalty_fee_structure && (
      <div className="text-red-500">{errors.royalty_fee_structure}</div>
    )}
  </Field>                        
  <Field label="Average Annual Revenue per Location (optional)"><Input name="avg_annual_revenue" type="number" step="0.01" value={data.avg_annual_revenue ?? ''} onChange={(e) => setData('avg_annual_revenue', e.target.value)} /></Field>
  <ErrorText message={errors?.avg_annual_revenue} />
                        </div>
                        <Field label="Target Markets/Regions for Expansion *"><Input name="target_markets" value={data.target_markets} onChange={(e) => setData('target_markets', e.target.value)} required /></Field>
                        <Field label="Training and Support Offered (optional)"><Textarea name="training_support" rows={2} value={data.training_support ?? ''} onChange={(e) => setData('training_support', e.target.value)} /></Field>
                        <Field label="Unique Selling Points (optional)"><Textarea name="unique_selling_points" rows={2} value={data.unique_selling_points ?? ''} onChange={(e) => setData('unique_selling_points', e.target.value)} /></Field>
                      </div>
                    )}

                    {/* Step 3: Background */}
                    {step === 2 && (
                      <div className="grid gap-3">
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Industry Sector *">
                            <Input name="industry_sector" value={data.industry_sector} onChange={(e) => setData('industry_sector', e.target.value)} required />
                          </Field>
  <Field label="Years in Operation*">
  <Input
    type="number"
    name="years_in_operation"
    value={data.years_in_operation ?? ''}
    onChange={(e) => setData("years_in_operation", e.target.value)}
  />
  {errors.years_in_operation && (
    <div className="text-red-500">{errors.years_in_operation}</div>
  )}
</Field>

                          <ErrorText message={errors?.years_in_operation} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
  <Field label="Total Company Revenue (optional)"><Input name="total_revenue" type="number" step="0.01" value={data.total_revenue ?? ''} onChange={(e) => setData('total_revenue', e.target.value)} /></Field>
  <Field label="Awards or Recognitions (optional)"><Input name="awards" value={data.awards ?? ''} onChange={(e) => setData('awards', e.target.value)} /></Field>
  <ErrorText message={errors?.total_revenue} />
                        </div>
                        <Field label="Brief Company History/Description (optional)">
                          <Textarea name="company_history" rows={3} value={data.company_history ?? ''} onChange={(e) => setData('company_history', e.target.value)} />
                          <ErrorText message={errors?.company_history} />
                        </Field>
                      </div>
                    )}

                    {/* Step 4: Requirements */}
                    {step === 3 && (
                      <div className="grid gap-3">
                        <div className="grid grid-cols-2 gap-3">
  <Field label="Minimum Net Worth Required *"><Input name="min_net_worth" type="number" step="0.01" value={data.min_net_worth ?? ''} onChange={(e) => setData('min_net_worth', e.target.value)} required /></Field>
  <Field label="Minimum Liquid Assets Required *"><Input name="min_liquid_assets" type="number" step="0.01" value={data.min_liquid_assets ?? ''} onChange={(e) => setData('min_liquid_assets', e.target.value)} required /></Field>
  <ErrorText message={errors?.min_net_worth} />
  <ErrorText message={errors?.min_liquid_assets} />
                        </div>

                        <div className="flex items-center gap-2 text-gray-200">
                          <input id="prior_experience" type="checkbox" checked={data.prior_experience} onChange={(e) => setData('prior_experience', e.target.checked)} />
                          <label htmlFor="prior_experience">Prior Business Experience Preferred?</label>
                        </div>

                        <Field label="If Yes, specify Experience Type (optional)">
                          <Input name="experience_type" value={data.experience_type ?? ''} onChange={(e) => setData('experience_type', e.target.value)} />
                          <ErrorText message={errors?.experience_type} />
                        </Field>
                        <Field label="Other Qualifications (optional)">
                          <Textarea name="other_qualifications" rows={2} value={data.other_qualifications ?? ''} onChange={(e) => setData('other_qualifications', e.target.value)} />
                          <ErrorText message={errors?.other_qualifications} />
                        </Field>
                      </div>
                    )}

                    {/* Step 5: Marketing */}
                    {step === 4 && (
                      <div className="grid gap-3">
                        <div className="grid grid-cols-2 gap-3">
  <Field label="Preferred Listing Title (optional)"><Input name="listing_title" value={data.listing_title ?? ''} onChange={(e) => setData('listing_title', e.target.value)} /></Field>
  <Field label="Target Franchisee Profile (optional)"><Input name="target_profile" value={data.target_profile ?? ''} onChange={(e) => setData('target_profile', e.target.value)} /></Field>
                        </div>
                        <Field label="Short Description for Listing (optional)">
                          <Textarea name="listing_description" rows={3} value={data.listing_description ?? ''} onChange={(e) => setData('listing_description', e.target.value)} />
                          <ErrorText message={errors?.listing_description} />
                        </Field>
                        <div>
                          <label className="block text-xs text-black">Upload Logo or Brand Images (optional)</label>
                          <input
                            type="file"
                            accept="image/*"
                            className="mt-1 block w-full text-gray-200"
                            name="logo"
                            onChange={(e) => setData('logo', e.currentTarget.files?.[0] ?? null)}
                          />
                          <ErrorText message={errors?.logo} />
                        </div>
                        <Field label="Preferred Contact Method for Inquiries (optional)">
                          <Input name="preferred_contact_method" value={data.preferred_contact_method ?? ''} onChange={(e) => setData('preferred_contact_method', e.target.value)} />
                          <ErrorText message={errors?.preferred_contact_method} />
                        </Field>
                      </div>
                    )}


                    {/* Step 6: Documents */}
                    {step === 5 && (
                      <div className="grid gap-3">
                        <h3 className="text-md font-semibold">Required Business Documents</h3>
                        
                        <Field label="DTI/SBC Certificate *">
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="mt-1 block w-full text-gray-200"
                            onChange={(e) => setData('dti_sbc', e.currentTarget.files?.[0] ?? null)}
                            required
                          />
                          <ErrorText message={errors?.dti_sbc} />
                        </Field>

                        <Field label="BIR 2303 Form *">
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="mt-1 block w-full text-gray-200"
                            onChange={(e) => setData('bir_2303', e.currentTarget.files?.[0] ?? null)}
                            required
                          />
                          <ErrorText message={errors?.bir_2303} />
                        </Field>

                        <Field label="IPO Registration *">
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="mt-1 block w-full text-gray-200"
                            onChange={(e) => setData('ipo_registration', e.currentTarget.files?.[0] ?? null)}
                            required
                          />
                          <ErrorText message={errors?.ipo_registration} />
                        </Field>
                      </div>
                    )}

                    {/* controls */}
                    <div className="mt-4 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={back}
                        className="rounded-lg border border-gray-600 px-3 py-2 text-black disabled:opacity-40"
                        disabled={step === 0 || processing}
                      >
                        Back
                      </button>

                      {step < STEPS.length - 1 ? (
                        <button
                          type="button"
                          onClick={next}
                          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                          disabled={!validateStep(step) || processing}
                        >
                          Next
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={doSubmit}
                          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                          disabled={processing}>
                          {companyId ? 'Resubmit' : 'Submit'}
                      </button>
                    )}
                  </div>

                  {Object.keys(errors).length > 0 && (
                    <div className="mt-3 rounded-md bg-red-600/20 p-3 text-sm text-red-300">
                      Please fix the highlighted errors and submit again.
                    </div>
                  )}
                </form>
              </div>
          </div>
      </AppLayout>
    </PermissionGate>
  );
}
