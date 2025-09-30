import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import type { BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Edit, Eye, Trash2 } from 'lucide-react';
import { ErrorBoundary } from '@/components/ui/error-boundary';

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
  status?: string | null;
};

type Props = {
  companies: Company[];
};

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: (dashboard() as any)?.url ?? '/dashboard' },
  { title: 'Companies', href: '/companies' },
];

function Index({ companies = [] }: Props) {
  const columns: Column<Company>[] = [
    {
      key: 'logo',
      title: 'Logo',
      dataIndex: 'logo_url',
      width: '80px',
      render: (value, record) => (
        <div className="flex items-center justify-center">
          {value ? (
            <img
              src={value}
              className="h-12 w-12 rounded-lg object-cover border"
              alt={`${record.company_name} Logo`}
            />
          ) : (
            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
              <Building2 className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'company_name',
      title: 'Company Name',
      dataIndex: 'company_name',
      sortable: true,
      render: (value, record) => (
        <div>
          <div className="font-medium">{value}</div>
          {record.brand_name && (
            <div className="text-sm text-muted-foreground">{record.brand_name}</div>
          )}
        </div>
      ),
    },
    {
      key: 'franchise_type',
      title: 'Franchise Type',
      dataIndex: 'opportunity.franchise_type',
      sortable: true,
      render: (value) => value || '—',
    },
    {
      key: 'year_founded',
      title: 'Founded',
      dataIndex: 'year_founded',
      sortable: true,
      render: (value) => value || '—',
    },
    {
      key: 'country',
      title: 'Country',
      dataIndex: 'country',
      sortable: true,
      render: (value) => value || '—',
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      sortable: true,
      render: (value) => {
        if (!value) return '—';
        return (
          <Badge 
            variant={value === 'approved' ? 'success' : value === 'pending' ? 'warning' : 'destructive'}
          >
            {value}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      title: 'Actions',
      dataIndex: 'id',
      width: '120px',
      render: (value, record) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/companies/${value}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/companies/${value}/edit`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <ErrorBoundary>
      <Head title="Companies" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Companies</h1>
            <p className="text-muted-foreground">
              Manage and view all registered companies
            </p>
          </div>
          <Button asChild>
            <Link href="/company/register">
              <Building2 className="mr-2 h-4 w-4" />
              Register Company
            </Link>
          </Button>
        </div>

        <DataTable
          data={companies}
          columns={columns}
          searchable={true}
          searchPlaceholder="Search companies..."
          emptyMessage="No companies registered yet. Click 'Register Company' to add one."
          className="w-full"
        />
      </div>
    </ErrorBoundary>
  );
}

Index.layout = (page: React.ReactNode) => <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>;
export default Index;