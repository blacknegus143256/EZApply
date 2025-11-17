import React, { useState, useEffect, useMemo } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useInitials } from '@/hooks/use-initials';
import { ArrowLeft } from 'lucide-react';
import { BreadcrumbItem } from '@/types';
import type { CompanyDetails } from '@/types/company';
import PermissionGate, { AdminOnly } from '@/components/PermissionGate';
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
  <table className="w-full text-sm">
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

const getUserDisplayName = (user: any): string => {
  if (!user) return '';
  if (user.basicInfo && (user.basicInfo.first_name || user.basicInfo.last_name)) {
    return `${user.basicInfo.first_name || ''} ${user.basicInfo.last_name || ''}`.trim();
  }
  if (user.first_name || user.last_name) {
    return `${user.first_name || ''} ${user.last_name || ''}`.trim();
  }
  return user.email || '';
};

const CompanyFullDetails: React.FC = () => {
  const { props } = usePage<{ company: CompanyDetails; allAgents?: Agent[] }>();
  const company = props.company;
  const allAgentsFromProps = props.allAgents || [];
  const getInitials = useInitials();

  const [query, setQuery] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [assignedAgents, setAssignedAgents] = useState<Agent[]>(() => {
    const agentsFromRelation = mapCompanyAgentsToAgents(company.agents || []);
    
    if (company.user) {
      const ownerAgent: Agent = {
        id: company.user.id,
        name: getUserDisplayName(company.user),
        email: company.user.email,
        role: 'company',
      };
      
      const ownerExists = agentsFromRelation.some(a => a.id === ownerAgent.id);
      if (!ownerExists) {
        agentsFromRelation.unshift(ownerAgent); 
      }
    }
    
    console.log('Initializing assignedAgents:', agentsFromRelation);
    return agentsFromRelation;
  });

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
    const agentsFromRelation = mapCompanyAgentsToAgents(company.agents || []);
    

    if (company.user) {
      const ownerAgent: Agent = {
        id: company.user.id,
        name: getUserDisplayName(company.user),
        email: company.user.email,
        role: 'company',
      };
      
      const ownerExists = agentsFromRelation.some(a => a.id === ownerAgent.id);
      if (!ownerExists) {
        agentsFromRelation.unshift(ownerAgent);
      }
    }
    
    console.log('useEffect: assignedAgents updated:', agentsFromRelation);
    setAssignedAgents(agentsFromRelation);
  }, [company.id, company.user, company.agents]);


  const handleRemoveAgent = (agentId: number) => {
    if (company.user && company.user.id === agentId) {
      alert('Cannot remove the company owner. The owner must always be associated with the company.');
      return;
    }

    const newAgents = assignedAgents.filter(agent => agent.id !== agentId);
    setAssignedAgents(newAgents);

    const agentIds = newAgents.map(agent => agent.id);

    router.post(`/company/${company.id}/assign-agents`, {
      agent_ids: agentIds,
    }, {
      onSuccess: () => {
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
    <>
      <Head title="Company Details" />
      <div className='company-details-container'>

        <div className="flex justify-between items-center mb-6">
          <Button
            onClick={() => window.history.back()}
            className="btn-back"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <AdminOnly>
            <div className="agent-search-container">
              <input
                type="text"
                placeholder="Search Agents..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="agent-search-input"
              />
              <Button
                onClick={handleAssign}
                disabled={!selectedAgent}
                className="btn-add"
              >
                Add
              </Button>

              {filteredResults.length > 0 && (
                <ul className="agent-search-dropdown">
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

        <div className="company-header-card mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="flex items-center gap-6 flex-1">
              <Avatar className="company-avatar h-32 w-32 md:h-40 md:w-40">
                <AvatarImage
                  className="object-contain"
                  src={company.marketing?.logo_path ? `/storage/${company.marketing.logo_path}` : "/storage/logos/default-logo.png"}
                  alt={`${company.brand_name} logo`}
                  onError={(e) => { (e.target as HTMLImageElement).src = "/storage/logos/default-logo.png"; }}
                />
                <AvatarFallback className="text-3xl">
                  {getInitials(company.brand_name || company.company_name)}
                </AvatarFallback>
              </Avatar>

              <div className="text-center md:text-left flex-1">
                <h1 className="company-name mb-2">{company.company_name}</h1>
                {company.brand_name && <p className="text-lg text-muted-foreground mb-2">{company.brand_name}</p>}
                {company.company_website && (
                  <a
                    href={company.company_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium transition-colors"
                  >
                    {company.company_website}
                  </a>
                )}
              </div>
            </div>
            
            <AdminOnly>
            {assignedAgents && assignedAgents.length > 0 ? (
              <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
                <label className="font-semibold text-muted-foreground">Assigned Agents:</label>
                {assignedAgents.map(agent => (
                  <span key={agent.id} className={`agent-badge ${
                    company.user && company.user.id === agent.id 
                      ? 'agent-badge-owner' 
                      : 'agent-badge-assigned'
                  }`}>
                    {agent.name}
                    {company.user && company.user.id === agent.id && <span className="text-xs font-bold">(Owner)</span>}
                      <button
                        onClick={() => handleRemoveAgent(agent.id)}
                        disabled={company.user && company.user.id === agent.id}
                        className="agent-remove-btn"
                      >
                        ×
                      </button>
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No agents assigned yet
              </div>
            )}
            </AdminOnly>
          </div>
        </div>

        <div className="max-w-6xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="section-card">
            <h2 className="section-title">Basic Information</h2>
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

          <section className="section-card">
            <h2 className="section-title">Company Background</h2>
            {renderTable([
              { key: "industry_sector", label: "Industry Sector", value: company.background?.industry_sector },
              { key: "years_in_operation", label: "Years in Operation", value: company.background?.years_in_operation },
              { key: "total_revenue", label: "Total Revenue", value: company.background?.total_revenue, format: "currency" },
              { key: "awards", label: "Awards", value: company.background?.awards },
              { key: "company_history", label: "Company History", value: company.background?.company_history },
            ])}
          </section>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <details className="details-collapse">
            <summary className="section-title mb-0">Franchise Opportunity</summary>
            <div className="details-collapse-content">
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

          <details className="details-collapse">
            <summary className="section-title mb-0">Requirements</summary>
            <div className="details-collapse-content">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <details className="details-collapse">
            <summary className="section-title mb-0">Marketing Information</summary>
            <div className="details-collapse-content">
              {renderTable([
                { key: "listing_title", label: "Listing Title", value: company.marketing?.listing_title },
                { key: "listing_description", label: "Listing Description", value: company.marketing?.listing_description },
                { key: "target_profile", label: "Target Profile", value: company.marketing?.target_profile },
                { key: "preferred_contact_method", label: "Preferred Contact Method", value: company.marketing?.preferred_contact_method },
              ])}
            </div>
          </details>

          <details className="details-collapse">
            <summary className="section-title mb-0">Contact Information</summary>
            <div className="details-collapse-content">
              {renderTable([
                { key: "contact_name", label: "Contact Name", value: getUserDisplayName(company.user) },
                { key: "email", label: "Email", value: company.user?.email },
              ])}
            </div>
          </details>
        </div>

        <PermissionGate permission="view_company_dashboard" fallback={null}>
          <section className="section-card">
            <h2 className="section-title">Documents</h2>
            {company.documents ? (
              <div className="space-y-3">
                {[
                  { label: "DTI/SBC", path: company.documents.dti_sbc_path },
                  { label: "BIR 2303", path: company.documents.bir_2303_path },
                  { label: "IPO Registration", path: company.documents.ipo_registration_path },
                ].map((doc, index) => (
                  <div key={index} className="document-item">
                    <div className="flex items-center gap-3 flex-1">
                      {doc.path && doc.path.match(/\.(jpg|jpeg|png)$/i) ? (
                        <img
                          src={`/storage/${doc.path}`}
                          alt={doc.label}
                          className="document-thumbnail"
                        />
                      ) : (
                        <span className="document-label">{doc.label}</span>
                      )}
                      {!doc.path && <span className="document-label">{doc.label}</span>}
                    </div>
                    {doc.path ? (
                      <Button
                        variant="secondary"
                        onClick={() => window.open(`/storage/${doc.path}`, "_blank")}
                        className="btn-view"
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
    </>
  );
};

export default CompanyFullDetails;