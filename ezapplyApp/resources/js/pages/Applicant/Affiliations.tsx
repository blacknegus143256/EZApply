// resources/js/Pages/Applicant/Affiliations.tsx
import React, { useState } from "react";
import { PlaceholderPattern } from "@/components/ui/placeholder-pattern";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import { type BreadcrumbItem } from "@/types";
import { useForm, Head } from "@inertiajs/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Dashboard", href: dashboard() },
  { title: "Affiliations", href: "/applicant/affiliations" }
];

interface Affiliation {
  id?: number;
  institution: string;
  position: string;
}

interface AffiliationsProps {
  affiliations?: Affiliation[];
}

export default function Affiliations({ affiliations = [] }: AffiliationsProps) {
  const { data, setData, post, processing, errors } = useForm<{
    affiliations: Affiliation[];
  }>({
    affiliations: affiliations.length > 0 ? affiliations : [
      {
        institution: "",
        position: "",
      }
    ]
  });

  // Add new affiliation
  const addAffiliation = () => {
    setData("affiliations", [
      ...data.affiliations,
      {
        institution: "",
        position: "",
      }
    ]);
  };

  // Remove affiliation
  const removeAffiliation = (index: number) => {
    if (data.affiliations.length > 1) {
      const updatedAffiliations = data.affiliations.filter((_, i) => i !== index);
      setData("affiliations", updatedAffiliations);
    }
  };

  // Update affiliation
  const updateAffiliation = (index: number, field: keyof Affiliation, value: string) => {
    const updatedAffiliations = [...data.affiliations];
    updatedAffiliations[index] = {
      ...updatedAffiliations[index],
      [field]: value
    };
    setData("affiliations", updatedAffiliations);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post("/applicant/affiliations", {
      onSuccess: () => {
        console.log("Affiliations saved successfully!");
      },
      onError: (errors) => {
        console.error("Error saving affiliations:", errors);
      }
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Affiliations" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Affiliations</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Add your professional affiliations, memberships, and organizational positions.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {data.affiliations.map((affiliation, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Affiliation {index + 1}
                  </h3>
                  {data.affiliations.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeAffiliation(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Institution/Organization *
                    </label>
                    <Input
                      value={affiliation.institution}
                      onChange={(e) => updateAffiliation(index, "institution", e.target.value)}
                      placeholder="e.g., Philippine Medical Association"
                      required
                      className="w-full"
                    />
                    {errors[`affiliations.${index}.institution`] && (
                      <p className="text-red-600 text-sm mt-1">{errors[`affiliations.${index}.institution`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Position/Role *
                    </label>
                    <Input
                      value={affiliation.position}
                      onChange={(e) => updateAffiliation(index, "position", e.target.value)}
                      placeholder="e.g., Board Member, Secretary, Treasurer"
                      required
                      className="w-full"
                    />
                    {errors[`affiliations.${index}.position`] && (
                      <p className="text-red-600 text-sm mt-1">{errors[`affiliations.${index}.position`]}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Affiliation Button */}
          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={addAffiliation}
              className="flex items-center gap-2 border-dashed border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <Plus className="h-4 w-4" />
              Add Another Affiliation
            </Button>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="submit"
              disabled={processing}
              className="px-8 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {processing ? "Saving..." : "Save Affiliations"}
            </Button>
          </div>
        </form>

        <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
        </div>
      </div>
    </AppLayout>
  );
}
