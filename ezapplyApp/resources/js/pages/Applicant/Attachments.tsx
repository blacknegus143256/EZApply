// resources/js/Pages/Applicant/Attachments.tsx
import React from "react";
import AppLayout from "@/layouts/app-layout";
import { PlaceholderPattern } from "@/components/ui/placeholder-pattern";
import { dashboard, applicantAttachments } from "@/routes";
import { type BreadcrumbItem } from "@/types";
import { useForm, Head, router } from "@inertiajs/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PermissionGate from '@/components/PermissionGate';
import '../../../css/easyApply.css';

const breadcrumbs: BreadcrumbItem[] = [
	{ title: "Dashboard", href: dashboard() },
	{ title: "Attachments", href: applicantAttachments() }
];

interface Attachment {
	id: number;
	attachment_type: string;
	attachment_path: string;
}

interface AttachmentsProps {
	attachments?: Attachment[];
}

export default function Attachments({ attachments = [] }: AttachmentsProps) {
	const { data, setData, post, processing, errors, reset } = useForm<{ attachment_type: string; attachment: File | null }>({
		attachment_type: "resume",
		attachment: null,
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		post("/applicant/attachments", {
			forceFormData: true,
			onSuccess: () => {
				reset();
			},
		});
	};

	const handleDelete = (id: number) => {
		router.delete(`/applicant/attachments/${id}`);
	};

	return (
			<div className="p-4">
				<form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
						<select
							className="w-full rounded-md border border-gray-300 bg-white p-2 dark:bg-gray-800 dark:border-gray-700"
							value={data.attachment_type}
							onChange={(e) => setData("attachment_type", e.target.value)}
						>
							<option value="resume">Resume/CV</option>
							<option value="cover_letter">Cover Letter</option>
							<option value="portfolio">Portfolio</option>
							<option value="CVs">CVs</option>
							<option value="other">Other</option>
						</select>
						{(errors as any).attachment_type && <p className="text-red-600 text-sm mt-1">{(errors as any).attachment_type}</p>}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">File</label>
						<Input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={(e) => setData("attachment", e.target.files?.[0] ?? null)} />
						{(errors as any).attachment && <p className="text-red-600 text-sm mt-1">{(errors as any).attachment}</p>}
					</div>

					<div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
						<Button type="submit" disabled={processing} className="px-8">
							{processing ? "Uploading..." : "Upload"}
						</Button>
					</div>
				</form>

				{attachments.length > 0 && (
					<div className="mt-10">
						<h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Files</h2>
						<ul className="space-y-3">
							{attachments.map((a) => (
								<li key={a.id} className="flex items-center justify-between rounded-lg border p-3 dark:border-gray-700">
									<span className="text-sm text-gray-700 dark:text-gray-300">{a.attachment_type} — {a.attachment_path}</span>
									<Button variant="outline" onClick={() => handleDelete(a.id)}>Delete</Button>
								</li>
							))}
						</ul>
					</div>
				)}
			</div>
	);
}


