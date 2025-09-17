
import React, { useEffect, useState } from "react";
import { PlaceholderPattern } from "@/components/ui/placeholder-pattern";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import { type BreadcrumbItem } from "@/types";
import { useForm, Head } from "@inertiajs/react";
import { Input } from "@/components/ui/input";
import PermissionGate from '@/components/PermissionGate';
import '../../../css/easyApply.css';

const breadcrumbs: BreadcrumbItem[] = [{ title: "Dashboard", href: dashboard() }];

interface BasicInfoProps {
  basicInfo?: any;
  address?: any;
}

function ErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

interface FormData {
  first_name: string;
  last_name: string;
  birth_date: string;
  phone: string;
  Facebook: string;
  LinkedIn: string;
  Viber: string;
  description: string;
  users_address: {
    region_code: string;
    province_code: string;
    citymun_code: string;
    barangay_code: string;
  };
}

export default function BasicInfo({ basicInfo, address }: BasicInfoProps) {
  const { data, setData, post, processing, errors, reset } = useForm<FormData>({
    first_name: basicInfo?.first_name || "",
    last_name: basicInfo?.last_name || "",
    birth_date: basicInfo?.birth_date || "",
    phone: basicInfo?.phone || "",
    Facebook: basicInfo?.Facebook || "",
    LinkedIn: basicInfo?.LinkedIn || "",
    Viber: basicInfo?.Viber || "",
    description: "",
    users_address: {
      region_code: address?.region_code || "",
      province_code: address?.province_code || "",
      citymun_code: address?.citymun_code || "",
      barangay_code: address?.barangay_code || "",
    },
  });

  const [regions, setRegions] = useState<any[]>([]);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [barangays, setBarangays] = useState<any[]>([]);
  const [saved, setSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(!basicInfo);

  useEffect(() => {

    fetch("/psgc/regions")
      .then((res) => res.json())
      .then((data) => setRegions(data as any[]))
  }, []);

  // Preload dependent lists if codes already exist (to resolve names)
  useEffect(() => {
    const { region_code, province_code, citymun_code } = data.users_address;
    if (region_code) {
      fetch(`/psgc/regions/${region_code}/provinces`)
        .then((res) => res.json())
        .then((prov) => {
          setProvinces(prov as any[]);
          if (province_code) {
            fetch(`/psgc/provinces/${province_code}/cities-municipalities`)
              .then((res) => res.json())
              .then((ct) => {
                setCities(ct as any[]);
                if (citymun_code) {
                  fetch(`/psgc/cities-municipalities/${citymun_code}/barangays`)
                    .then((res) => res.json())
                    .then((b) => setBarangays(b as any[]))
                    .catch(() => {});
                }
              })
              .catch(() => {});
          }
        })
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRegionChange = (regionCode: string) => {
    setData("users_address", {
      region_code: regionCode,
      province_code: "",
      citymun_code: "",
      barangay_code: ""
    });
    setProvinces([]);
    setCities([]);
    setBarangays([]);
    if (regionCode) {
      fetch(`/psgc/regions/${regionCode}/provinces`)
        .then((res) => res.json())
        .then((data) => setProvinces(data as any[]));
    }
  };

  const handleProvinceChange = (provinceCode: string) => {
    setData("users_address", {
      region_code: data.users_address.region_code,
      province_code: provinceCode,
      citymun_code: "",
      barangay_code: ""
    });
    setCities([]);
    setBarangays([]);
    if (provinceCode) {
      fetch(`/psgc/provinces/${provinceCode}/cities-municipalities`)
        .then((res) => res.json())
        .then((data) => setCities(data as any[]));
    }
  };

  const handleCityChange = (cityCode: string) => {
    setData("users_address", {
      region_code: data.users_address.region_code,
      province_code: data.users_address.province_code,
      citymun_code: cityCode,
      barangay_code: ""
    });
    setBarangays([]);
    if (cityCode) {
      fetch(`/psgc/cities-municipalities/${cityCode}/barangays`)
        .then((res) => res.json())
        .then((data) => setBarangays(data as any[]));
    }
  };

  const handleBarangayChange = (barangayCode: string) => {
    setData("users_address", {
      region_code: data.users_address.region_code,
      province_code: data.users_address.province_code,
      citymun_code: data.users_address.citymun_code,
      barangay_code: barangayCode
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);
    post("/applicant/basicinfo", {
      onSuccess: () => {
        setSaved(true);
        setIsEditing(false);
      },
    });
  };

  const findName = (list: any[], code: string) => list.find((x) => x.code === code)?.name || '';
  const regionName = findName(regions, data.users_address.region_code);
  const provinceName = findName(provinces, data.users_address.province_code);
  const cityName = findName(cities, data.users_address.citymun_code);
  const barangayName = findName(barangays, data.users_address.barangay_code);

  const formatDate = (value?: string) => {
    if (!value) return '';
    // handle values like '2003-09-18' or '2003-09-18 00:00:00'
    const iso = value.length > 10 ? value.slice(0, 10) : value;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso; // fallback
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
  };
  const birthDatePretty = formatDate(data.birth_date);

  const SummaryRow = ({ label, value }: { label: string; value?: string }) => (
    <div className="flex justify-between gap-4 py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{value || '-'}</span>
    </div>
  );
  return (
    <PermissionGate permission="view_customer_dashboard" fallback={<div className="p-6">You don't have permission to access this page.</div>}>
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Basic Info" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        {saved && (
          <div className="rounded-md bg-green-600/15 border border-green-700 px-4 py-2 text-green-700 text-sm">
            Basic information saved successfully.
          </div>
        )}

        {!isEditing ? (
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-neutral-900 p-4">
            <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Your Basic Information</h2>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              <SummaryRow label="First Name" value={data.first_name} />
              <SummaryRow label="Last Name" value={data.last_name} />
              <SummaryRow label="Birth Date" value={birthDatePretty} />
              <SummaryRow label="Phone" value={data.phone} />
              <SummaryRow label="Facebook" value={data.Facebook} />
              <SummaryRow label="LinkedIn" value={data.LinkedIn} />
              <SummaryRow label="Viber" value={data.Viber} />
              <SummaryRow label="Region" value={regionName} />
              <SummaryRow label="Province" value={provinceName} />
              <SummaryRow label="City/Municipality" value={cityName} />
              <SummaryRow label="Barangay" value={barangayName} />
            </div>
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Update
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-3">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium">First Name *</label>
                <Input
                  name="first_name"
                  value={data.first_name}
                  onChange={(e) => setData("first_name", e.target.value)}
                  required
                />
                <ErrorText message={(errors as any).first_name} />
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium">Last Name</label>
                <Input
                  name="last_name"
                  value={data.last_name}
                  onChange={(e) => setData("last_name", e.target.value)}
                />
                <ErrorText message={(errors as any).last_name} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">Birth Date *</label>
              <Input
                name="birth_date"
                type="date"
                value={data.birth_date}
                onChange={(e) => setData("birth_date", e.target.value)}
                required
              />
              <ErrorText message={(errors as any).birth_date} />
            </div>

            <div>
              <label className="block text-sm font-medium">Phone *</label>
              <Input
                name="phone"
                value={data.phone}
                onChange={(e) => {
                  const onlyDigits = e.target.value.replace(/[^0-9]/g, "").slice(0, 11);
                  setData("phone", onlyDigits);
                }}
                placeholder="e.g., 09xxxxxxxxx"
                required
              />
              <ErrorText message={(errors as any).phone} />
            </div>

            <div className="flex gap-4" >
            <div className="flex-1">
              <label className="block text-sm font-medium">Facebook</label>
              <Input name="Facebook" value={data.Facebook} onChange={(e) => setData("Facebook", e.target.value)} />
              <ErrorText message={(errors as any).Facebook} />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium">LinkedIn</label>
              <Input name="LinkedIn" value={data.LinkedIn} onChange={(e) => setData("LinkedIn", e.target.value)} />
              <ErrorText message={(errors as any).LinkedIn} />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium">Viber</label>
              <Input name="Viber" value={data.Viber} onChange={(e) => setData("Viber", e.target.value)} />
              <ErrorText message={(errors as any).Viber} />
            </div>
            </div>
            <div>
              <label className="block text-sm font-medium">Description</label>
              <textarea
                name="description"
                value={data.description}
                onChange={(e) => setData("description", e.target.value)}
                className="w-full border rounded px-3 py-2 min-h-[100px]"
                placeholder="Tell us about yourself..."
              />
              <ErrorText message={(errors as any).description} />
            </div>

            <h3 className="text-md font-semibold mt-4">Current Address</h3>
            <div className="border p-4 rounded space-y-4">
              <div>
                <label className="block text-sm font-medium">Region</label>
                <select
                  name="users_address.region_code"
                  value={data.users_address.region_code}
                  onChange={(e) => handleRegionChange(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select Region</option>
                  {regions.map((r) => (
                    <option key={r.code} value={r.code}>{r.name}</option>
                  ))}
                </select>
                <ErrorText message={(errors as any)["users_address.region_code"]} />
              </div>

              <div>
                <label className="block text-sm font-medium">Province</label>
                <select
                  name="users_address.province_code"
                  value={data.users_address.province_code}
                  onChange={(e) => handleProvinceChange(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select Province</option>
                  {provinces.map((p) => (
                    <option key={p.code} value={p.code}>{p.name}</option>
                  ))}
                </select>
                <ErrorText message={(errors as any)["users_address.province_code"]} />
              </div>

              <div>
                <label className="block text-sm font-medium">City / Municipality</label>
                <select
                  name="users_address.citymun_code"
                  value={data.users_address.citymun_code}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select City/Municipality</option>
                  {cities.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
                <ErrorText message={(errors as any)["users_address.citymun_code"]} />
              </div>

              <div>
                <label className="block text-sm font-medium">Barangay</label>
                <select
                  name="users_address.barangay_code"
                  value={data.users_address.barangay_code}
                  onChange={(e) => handleBarangayChange(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select Barangay</option>
                  {barangays.map((b) => (
                    <option key={b.code} value={b.code}>{b.name}</option>
                  ))}
                </select>
                <ErrorText message={(errors as any)["users_address.barangay_code"]} />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={processing}
              >
                {processing ? "Saving..." : "Save Basic Info"}
              </button>
            </div>
          </form>
        )}

        <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
        </div>
      </div>
    </AppLayout>
    </PermissionGate>
  );
}
