import React, { useState, useEffect } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
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
import Contact from "./contact";
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
  const [visibleCount, setVisibleCount] = useState(3);

  const handleCheck = (companyId: number) => {
    setChecked((prev) =>
      prev.includes(companyId)
        ? prev.filter((id) => id !== companyId)
        : [...prev, companyId]
    );
  };

  const handleApplySelected = ({ user }: { user?: any }) => {
    const isVerified =
    !!user && typeof user === "object" && Object.keys(user).length > 0;
    if (checked.length === 0) return;
    console.log("Applying to companies:", checked);
    if(!isVerified){
      window.location.href = '/login';
    }
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
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:-translate-y-1 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={checked.includes(company.id)}
              onCheckedChange={() => handleCheck(company.id)}
              className="mt-1 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
            <div className="flex-1">
              <CardTitle className="text-xl font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                {company.company_name}
              </CardTitle>  
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3 text-sm">
                  
        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
          {company.marketing?.listing_description || company.description || 'No description available'}
        </p>
          <div className="flex items-center gap-3 text-gray-600">
            <div className="p-2 bg-blue-50 rounded-lg">
              <MapPin className="h-4 w-4 text-blue-600" />
            </div>
            <span className="truncate font-medium">
              {[company.city, company.state_province, company.country]
                .filter(Boolean)
                .join(', ') || 'Location not specified'}
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
          
          {company.opportunity?.min_investment && (
            <div className="flex items-center gap-3 text-gray-600">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <DollarSign className="h-4 w-4 text-yellow-600" />
              </div>
              <span className="font-medium">From {formatInvestment(company.opportunity.min_investment)}</span>
            </div>
          )}
          
          {company.opportunity?.franchise_type && (
            <div className="flex items-center gap-3 text-gray-600">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Building2 className="h-4 w-4 text-purple-600" />
              </div>
              <span className="font-medium">{company.opportunity.franchise_type}</span>
            </div>
          )}
        </div>
        
        <div className="pt-3 border-t border-gray-100">
          <Button 
            variant="outline" 
            className="w-full group-hover:bg-blue-50 group-hover:border-blue-200 group-hover:text-blue-700 transition-all duration-200"
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ErrorBoundary>
      <Head title="EZ Apply PH" />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <EzNav user={users} />
        
        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-200 via-white to-blue-200"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full -translate-y-48 translate-x-48 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-100 rounded-full translate-y-40 -translate-x-40 opacity-20"></div>
          
          <div className="relative max-w-7xl mx-auto text-center">
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight mt-2">
              Find Your Perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-indigo-500">Franchise</span> Today
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Discover vetted franchise opportunities and grow your business with confidence. 
              Join thousands of successful entrepreneurs who found their perfect match.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                <Link href="/list-companies" className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Browse All Companies
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-3 text-lg font-semibold border-2 hover:bg-blue-50 transition-all duration-300">
                <Link href="#services" className="flex items-center gap-2">
                  Our Services
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
                <div className="text-gray-600">Franchise Opportunities</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
                <div className="text-gray-600">Successful Entrepreneurs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">95%</div>
                <div className="text-gray-600">Success Rate</div>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Section */}
        <section  className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-5 to-blue-200 border border-black-600 inset-shadow-sm" id="filters" >
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Find Your Perfect Franchise</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Use our advanced filters to discover franchise opportunities that match your investment goals and business interests
              </p>
            </div>
            
            <Card className="shadow-lg border-0">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search companies by name, industry, or location..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-12 h-12 text-lg border-2 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Franchise Type
                      </label>
                      <Select value={type} onValueChange={setType}>
                        <SelectTrigger className="h-12 border-2 focus:border-blue-500">
                          <SelectValue placeholder="Select franchise type" />
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
                    
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Investment Range
                      </label>
                      <Select value={amount} onValueChange={setAmount}>
                        <SelectTrigger className="h-12 border-2 focus:border-blue-500">
                          <SelectValue placeholder="Select investment range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Amounts</SelectItem>
                          <SelectItem value="1m">₱1,000,000 - ₱5,000,000</SelectItem>
                          <SelectItem value="10m">₱5,000,000 - ₱15,000,000</SelectItem>
                          <SelectItem value="35m">₱15,000,000+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      {filtered.length} companies found
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearch('');
                        setType('all');
                        setAmount('all');
                      }}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Companies Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50 inset-shadow-sm" id="companies">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Available Franchise Opportunities
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover vetted franchise opportunities from established companies across various industries
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{filtered.length}</div>
                  <div className="text-sm text-gray-600">Companies Found</div>
                </div>
                {checked.length > 0 && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{checked.length}</div>
                    <div className="text-sm text-gray-600">Selected</div>
                  </div>
                )}
              </div>
              
              {checked.length > 0 && (
                <Button 
                  onClick={handleApplySelected} 
                  className="mt-4 sm:mt-0 bg-green-600 hover:bg-green-700 text-white px-6 py-3 text-lg font-semibold shadow-lg"
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Apply to Selected ({checked.length})
                </Button>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
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
                    <Link href={'/list-companies'} className="text-blue-600 hover:underline">More Companies</Link>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        <Services />
        <About />
        <Contact />
      </div>
    </ErrorBoundary>
  );
}
