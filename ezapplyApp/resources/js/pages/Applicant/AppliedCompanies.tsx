import { Head, usePage, Link } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { Building2, User } from "lucide-react";

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Applied Companies", href: "/applicant/franchise/appliedcompanies" },
];

type PageProps = {
  applications?: Application[];
};

type Application = {
  id: number;
  status: string;
  desired_location?: string | null;
  deadline_date?: string | null;
  company: {
    id: number;
    company_name: string;
    user?: { id: number; first_name: string; last_name: string; email: string };
  };
};

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    approved: 'bg-green-100 text-green-800 border-green-300',
    rejected: 'bg-red-100 text-red-800 border-red-300',
    interested: 'bg-blue-100 text-blue-800 border-blue-300',
  };
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  const cls = map[status] || map['pending'];
  return <span className={`ml-auto inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${cls}`}>{label}</span>;
}

export default function AppliedCompanies() {
  const { props } = usePage<PageProps>();
  const applications = props.applications ?? [];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Applied Companies" />

      <div className="p-6 bg-white dark:bg-neutral-900 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-4">
          Applied Companies
        </h1>

        {applications.length === 0 ? (
          <p className="text-neutral-600 dark:text-neutral-400">
            No applications yet. Go back and apply to companies to see them here.
          </p>
        ) : (
          <div className="space-y-2">
            {applications.map((a) => (
              <div
                key={a.id}
                className="w-full flex items-center px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700"
              >
                <span className="flex items-center font-semibold text-gray-900 dark:text-gray-100">
                  <Building2 className="w-4 h-4 mr-1 text-blue-500" />{a.company.company_name}
                </span>
                <span className="mx-2 text-neutral-400">•</span>
                <span className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <User className="w-4 h-4 mr-1 text-gray-400" />
                  {a.company.user ? `${a.company.user.first_name} ${a.company.user.last_name}` : 'Unknown User'}
                </span>
                <StatusBadge status={a.status || 'pending'} />
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
