import React, { useState, useEffect, useRef } from 'react';
import { useForm } from '@inertiajs/react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import PermissionGate from '@/components/PermissionGate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
// import { Progress } from '@/components/ui/progress';
import { CheckCircle, ChevronRight, ChevronLeft, Building2, DollarSign, Users, FileText, Upload, AlertCircle } from 'lucide-react';

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
  years_in_operation: string; // Changed from years_in_operation
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
  // documents (required on create, optional on edit)
  dti_sbc?: File | null;
  bir_2303?: File | null;
  ipo_registration?: File | null;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-xs text-black">
      {label}
      <div className="mt-1">{children}</div>
    </label>
  );
}


function ErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-400">{message}</p>;
}

export default function FranchiseRegister({ initialData, companyId }: { initialData?: Partial<CompanyForm>, companyId?: number }) {
  const { data, setData, post, put, processing, errors, reset, transform } = useForm<CompanyForm>({
    company_name: initialData?.company_name || '',
    brand_name: initialData?.brand_name || null,
    city: initialData?.city || '',
    state_province: initialData?.state_province || '',
    zip_code: initialData?.zip_code || '',
    country: initialData?.country || '',
    company_website: initialData?.company_website || null,
    description: initialData?.description || '',
    year_founded: initialData?.year_founded || '',
    num_franchise_locations: initialData?.num_franchise_locations || '',

    franchise_type: initialData?.franchise_type || '',
    min_investment: initialData?.min_investment || '',
    franchise_fee: initialData?.franchise_fee || '',
    royalty_fee_structure: initialData?.royalty_fee_structure || '',
    avg_annual_revenue: initialData?.avg_annual_revenue || '',
    target_markets: initialData?.target_markets || '',
    training_support: initialData?.training_support || null,
    franchise_term: initialData?.franchise_term || '',
    unique_selling_points: initialData?.unique_selling_points || null,

    industry_sector: initialData?.industry_sector || '',
    years_in_operation: initialData?.years_in_operation || '',
    total_revenue: initialData?.total_revenue || '',
    awards: initialData?.awards || null,
    company_history: initialData?.company_history || null,

    min_net_worth: initialData?.min_net_worth || '',
    min_liquid_assets: initialData?.min_liquid_assets || '',
    prior_experience: initialData?.prior_experience || false,
    experience_type: initialData?.experience_type || null,
    other_qualifications: initialData?.other_qualifications || null,

    listing_title: initialData?.listing_title || null,
    listing_description: initialData?.listing_description || null,
    logo: null, // File inputs cannot be pre-filled
    target_profile: initialData?.target_profile || null,
    preferred_contact_method: initialData?.preferred_contact_method || null,

    dti_sbc: null, // File inputs cannot be pre-filled
    bir_2303: null, // File inputs cannot be pre-filled  
    ipo_registration: null, // File inputs cannot be pre-filled
  });

  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  

  useEffect(() => {
    if (open) {
      containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => document.getElementById('company_name')?.focus(), 200);
    }
  }, [open]);

  function validateStep(step: number) {
    const requiredFields: Record<number, (keyof typeof data)[]> = {
      0: ['company_name', 'city', 'state_province', 'zip_code', 'country', 'description', 'year_founded'],
      1: ['franchise_type', 'min_investment', 'franchise_fee', 'royalty_fee_structure', 'target_markets', 'franchise_term'],
      2: ['industry_sector', 'years_in_operation'],
      3: ['min_net_worth', 'min_liquid_assets'],
      4: [],
      5: ['dti_sbc', 'bir_2303', 'ipo_registration'],
    };

    for (const field of requiredFields[step] || []) {
      if (!data[field] && data[field] !== 0) return false;
    }
    return true;
  }

  function next() {
    if (validateStep(step)) {
      setCompletedSteps(prev => [...prev, step]);
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }
  }
  
  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function goToStep(targetStep: number) {
    if (targetStep <= step || completedSteps.includes(targetStep - 1)) {
      setStep(targetStep);
    }
  }

function doSubmit() {
  transform((d) => ({
    ...d,
    prior_experience: d.prior_experience,
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

  if (companyId) {
    console.log(data.company_name, data); 
    put(`/companies/${companyId}`, {
      onSuccess: () => {
        window.location.href = '/my-companies';
      },
      onError: (errors) => {
        console.error('Update failed:', errors);
        console.error('Request data:', data);
        console.error('Company ID:', companyId);
        alert('Update failed. Please check console for details.');
      },
    });
  } else {
    post('/companies', {
      onSuccess: () => {
        reset();
        setStep(0);
        setOpen(false);
        window.location.href = '/my-companies';
      },
      onError: (errors) => {
        console.error('Submission failed:', errors);
        console.error('Request data:', data);
        alert('Submission failed. Please check console for details.');
      },
    });
  }
}


  const stepIcons = [Building2, DollarSign, Users, FileText, Upload, FileText];
  const stepDescriptions = [
    "Basic company information and location",
    "Franchise opportunity details and investment requirements",
    "Company background and industry information",
    "Franchisee requirements and qualifications",
    "Marketing materials and listing information",
    "Required business documents and certifications"
  ];

  return (
    <PermissionGate permission="create_companies" fallback={<div className="p-6">You don't have permission to register companies.</div>}>
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Company Registration" />

        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {companyId ? 'Edit Company Registration' : 'Register Your Company'}
              </h1>
              <p className="text-gray-600 ">
                Complete the registration process to list your franchise opportunity
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-700">
                  Step {step + 1} of {STEPS.length}
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round(((step + 1) / STEPS.length) * 100)}% Complete
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
                  style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Step Navigation */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {STEPS.map((stepName, index) => {
                  const Icon = stepIcons[index];
                  const isCompleted = completedSteps.includes(index);
                  const isCurrent = index === step;
                  const isAccessible = index <= step || completedSteps.includes(index - 1);
                  
                  return (
                    <div key={index} className="flex flex-col items-center">
                      <button
                        onClick={() => goToStep(index)}
                        disabled={!isAccessible}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                          isCompleted
                            ? 'bg-green-500 text-white'
                            : isCurrent
                            ? 'bg-blue-500 text-white'
                            : isAccessible
                            ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <Icon className="w-6 h-6" />
                        )}
                      </button>
                      <span className={`text-xs mt-2 text-center ${
                        isCurrent ? 'text-blue-600 font-medium' : 'text-gray-500'
                      }`}>
                        {stepName}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Form Content */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="flex items-center gap-3">
                  {React.createElement(stepIcons[step], { className: "w-6 h-6 text-blue-600" })}
                  {STEPS[step]}
                </CardTitle>
                <p className="text-gray-600 ml-12"> {stepDescriptions[step]}</p>
              </CardHeader>
              <CardContent className="p-6">

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
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="company_name">Company Name *</Label>
                          <Input
                            id="company_name"
                            name="company_name"
                            value={data.company_name}
                            onChange={(e) => setData('company_name', e.target.value)}
                            placeholder="Enter your company name"
                            required
                          />
                          <ErrorText message={(errors as any).company_name} />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="brand_name">Brand Name</Label>
                          <Input
                            name="brand_name"
                            value={data.brand_name ?? ''}
                            onChange={(e) => setData('brand_name', e.target.value)}
                            placeholder="Enter your brand name"
                          />
                          <ErrorText message={(errors as any).brand_name} />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Headquarters Address</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="city">City *</Label>
                            <Input
                              name="city"
                              value={data.city}
                              onChange={(e) => setData('city', e.target.value)}
                              placeholder="Enter city"
                              required
                            />
                            <ErrorText message={(errors as any).city} />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="state_province">State/Province *</Label>
                            <Input
                              name="state_province"
                              value={data.state_province}
                              onChange={(e) => setData('state_province', e.target.value)}
                              placeholder="Enter state/province"
                              required
                            />
                            <ErrorText message={(errors as any).state_province} />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="zip_code">ZIP/Postal Code *</Label>
                            <Input
                              name="zip_code"
                              value={data.zip_code}
                              onChange={(e) => setData('zip_code', e.target.value)}
                              placeholder="Enter ZIP code"
                              required
                            />
                            <ErrorText message={(errors as any).zip_code} />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="country">Country *</Label>
                            <Input
                              name="country"
                              value={data.country}
                              onChange={(e) => setData('country', e.target.value)}
                              placeholder="Enter country"
                              required
                            />
                            <ErrorText message={(errors as any).country} />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="company_website">Company Website</Label>
                          <Input
                            name="company_website"
                            value={data.company_website ?? ''}
                            onChange={(e) => setData('company_website', e.target.value)}
                            placeholder="https://yourcompany.com"
                            type="url"
                          />
                          <ErrorText message={(errors as any).company_website} />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="year_founded">Year Founded *</Label>
                          <Input
                            name="year_founded"
                            type="number"
                            min={1800}
                            max={new Date().getFullYear()}
                            value={data.year_founded}
                            onChange={(e) => setData('year_founded', Number(e.target.value) || '')}
                            placeholder="2020"
                            required
                          />
                          <ErrorText message={(errors as any).year_founded} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Company Description *</Label>
                        <Textarea
                          name="description"
                          rows={4}
                          value={data.description}
                          onChange={(e) => setData('description', e.target.value)}
                          placeholder="Describe your company and what makes it unique..."
                          required
                        />
                        <ErrorText message={(errors as any).description} />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="num_franchise_locations">Number of Existing Franchise Locations</Label>
                        <Input
                          name="num_franchise_locations"
                          type="number"
                          min={0}
                          value={data.num_franchise_locations}
                          onChange={(e) => setData('num_franchise_locations', Number(e.target.value) || '')}
                          placeholder="0"
                        />
                        <ErrorText message={(errors as any).num_franchise_locations} />
                      </div>
                    </div>
                  )}

                  {/* Step 2: Opportunity */}
                  {step === 1 && (
                    <div className="grid gap-3">
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Franchise Type *"><Input name="franchise_type" value={data.franchise_type} onChange={(e) => setData('franchise_type', e.target.value)} required /></Field>
                        <Field label="Franchise Term *"><Input name="franchise_term" value={data.franchise_term} onChange={(e) => setData('franchise_term', e.target.value)} required /></Field>
                        <Field label="Minimum Investment Required *"><Input name="min_investment" type="number" step="0.01" value={data.min_investment} onChange={(e) => setData('min_investment', Number(e.target.value) || '')} required /></Field>
                        <Field label="Franchise Fee *"><Input name="franchise_fee" type="number" step="0.01" value={data.franchise_fee} onChange={(e) => setData('franchise_fee', Number(e.target.value) || '')} required /></Field>
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
                        <Field label="Average Annual Revenue per Location (optional)"><Input name="avg_annual_revenue" type="number" step="0.01" value={data.avg_annual_revenue} onChange={(e) => setData('avg_annual_revenue', Number(e.target.value) || '')} /></Field>
                        <ErrorText message={(errors as any).avg_annual_revenue} />
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
                          value={data.years_in_operation}
                          onChange={(e) => setData("years_in_operation", e.target.value)}
                        />
                        {errors.years_in_operation && (
                          <div className="text-red-500">{errors.years_in_operation}</div>
                        )}
                      </Field>

                        <ErrorText message={(errors as any).years_in_operation} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Total Company Revenue (optional)"><Input name="total_revenue" type="number" step="0.01" value={data.total_revenue} onChange={(e) => setData('total_revenue', Number(e.target.value) || '')} /></Field>
                        <Field label="Awards or Recognitions (optional)"><Input name="awards" value={data.awards ?? ''} onChange={(e) => setData('awards', e.target.value)} /></Field>
                        <ErrorText message={(errors as any).total_revenue} />
                      </div>
                      <Field label="Brief Company History/Description (optional)">
                        <Textarea name="company_history" rows={3} value={data.company_history ?? ''} onChange={(e) => setData('company_history', e.target.value)} />
                        <ErrorText message={(errors as any).company_history} />
                      </Field>
                    </div>
                  )}

                  {/* Step 4: Requirements */}
                  {step === 3 && (
                    <div className="grid gap-3">
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Minimum Net Worth Required *"><Input name="min_net_worth" type="number" step="0.01" value={data.min_net_worth} onChange={(e) => setData('min_net_worth', Number(e.target.value) || '')} required /></Field>
                        <Field label="Minimum Liquid Assets Required *"><Input name="min_liquid_assets" type="number" step="0.01" value={data.min_liquid_assets} onChange={(e) => setData('min_liquid_assets', Number(e.target.value) || '')} required /></Field>
                        <ErrorText message={(errors as any).min_net_worth} />
                        <ErrorText message={(errors as any).min_liquid_assets} />
                      </div>

                      <div className="flex items-center gap-2 text-gray-200">
                        <input id="prior_experience" type="checkbox" checked={data.prior_experience} onChange={(e) => setData('prior_experience', e.target.checked)} />
                        <label htmlFor="prior_experience">Prior Business Experience Preferred?</label>
                      </div>

                      <Field label="If Yes, specify Experience Type (optional)">
                        <Input name="experience_type" value={data.experience_type ?? ''} onChange={(e) => setData('experience_type', e.target.value)} />
                        <ErrorText message={(errors as any).experience_type} />
                      </Field>
                      <Field label="Other Qualifications (optional)">
                        <Textarea name="other_qualifications" rows={2} value={data.other_qualifications ?? ''} onChange={(e) => setData('other_qualifications', e.target.value)} />
                        <ErrorText message={(errors as any).other_qualifications} />
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
                        <ErrorText message={(errors as any).listing_description} />
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
                        <ErrorText message={(errors as any).logo} />
                      </div>
                      <Field label="Preferred Contact Method for Inquiries (optional)">
                        <Input name="preferred_contact_method" value={data.preferred_contact_method ?? ''} onChange={(e) => setData('preferred_contact_method', e.target.value)} />
                        <ErrorText message={(errors as any).preferred_contact_method} />
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
                        <ErrorText message={(errors as any).dti_sbc} />
                      </Field>

                      <Field label="BIR 2303 Form *">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="mt-1 block w-full text-gray-200"
                          onChange={(e) => setData('bir_2303', e.currentTarget.files?.[0] ?? null)}
                          required
                        />
                        <ErrorText message={(errors as any).bir_2303} />
                      </Field>

                      <Field label="IPO Registration *">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="mt-1 block w-full text-gray-200"
                          onChange={(e) => setData('ipo_registration', e.currentTarget.files?.[0] ?? null)}
                          required
                        />
                        <ErrorText message={(errors as any).ipo_registration} />
                      </Field>
                    </div>
                  )}

                </form>

                {/* Form Controls */}
                <div className="flex items-center justify-between pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={back}
                    disabled={step === 0 || processing}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </Button>

                  <div className="flex items-center gap-4">
                    {Object.keys(errors).length > 0 && (
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        Please fix the errors above
                      </div>
                    )}
                    
                    {step < STEPS.length - 1 ? (
                      <Button
                        type="button"
                        onClick={next}
                        disabled={!validateStep(step) || processing}
                        className="flex items-center gap-2"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={doSubmit}
                        disabled={processing}
                        className="flex items-center gap-2"
                      >
                        {processing ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            {companyId ? 'Updating...' : 'Submitting...'}
                          </>
                        ) : (
                          <>
                            {companyId ? 'Update Company' : 'Submit Registration'}
                            <CheckCircle className="w-4 h-4" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    </PermissionGate>
  );
}
