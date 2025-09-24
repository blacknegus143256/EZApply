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
    	income_source?: string;
		monthly_income?: number;
		other_income?: string;
		monthly_expenses?: number;
		existing_loans?: number
	} | null;
}

export default function FinancialInfo({ financial }: FinancialInfoProps) {
	const { data, setData, post, processing, errors } = useForm({
    	income_source: financial?.income_source ?? "",
		monthly_income: financial?.monthly_income ?? "",
		other_income: financial?.other_income ?? "",
		monthly_expenses: financial?.monthly_expenses ?? "",
		existing_loans: financial?.existing_loans ?? "",
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
				<div className="mb-6 hero">
					<h1 className="text-2xl font-bold text-white dark:text-white">Financial Information</h1>
					<p className="text-white dark:text-gray-400 mt-2">Provide your current income details.</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Primary Income Source
						</label>
						<Input
							type="text"
							value={data.income_source}
							onChange={(e) => setData("income_source", e.target.value)}
							placeholder="e.g., Employment, Business, Freelance"
						/>
						{errors.income_source && (
							<p className="text-red-600 text-sm mt-1">{errors.income_source}</p>
						)}
						</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Monthly Income</label>
						<Input
							type="text"
							inputMode="numeric"
							value={formatNumber(String(data.monthly_income))}
							onChange={(e) => setData("monthly_income", parseNumber(e.target.value))}
							placeholder="e.g., 1,000,000"
						/>
						{errors.monthly_income && <p className="text-red-600 text-sm mt-1">{errors.monthly_income}</p>}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Other Income (Optional)
						</label>
						<Input
							type="text"
							value={data.other_income}
							onChange={(e) => setData("other_income", e.target.value)}
							placeholder="e.g., Side business, rental"
						/>
						{errors.other_income && (
							<p className="text-red-600 text-sm mt-1">{errors.other_income}</p>
						)}
						</div>

						{/* Monthly Expenses */}
						<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Monthly Expenses
						</label>
						<Input
							type="text"
							inputMode="numeric"
							value={formatNumber(String(data.monthly_expenses))}
							onChange={(e) =>
							setData("monthly_expenses", parseNumber(e.target.value))
							}
							placeholder="e.g., 20,000"
						/>
						{errors.monthly_expenses && (
							<p className="text-red-600 text-sm mt-1">
							{errors.monthly_expenses}
							</p>
						)}
						</div>

						{/* Existing Loans */}
						<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Existing Loans
						</label>
						<Input
							type="text"
							inputMode="numeric"
							value={formatNumber(String(data.existing_loans))}
							onChange={(e) =>
							setData("existing_loans", parseNumber(e.target.value))
							}
							placeholder="e.g., 100,000"
						/>
						{errors.existing_loans && (
							<p className="text-red-600 text-sm mt-1">{errors.existing_loans}</p>
						)}
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


