import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import type { BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';

type Company = {
  id: number;
  company_name: string;
  brand_name?: string | null;
  opportunity?: {
    franchise_type?: string | null;
  };
  year_founded?: number | null;
  country?: string | null;
  logo_url?: string | null;
  status?: string | null; // Added status field
};

type Props = {
  companies: Company[];
};

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: (dashboard() as any)?.url ?? '/dashboard' },
  { title: 'Companies', href: '/companies' },
];

function Index({ companies = [] }: Props) {
  const hasCompanies = companies.length > 0;

  function renderTableRow(company: Company) {
    return (
      <tr key={company.id}>
        <td className="p-4">
          {company.logo_url ? (
            <img
              src={company.logo_url}
              className="h-16 w-16 rounded-xl object-cover border"
              alt={`${company.company_name} Logo`}
            />
          ) : (
            <div className="h-16 w-16 rounded-xl bg-neutral-200 flex items-center justify-center text-neutral-500">
              Logo
            </div>
          )}
        </td>
        <td className="p-4">{company.company_name}</td>
        <td className="p-4">{company.brand_name || '—'}</td>
        <td className="p-4">{company.opportunity?.franchise_type || '—'}</td>
        <td className="p-4">{company.year_founded || '—'}</td>
        <td className="p-4">{company.country || '—'}</td>
        <td className="p-4">{company.status || '—'}</td> {}
        <td className="p-4">
          <Link
            href={`/companies/${company.id}/edit`}
            className="text-blue-500 hover:underline"
          >
            Edit
          </Link>
        </td>
      </tr>
    );
  }

  return (
    <>
      <Head title="Companies" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Companies</h1>
          {/* <Link href="/Company/FranchiseRegister" className="rounded-lg border px-4 py-2 hover:bg-neutral-50">
            Register Company
          </Link> */}
        </div>

        {hasCompanies ? (
          <div className="rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-neutral-100">
                <tr>
                  <th className="p-4 text-left">Logo</th>
                  <th className="p-4 text-left">Company Name</th>
                  <th className="p-4 text-left">Brand Name</th>
                  <th className="p-4 text-left">Franchise Type</th>
                  <th className="p-4 text-left">Year Founded</th>
                  <th className="p-4 text-left">Country</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="[&>tr:nth-child(even)]:bg-neutral-50">
                {companies.map(renderTableRow)}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border p-6 text-neutral-700">
            <p>No companies registered yet.</p>
            <p className="mt-2">
              Click <Link className="underline" href="/company/register">here</Link> to add a company.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

Index.layout = (page: React.ReactNode) => <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>;
export default Index;