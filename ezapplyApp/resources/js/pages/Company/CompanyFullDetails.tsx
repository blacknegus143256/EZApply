import React, { useState, useEffect, useMemo } from 'react';
import { Head, usePage, router, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useInitials } from '@/hooks/use-initials';
import { ArrowLeft, UserPlus, CheckCircle } from 'lucide-react';
import { BreadcrumbItem } from '@/types';
import type { CompanyDetails } from '@/types/company';
import PermissionGate, { AdminOnly } from '@/components/PermissionGate';
import { toast } from 'sonner';
import '../../../css/company-details.css';

type FormatType = "number" | "currency";

type Agent = {
  id: number;
  name: string;
  email: string;
  role: string;
};

const formatValue = (value: string | number, type: FormatType = "number") => {
  if (type === "currency") {
    const num = typeof value === "string" ? parseFloat(value.replace(/,/g, "")) : value;
    if (isNaN(num)) return "";
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(num);
  }

  const strValue = String(value);
  const cleaned = strValue.replace(/[^0-9.]/g, "");
  const parts = cleaned.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
};

const renderTable = (rows: { key: string; label: string; value: any; format?: "number" | "currency" }[]) => (
  <div className="w-full">
    {/* Desktop: Table view */}
    <table className="w-full text-sm hidden md:table">
      <tbody>
        {rows.map(({ key, label, value, format }) => (
          <tr key={key} className="border-b last:border-b-0">
            <td className="font-medium text-muted-foreground py-3 pr-6 align-top w-1/3">{label}</td>
            <td className="py-3 align-top whitespace-pre-wrap">
              {format === "currency" ? formatValue(value, "currency") : value ?? ""}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    {/* Mobile: Card view */}
    <div className="md:hidden space-y-3">
      {rows.map(({ key, label, value, format }) => (
        <div key={key} className="border-b pb-3 last:border-b-0 last:pb-0">
          <div className="font-medium text-muted-foreground text-sm mb-1">{label}</div>
          <div className="text-sm whitespace-pre-wrap break-words">
            {format === "currency" ? formatValue(value, "currency") : value ?? ""}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const mapCompanyAgentsToAgents = (agents: CompanyDetails['agents']): Agent[] => {
  if (!agents || agents.length === 0) return [];
  return agents.map(agent => ({
    id: agent.id,
    name: agent.basicInfo 
      ? `${agent.basicInfo.first_name} ${agent.basicInfo.last_name}` 
      : agent.email,
    email: agent.email,
    role: 'company',
  }));
};

const CompanyFullDetails: React.FC = () => {
  const { props } = usePage<{ company: CompanyDetails; allAgents?: Agent[]; auth?: { user?: any } }>();
  const company = props.company;
  const allAgentsFromProps = props.allAgents || [];
  const user = props.auth?.user || null;
  const isAuthenticated = !!user;
  const getInitials = useInitials();
  
  const [hasApplied, setHasApplied] = useState(false);

  const breadcrumbs: BreadcrumbItem[] = isAuthenticated
    ? [
        { title: "Dashboard", href: "/dashboard" },
        { title: "Companies", href: "/companies" },
        { title: "Company Details", href: "#" },
      ]
    : [
        { title: "Home", href: "/" },
        { title: "Companies", href: "/companies" },
        { title: "Company Details", href: "#" },
      ];

  const [query, setQuery] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [assignedAgents, setAssignedAgents] = useState<Agent[]>(() => 
    mapCompanyAgentsToAgents(company.agents)
  );

  const filteredResults = useMemo(() => {
    if (!query) return [];
    const assignedIds = assignedAgents.map(a => a.id);
    return allAgentsFromProps
      .filter(agent => 
        !assignedIds.includes(agent.id) &&
        (agent.name.toLowerCase().includes(query.toLowerCase()) ||
        agent.email.toLowerCase().includes(query.toLowerCase()))
      );
  }, [query, allAgentsFromProps, assignedAgents]);

  const handleAssign = () => {
    if (!selectedAgent) return;

    const newAssignedAgents = assignedAgents.find(a => a.id === selectedAgent.id)
      ? assignedAgents
      : [...assignedAgents, selectedAgent];

    setAssignedAgents(newAssignedAgents);
    setSelectedAgent(null);
    setQuery("");

    const agentIds = newAssignedAgents.map(agent => agent.id);

    router.post(`/company/${company.id}/assign-agents`, {
      agent_ids: agentIds,
    }, {
      onSuccess: () => {
        router.reload({ only: ['company'] });
      },
      onError: (errors) => {
        console.error('Error assigning agents:', errors);
        if (errors?.message) {
          alert(`Error: ${errors.message}`);
        } else if (typeof errors === 'string') {
          alert(`Error: ${errors}`);
        } else {
          alert('Failed to assign agents. Please check your permissions and try again.');
        }
      },
    });
  };

  useEffect(() => {
    const mappedAgents = mapCompanyAgentsToAgents(company.agents);
    setAssignedAgents(mappedAgents);
  }, [JSON.stringify(company.agents?.map(a => a.id).sort())]);

  // Check if user has already applied to this company
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetch(`/api/applied-company-ids`)
        .then(res => res.json())
        .then(data => {
          const appliedIds = data.applied_company_ids || [];
          setHasApplied(appliedIds.includes(company.id));
        })
        .catch(err => console.error('Failed to check application status:', err));
    }
  }, [isAuthenticated, user?.id, company.id]);


  const handleRemoveAgent = (agentId: number) => {
    const newAgents = assignedAgents.filter(agent => agent.id !== agentId);
    setAssignedAgents(newAgents);

    const agentIds = newAgents.map(agent => agent.id);

    router.post(`/company/${company.id}/assign-agents`, {
      agent_ids: agentIds,
    }, {
      onSuccess: () => {
        router.reload({ only: ['company'] });
      },
      onError: (errors) => {
        console.error('Error removing agent:', errors);
        if (errors?.message) {
          alert(`Error: ${errors.message}`);
        } else if (typeof errors === 'string') {
          alert(`Error: ${errors}`);
        } else {
          alert('Failed to remove agent. Please check your permissions and try again.');
        }
      },
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Company Details" />
      <div className='company-details-container px-4 sm:px-6 lg:px-8 py-4 sm:py-6'>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <Button
            onClick={() => window.history.back()}
            className="btn-back w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <AdminOnly>
            <div className="agent-search-container w-full sm:w-auto relative">
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <input
                  type="text"
                  placeholder="Search Agents..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="agent-search-input w-full sm:w-auto min-w-[200px]"
                />
                <Button
                  onClick={handleAssign}
                  disabled={!selectedAgent}
                  className="btn-add w-full sm:w-auto"
                >
                  Add
                </Button>
              </div>

              {filteredResults.length > 0 && (
                <ul className="agent-search-dropdown absolute z-50 w-full sm:w-auto min-w-[200px] mt-1">
                  {filteredResults.map(agent => (
                    <li
                      key={agent.id}
                      onClick={() => {
                        setSelectedAgent(agent);
                        setQuery(agent.name);
                      }}
                      className="agent-search-item"
                    >
                      <div className="font-semibold text-gray-900">{agent.name}</div>
                      <div className="text-gray-500 text-sm">{agent.email}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </AdminOnly>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 lg:gap-8 mb-8 sm:mb-12 p-4 sm:p-6 bg-card rounded-lg border relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 w-full lg:w-auto">
            <Avatar className="h-24 w-24 sm:h-32 sm:w-32 lg:h-40 lg:w-40 mx-auto sm:mx-0 flex-shrink-0">
              <AvatarImage
                className="object-contain"
                src={company.marketing?.logo_path ? `/storage/${company.marketing.logo_path}` : "/public/background/default-logo.png"}
                alt={`${company.brand_name} logo`}
                onError={(e) => { (e.target as HTMLImageElement).src = "/public/background/default-logo.png"; }}
              />
              <AvatarFallback className="text-xl sm:text-2xl lg:text-3xl">
                {getInitials(company.brand_name || company.company_name)}
              </AvatarFallback>
            </Avatar>

            <div className="text-center sm:text-left flex-1 min-w-0">
              <h1 className="company-name mb-2 text-xl sm:text-2xl lg:text-3xl break-words">{company.company_name}</h1>
              {company.brand_name && <p className="text-base sm:text-lg text-muted-foreground mb-2 break-words">{company.brand_name}</p>}
              {company.company_website && (
                <a
                  href={company.company_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium transition-colors text-sm sm:text-base break-all"
                >
                  {company.company_website}
                </a>
              )}
            </div>
          </div>
            
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto mt-4 lg:mt-0">
            {/* Apply Button */}
            {isAuthenticated ? (
              hasApplied ? (
                <Button
                  disabled
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-600 cursor-not-allowed"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Already Applied
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    router.post('/applicant/applications', { company_id: company.id }, {
                      onSuccess: () => {
                        setHasApplied(true);
                        toast.success('Application submitted successfully!');
                        router.reload({ only: ['auth'] });
                      },
                      onError: (errors) => {
                        console.error('Application error:', errors);
                        toast.error(errors?.message || 'Failed to submit application. Please try again.');
                      }
                    });
                  }}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Apply Now
                </Button>
              )
            ) : (
              <Link href={`/login?redirect=/companies/${company.id}/details`} className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Login to Apply
                </Button>
              </Link>
            )}

            <AdminOnly>
              {assignedAgents && assignedAgents.length > 0 ? (
                <div className="w-full lg:w-auto">
                  <label className="font-semibold text-muted-foreground block mb-2 sm:mb-0 sm:inline sm:mr-2">Assigned Agents:</label>
                  <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
                    {assignedAgents.map(agent => (
                      <span key={agent.id} className={`agent-badge text-xs sm:text-sm ${
                        company.user && company.user.id === agent.id 
                          ? 'agent-badge-owner' 
                          : 'agent-badge-assigned'
                      }`}>
                        <span className="break-words">{agent.name}</span>
                        {company.user && company.user.id === agent.id && <span className="text-xs font-bold ml-1">(Owner)</span>}
                        <button
                          onClick={() => handleRemoveAgent(agent.id)}
                          disabled={company.user && company.user.id === agent.id}
                          className="agent-remove-btn ml-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No agents assigned yet
                </div>
              )}
            </AdminOnly>
          </div>
        </div>

        <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            <section className="section-card p-4 sm:p-6">
              <h2 className="section-title text-lg sm:text-xl mb-4">Basic Information</h2>
              {renderTable([
                { key: "description", label: "Description", value: company.description },
                { key: "year_founded", label: "Year Founded", value: company.year_founded },
                { key: "num_franchise_locations", label: "Number of Franchise Locations", value: company.num_franchise_locations },
                { key: "city", label: "City", value: company.city },
                { key: "state_province", label: "State/Province", value: company.state_province },
                { key: "zip_code", label: "Zip Code", value: company.zip_code },
                { key: "country", label: "Country", value: company.country },
              ])}
            </section>

            <section className="section-card p-4 sm:p-6">
              <h2 className="section-title text-lg sm:text-xl mb-4">Company Background</h2>
              {renderTable([
                { key: "industry_sector", label: "Industry Sector", value: company.background?.industry_sector },
                { key: "years_in_operation", label: "Years in Operation", value: company.background?.years_in_operation },
                { key: "total_revenue", label: "Total Revenue", value: company.background?.total_revenue, format: "currency" },
                { key: "awards", label: "Awards", value: company.background?.awards },
                { key: "company_history", label: "Company History", value: company.background?.company_history },
              ])}
            </section>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            <details className="details-collapse p-4 sm:p-6">
              <summary className="section-title mb-0 text-base sm:text-lg cursor-pointer">Franchise Opportunity</summary>
              <div className="details-collapse-content mt-4">
                {renderTable([
                  { key: "franchise_type", label: "Franchise Type", value: company.opportunity?.franchise_type },
                  { key: "min_investment", label: "Minimum Investment", value: company.opportunity?.min_investment, format: "currency" },
                  { key: "franchise_fee", label: "Franchise Fee", value: company.opportunity?.franchise_fee, format: "currency" },
                  { key: "royalty_fee_structure", label: "Royalty Fee Structure", value: company.opportunity?.royalty_fee_structure },
                  { key: "avg_annual_revenue", label: "Average Annual Revenue", value: company.opportunity?.avg_annual_revenue, format: "currency" },
                  { key: "target_markets", label: "Target Markets", value: company.opportunity?.target_markets },
                  { key: "training_support", label: "Training Support", value: company.opportunity?.training_support },
                  { key: "franchise_term", label: "Franchise Term", value: company.opportunity?.franchise_term },
                  { key: "unique_selling_points", label: "Unique Selling Points", value: company.opportunity?.unique_selling_points },
                ])}
              </div>
            </details>

            <details className="details-collapse p-4 sm:p-6">
              <summary className="section-title mb-0 text-base sm:text-lg cursor-pointer">Requirements</summary>
              <div className="details-collapse-content mt-4">
                {renderTable([
                  { key: "min_net_worth", label: "Minimum Net Worth", value: company.requirements?.min_net_worth, format: "currency" },
                  { key: "min_liquid_assets", label: "Minimum Liquid Assets", value: company.requirements?.min_liquid_assets, format: "currency" },
                  { key: "prior_experience", label: "Prior Experience", value: company.requirements?.prior_experience ? 'Yes' : 'No' },
                  { key: "experience_type", label: "Experience Type", value: company.requirements?.experience_type },
                  { key: "other_qualifications", label: "Other Qualifications", value: company.requirements?.other_qualifications },
                ])}
              </div>
            </details>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            <details className="details-collapse p-4 sm:p-6">
              <summary className="section-title mb-0 text-base sm:text-lg cursor-pointer">Marketing Information</summary>
              <div className="details-collapse-content mt-4">
                {renderTable([
                  { key: "listing_title", label: "Listing Title", value: company.marketing?.listing_title },
                  { key: "listing_description", label: "Listing Description", value: company.marketing?.listing_description },
                  { key: "target_profile", label: "Target Profile", value: company.marketing?.target_profile },
                  { key: "preferred_contact_method", label: "Preferred Contact Method", value: company.marketing?.preferred_contact_method },
                ])}
              </div>
            </details>

            <details className="details-collapse p-4 sm:p-6">
              <summary className="section-title mb-0 text-base sm:text-lg cursor-pointer">Contact Information</summary>
              <div className="details-collapse-content mt-4">
                {renderTable([
                  { key: "contact_name", label: "Contact Name", value: `${company.user?.first_name} ${company.user?.last_name}` },
                  { key: "email", label: "Email", value: company.user?.email },
                ])}
              </div>
            </details>
          </div>

          <PermissionGate permission="view_company_dashboard" fallback={null}>
            <section className="section-card p-4 sm:p-6">
              <h2 className="section-title text-lg sm:text-xl mb-4">Documents</h2>
              {company.documents ? (
                <div className="space-y-3">
                  {[
                    { label: "DTI/SBC", path: company.documents.dti_sbc_path },
                    { label: "BIR 2303", path: company.documents.bir_2303_path },
                    { label: "IPO Registration", path: company.documents.ipo_registration_path },
                  ].map((doc, index) => (
                    <div key={index} className="document-item flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 border rounded-lg">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {doc.path && doc.path.match(/\.(jpg|jpeg|png)$/i) ? (
                          <img
                            src={`/storage/${doc.path}`}
                            alt={doc.label}
                            className="document-thumbnail w-12 h-12 sm:w-16 sm:h-16 object-cover rounded flex-shrink-0"
                          />
                        ) : (
                          <span className="document-label font-medium">{doc.label}</span>
                        )}
                        {!doc.path && <span className="document-label font-medium">{doc.label}</span>}
                      </div>
                      {doc.path ? (
                        <Button
                          variant="secondary"
                          onClick={() => window.open(`/storage/${doc.path}`, "_blank")}
                          className="btn-view w-full sm:w-auto"
                        >
                          View File
                        </Button>
                      ) : (
                        <span className="text-sm text-gray-500">Not uploaded</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No documents available</p>
              )}
            </section>
          </PermissionGate>
        </div>
      </div>
    </AppLayout>
  );
};

export default CompanyFullDetails;