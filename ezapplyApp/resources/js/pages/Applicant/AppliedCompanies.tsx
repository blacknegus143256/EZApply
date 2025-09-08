import { Head, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Chats", href: "/applicant/franchise/chats" },
];

type PageProps = {
  selectedCompanies?: Company[];
};
type Company = {
  id: number;
  company_name: string;
  description?: string;
  opportunity: {
    franchise_type: string;
    min_investment: number;
  };
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
};


const ChatsPage = () => {
  const { props } = usePage<PageProps>();
  const companies = props.selectedCompanies ?? []; // fallback if none passed

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Applied Companies" />

      <div className="p-6 bg-white dark:bg-neutral-900 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-4">
          Applied Companies
        </h1>

        {companies.length === 0 ? (
          <p className="text-neutral-600 dark:text-neutral-400">
            No companies selected. Go back and apply to start chatting.
          </p>
        ) : (
          <div className="space-y-2">
            {companies.map((c) => (
              <button
            key={c.id}
            className="w-full flex justify-between items-center px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
          >
            <span className="font-semibold">{c.company_name}</span>
            <span className="text-sm text-neutral-500">
              {c.user?`
              ${c.user?.first_name} ${c.user.last_name}` : "Unknown User"}
            </span>
          </button>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ChatsPage;
