import React, { useState, useEffect } from "react";
import { Link, usePage } from "@inertiajs/react";
import { Search, Filter, MapPin, Calendar, DollarSign, Building2, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import Services from "./services";
import About from "./about";
import EzNav from "./ezapply-nav";

interface Company {
  id: number;
  company_name: string;
  brand_name?: string;
  city?: string;
  state_province?: string;
  country?: string;
  description?: string;
  year_founded?: number;
  num_franchise_locations?: number;
  status?: string;
  opportunity?: {
    franchise_type?: string;
    min_investment?: number;
    franchise_fee?: number;
  };
  marketing?: {
    listing_description?: string;
    logo_path?: string;
  };
}

export default function ImprovedEasyApplyLanding({ user }: { user?: any }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [checked, setChecked] = useState<number[]>([]);
  const [type, setType] = useState("all");
  const [amount, setAmount] = useState("all");
  const [visibleCount, setVisibleCount] = useState(6);

  const handleCheck = (companyId: number) => {
    setChecked((prev) =>
      prev.includes(companyId)
        ? prev.filter((id) => id !== companyId)
        : [...prev, companyId]
    );
  };

  const handleApplySelected = () => {
    if (checked.length === 0) return;
    // Handle application logic here
    console.log("Applying to companies:", checked);
  };

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const response = await fetch("/companies");
        if (!response.ok) throw new Error("Failed to fetch companies");
        const data = await response.json();
        setCompanies(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch companies");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  // Extract franchise types dynamically
  const franchiseTypes = Array.from(
    new Set(companies.map((c) => c.opportunity?.franchise_type).filter(Boolean))
  );

  // Filtering logic
  let filtered = companies.filter((c) => c.status === "approved");

  if (type !== "all") {
    filtered = filtered.filter((c) => c.opportunity?.franchise_type === type);
  }

  if (amount !== "all") {
    filtered = filtered.filter((c) => {
      const value = c.opportunity?.min_investment || 0;
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

  const formatInvestment = (amount: number) => {
    if (amount >= 1000000) {
      return `₱${(amount / 1000000).toFixed(1)}M`;
    }
    return `₱${amount.toLocaleString()}`;
  };

  const CompanyCard = ({ company }: { company: Company }) => (
    <Card className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={checked.includes(company.id)}
              onCheckedChange={() => handleCheck(company.id)}
              className="mt-1"
            />
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold line-clamp-1">
                {company.company_name}
              </CardTitle>
              {company.brand_name && (
                <CardDescription className="text-sm">
                  {company.brand_name}
                </CardDescription>
              )}
            </div>
          </div>
          {company.status && (
            <Badge 
              variant={company.status === 'approved' ? 'success' : 'secondary'}
              className="ml-2"
            >
              {company.status}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {company.marketing?.listing_description || company.description || 'No description available'}
        </p>
        
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">
              {[company.city, company.state_province, company.country]
                .filter(Boolean)
                .join(', ') || 'Location not specified'}
            </span>
          </div>
          
          {company.year_founded && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span>Est. {company.year_founded}</span>
            </div>
          )}
          
          {company.opportunity?.min_investment && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4 flex-shrink-0" />
              <span>From {formatInvestment(company.opportunity.min_investment)}</span>
            </div>
          )}
          
          {company.opportunity?.franchise_type && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4 flex-shrink-0" />
              <span>{company.opportunity.franchise_type}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <EzNav user={users} />
        
        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Find Your Perfect <span className="text-blue-600">Franchise</span> Today
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Browse trusted opportunities and grow your business with confidence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8">
                <Link href="/list-companies">Browse All Companies</Link>
              </Button>
              <Button variant="outline" size="lg" className="px-8">
                <Link href="#services">Our Services</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Filter Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Find Your Perfect Franchise</CardTitle>
                <CardDescription className="text-center">
                  Use our filters to find companies that match your investment goals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search companies..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Franchise Type</label>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {franchiseTypes.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Investment Range</label>
                    <Select value={amount} onValueChange={setAmount}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Amounts" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Amounts</SelectItem>
                        <SelectItem value="1m">₱1,000,000+</SelectItem>
                        <SelectItem value="10m">₱10,000,000+</SelectItem>
                        <SelectItem value="35m">₱35,000,000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Companies Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8" id="companies">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Available Franchises
                </h2>
                <p className="text-gray-600">
                  {filtered.length} companies found
                  {checked.length > 0 && ` • ${checked.length} selected`}
                </p>
              </div>
              
              {checked.length > 0 && (
                <Button onClick={handleApplySelected} className="mt-4 sm:mt-0">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Apply to Selected ({checked.length})
                </Button>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-muted rounded mb-2" />
                      <div className="h-4 bg-muted rounded w-3/4" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded" />
                        <div className="h-4 bg-muted rounded w-2/3" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="text-destructive mb-4">
                    <Filter className="h-12 w-12 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">Failed to load companies</h3>
                    <p className="text-muted-foreground">{error}</p>
                  </div>
                  <Button onClick={() => window.location.reload()}>
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            ) : filtered.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="text-muted-foreground mb-4">
                    <Search className="h-12 w-12 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">No companies found</h3>
                    <p>Try adjusting your search criteria</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filtered.slice(0, visibleCount).map((company) => (
                    <CompanyCard key={company.id} company={company} />
                  ))}
                </div>
                
                {filtered.length > visibleCount && (
                  <div className="text-center mt-8">
                    <Button
                      variant="outline"
                      onClick={() => setVisibleCount(prev => prev + 6)}
                    >
                      Load More Companies
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        <Services />
        <About />
      </div>
    </ErrorBoundary>
  );
}
