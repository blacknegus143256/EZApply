import { useState, useEffect, useRef } from 'react';
import { useForm } from '@inertiajs/react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import PermissionGate from '@/components/PermissionGate';

// Steps definition
const STEPS = [
  'Company Info',
  'Opportunity',
  'Background',
  'Requirements',
  'Marketing / Listing',
];

// Breadcrumbs
const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: dashboard().url,
  },
];

interface CompanyForm {
  company_name: string;
  brand_name: string | null;

  city: string;
  state_province: string;
  zip_code: string;
  country: string;
  company_website: string | null;
  description: string;
  year_founded: number | '';
  num_franchise_locations: number | '';

  franchise_type: string;
  min_investment: number | '';
  franchise_fee: number | '';
  royalty_fee_structure: string;
  avg_annual_revenue: number | '';
  target_markets: string;
  training_support: string | null;
  franchise_term: string;
  unique_selling_points: string | null;

  industry_sector: string;
  years_in_operation: number | '';
  total_revenue: number | '';
  awards: string | null;
  company_history: string | null;

  min_net_worth: number | '';
  min_liquid_assets: number | '';
  prior_experience: boolean;
  experience_type: string | null;
  other_qualifications: string | null;

  listing_title: string | null;
  listing_description: string | null;
  logo: File | null;
  target_profile: string | null;
  preferred_contact_method: string | null;
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

export default function FranchiseRegister() {
  const { data, setData, post, processing, errors, reset, transform } = useForm<CompanyForm>({
    company_name: '',
    brand_name: null,
    city: '',
    state_province: '',
    zip_code: '',
    country: '',
    company_website: null,
    description: '',
    year_founded: '',
    num_franchise_locations: '',

    franchise_type: '',
    min_investment: '',
    franchise_fee: '',
    royalty_fee_structure: '',
    avg_annual_revenue: '',
    target_markets: '',
    training_support: null,
    franchise_term: '',
    unique_selling_points: null,

    industry_sector: '',
    years_in_operation: '',
    total_revenue: '',
    awards: null,
    company_history: null,

    min_net_worth: '',
    min_liquid_assets: '',
    prior_experience: false,
    experience_type: null,
    other_qualifications: null,

    listing_title: null,
    listing_description: null,
    logo: null,
    target_profile: null,
    preferred_contact_method: null,
  });

  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => document.getElementById('company_name')?.focus(), 200);
    }
  }, [open]);

  function validateStep(s: number) {
    const req: Record<number, (keyof CompanyForm)[]> = {
      0: ['company_name', 'city', 'state_province', 'zip_code', 'country', 'description', 'year_founded'],
      1: ['franchise_type', 'min_investment', 'franchise_fee', 'royalty_fee_structure', 'target_markets', 'franchise_term'],
      2: ['industry_sector', 'years_in_operation'],
      3: ['min_net_worth', 'min_liquid_assets'],
      4: [],
    };
    for (const k of req[s] ?? []) {
      const v = data[k];
      if (v === '' || v === null || v === undefined) return false;
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
    transform((d) => ({
      ...d,
      prior_experience: d.prior_experience ? 1 : 0,
      year_founded: d.year_founded === '' ? null : d.year_founded,
      num_franchise_locations: d.num_franchise_locations === '' ? null : d.num_franchise_locations,
      min_investment: d.min_investment === '' ? null : d.min_investment,
      franchise_fee: d.franchise_fee === '' ? null : d.franchise_fee,
      avg_annual_revenue: d.avg_annual_revenue === '' ? null : d.avg_annual_revenue,
      years_in_operation: d.years_in_operation === '' ? null : d.years_in_operation,
      total_revenue: d.total_revenue === '' ? null : d.total_revenue,
      min_net_worth: d.min_net_worth === '' ? null : d.min_net_worth,
      min_liquid_assets: d.min_liquid_assets === '' ? null : d.min_liquid_assets,
    }));

    post('/companies', {
      forceFormData: true,
      onSuccess: () => {
        reset();
        setStep(0);
        setOpen(false);
      },
    });
  }

  return (
    <PermissionGate permission="create_companies" fallback={<div className="p-6">You don't have permission to register companies.</div>}>
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Dashboard" />

        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          {/* Card 1: click to expand to full width */}
          <div
            ref={containerRef}
            onClick={() => { if (!open) setOpen(true); }}
            className={`relative overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border ${
              open ? 'md:col-span-3' : 'aspect-video cursor-pointer'
            }`}
          >
            <div className="absolute inset-0 pointer-events-none">
              <PlaceholderPattern className="size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
            </div>

            {!open ? (
              <div className="relative z-10 flex h-full w-full items-center justify-between p-4">
                <div>
                  <h3 className="text-sm font-semibold text-black">Register your Company/Franchise</h3>
                  <p className="text-xs text-black">Click to start the {STEPS.length}-step setup</p>
                </div>
                <svg className="h-5 w-5 text-black" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                </svg>
              </div>
            ) : (
              <div className="relative z-10 px-4 pb-4 max-h-[70vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="mb-4 flex items-center justify-between pt-4">
                  <div>
                    <h3 className="text-sm font-semibold text-black">Register your Company/Franchise</h3>
                    <p className="text-xs text-black">Step {step + 1} of {STEPS.length}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-md border border-gray-600 px-2 py-1 text-xs text-gray-200 hover:bg-gray-700"
                  >
                    Collapse
                  </button>
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
                  // NEVER allow implicit submit
                  onSubmit={(e) => e.preventDefault()}
                  // Enter on steps 1–4 = Next
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
                        <Input id="company_name" value={data.company_name} onChange={(e) => setData('company_name', e.target.value)} required />
                      </Field>
                      <Field label="Brand Name (optional)">
                        <Input value={data.brand_name ?? ''} onChange={(e) => setData('brand_name', e.target.value)} />
                      </Field>
                      
                      <h3 className="text-md font-semibold mt-4">Headquarters Address</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="City *"><Input value={data.city} onChange={(e) => setData('city', e.target.value)} required /></Field>
                        <Field label="State/Province *"><Input value={data.state_province} onChange={(e) => setData('state_province', e.target.value)} required /></Field>
                        <Field label="ZIP/Postal Code *"><Input value={data.zip_code} onChange={(e) => setData('zip_code', e.target.value)} required /></Field>
                        <Field label="Country *"><Input value={data.country} onChange={(e) => setData('country', e.target.value)} required /></Field>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Company Website (optional)">
                          <Input value={data.company_website ?? ''} onChange={(e) => setData('company_website', e.target.value)} />
                        </Field>
                        <Field label="Year Founded *">
                          <Input
                            type="number"
                            min={1800}
                            max={new Date().getFullYear()}
                            value={data.year_founded}
                            onChange={(e) => setData('year_founded', Number(e.target.value) || '')}
                            required
                          />
                        </Field>
                      </div>

                      <Field label="Description *">
                        <Textarea rows={2} value={data.description} onChange={(e) => setData('description', e.target.value)} required />
                      </Field>

                      <Field label="Number of Existing Franchise Locations (optional)">
                        <Input
                          type="number"
                          min={0}
                          value={data.num_franchise_locations}
                          onChange={(e) => setData('num_franchise_locations', Number(e.target.value) || '')}
                        />
                      </Field>
                      

                    </div>
                    
                  )}

                  {/* Step 2: Opportunity */}
                  {step === 1 && (
                    <div className="grid gap-3">
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Franchise Type *"><Input value={data.franchise_type} onChange={(e) => setData('franchise_type', e.target.value)} required /></Field>
                        <Field label="Franchise Term *"><Input value={data.franchise_term} onChange={(e) => setData('franchise_term', e.target.value)} required /></Field>
                        <Field label="Minimum Investment Required *"><Input type="number" step="0.01" value={data.min_investment} onChange={(e) => setData('min_investment', Number(e.target.value) || '')} required /></Field>
                        <Field label="Franchise Fee *"><Input type="number" step="0.01" value={data.franchise_fee} onChange={(e) => setData('franchise_fee', Number(e.target.value) || '')} required /></Field>
                        <Field label="Royalty Fee Structure *"><Input value={data.royalty_fee_structure} onChange={(e) => setData('royalty_fee_structure', e.target.value)} required /></Field>
                        <Field label="Average Annual Revenue per Location (optional)"><Input type="number" step="0.01" value={data.avg_annual_revenue} onChange={(e) => setData('avg_annual_revenue', Number(e.target.value) || '')} /></Field>
                      </div>
                      <Field label="Target Markets/Regions for Expansion *"><Input value={data.target_markets} onChange={(e) => setData('target_markets', e.target.value)} required /></Field>
                      <Field label="Training and Support Offered (optional)"><Textarea rows={2} value={data.training_support ?? ''} onChange={(e) => setData('training_support', e.target.value)} /></Field>
                      <Field label="Unique Selling Points (optional)"><Textarea rows={2} value={data.unique_selling_points ?? ''} onChange={(e) => setData('unique_selling_points', e.target.value)} /></Field>
                    </div>
                  )}

                  {/* Step 3: Background */}
                  {step === 2 && (
                    <div className="grid gap-3">
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Industry Sector *"><Input value={data.industry_sector} onChange={(e) => setData('industry_sector', e.target.value)} required /></Field>
                        <Field label="Years in Operation *"><Input type="number" min={0} value={data.years_in_operation} onChange={(e) => setData('years_in_operation', Number(e.target.value) || '')} required /></Field>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Total Company Revenue (optional)"><Input type="number" step="0.01" value={data.total_revenue} onChange={(e) => setData('total_revenue', Number(e.target.value) || '')} /></Field>
                        <Field label="Awards or Recognitions (optional)"><Input value={data.awards ?? ''} onChange={(e) => setData('awards', e.target.value)} /></Field>
                      </div>
                      <Field label="Brief Company History/Description (optional)">
                        <Textarea rows={3} value={data.company_history ?? ''} onChange={(e) => setData('company_history', e.target.value)} />
                      </Field>
                    </div>
                  )}

                  {/* Step 4: Requirements */}
                  {step === 3 && (
                    <div className="grid gap-3">
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Minimum Net Worth Required *"><Input type="number" step="0.01" value={data.min_net_worth} onChange={(e) => setData('min_net_worth', Number(e.target.value) || '')} required /></Field>
                        <Field label="Minimum Liquid Assets Required *"><Input type="number" step="0.01" value={data.min_liquid_assets} onChange={(e) => setData('min_liquid_assets', Number(e.target.value) || '')} required /></Field>
                      </div>

                      <div className="flex items-center gap-2 text-gray-200">
                        <input id="prior_experience" type="checkbox" checked={data.prior_experience} onChange={(e) => setData('prior_experience', e.target.checked)} />
                        <label htmlFor="prior_experience">Prior Business Experience Preferred?</label>
                      </div>

                      <Field label="If Yes, specify Experience Type (optional)">
                        <Input value={data.experience_type ?? ''} onChange={(e) => setData('experience_type', e.target.value)} />
                      </Field>
                      <Field label="Other Qualifications (optional)">
                        <Textarea rows={2} value={data.other_qualifications ?? ''} onChange={(e) => setData('other_qualifications', e.target.value)} />
                      </Field>
                    </div>
                  )}

                  {/* Step 5: Marketing */}
                  {step === 4 && (
                    <div className="grid gap-3">
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Preferred Listing Title (optional)"><Input value={data.listing_title ?? ''} onChange={(e) => setData('listing_title', e.target.value)} /></Field>
                        <Field label="Target Franchisee Profile (optional)"><Input value={data.target_profile ?? ''} onChange={(e) => setData('target_profile', e.target.value)} /></Field>
                      </div>
                      <Field label="Short Description for Listing (optional)">
                        <Textarea rows={3} value={data.listing_description ?? ''} onChange={(e) => setData('listing_description', e.target.value)} />
                      </Field>
                      <div>
                        <label className="block text-xs text-black">Upload Logo or Brand Images (optional)</label>
                        <input
                          type="file"
                          accept="image/*"
                          className="mt-1 block w-full text-gray-200"
                          onChange={(e) => setData('logo', e.currentTarget.files?.[0] ?? null)}
                        />
                      </div>
                      <Field label="Preferred Contact Method for Inquiries (optional)">
                        <Input value={data.preferred_contact_method ?? ''} onChange={(e) => setData('preferred_contact_method', e.target.value)} />
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
                        disabled={processing}
                      >
                        Submit
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
            )}
          </div>

          {/* two placeholder cards when closed */}
          {!open && (
            <>
              <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
              </div>
              <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
              </div>
            </>
          )}
        </div>
        </div>
      </AppLayout>
    </PermissionGate>
  );
}
