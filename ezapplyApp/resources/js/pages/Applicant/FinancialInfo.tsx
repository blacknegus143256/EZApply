// resources/js/Pages/Applicant/FinancialInfo.tsx
import React from "react";
import AppLayout from "@/layouts/app-layout";
import { PlaceholderPattern } from "@/components/ui/placeholder-pattern";
import { dashboard, applicantFinancial } from "@/routes";
import { type BreadcrumbItem } from "@/types";
import { useForm, Head } from "@inertiajs/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const breadcrumbs: BreadcrumbItem[] = [
	{ title: "Dashboard", href: dashboard() },
	{ title: "Financial Info", href: applicantFinancial() }
];

interface FinancialInfoProps {
	financial?: {
		annual_income?: number;
		salary?: number;
	} | null;
}

export default function FinancialInfo({ financial }: FinancialInfoProps) {
	const { data, setData, post, processing, errors } = useForm({
		annual_income: financial?.annual_income ?? "",
		salary: financial?.salary ?? "",
	});

	const formatNumber = (value: string) => {
		const cleaned = value.replace(/[^0-9.]/g, "");
		const parts = cleaned.split(".");
		parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		return parts.join(".");
	};

	const parseNumber = (value: string) => value.replace(/,/g, "");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		post("/applicant/financial");
	};

	return (
			<div className="p-4">
				<div className="mb-6">
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Information</h1>
					<p className="text-gray-600 dark:text-gray-400 mt-2">Provide your current income details.</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Annual Income</label>
						<Input
							type="text"
							inputMode="numeric"
							value={formatNumber(String(data.annual_income))}
							onChange={(e) => setData("annual_income", parseNumber(e.target.value))}
							placeholder="e.g., 1,000,000"
							required
						/>
						{(errors as any).annual_income && <p className="text-red-600 text-sm mt-1">{(errors as any).annual_income}</p>}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Monthly Salary</label>
						<Input
							type="text"
							inputMode="numeric"
							value={formatNumber(String(data.salary))}
							onChange={(e) => setData("salary", parseNumber(e.target.value))}
							placeholder="e.g., 40,000"
							required
						/>
						{(errors as any).salary && <p className="text-red-600 text-sm mt-1">{(errors as any).salary}</p>}
					</div>

					<div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
						<Button type="submit" disabled={processing} className="px-8">
							{processing ? "Saving..." : "Save"}
						</Button>
					</div>
				</form>
			</div>
	);
}


