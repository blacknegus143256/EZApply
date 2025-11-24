import { useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage, useForm } from '@inertiajs/react';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InputError from '@/components/input-error';
import { UserRole } from '@/types/user';
import { Users, ArrowLeft, Save, Shield } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Edit Users', href: '/users' }
];

export default function EditUser({ roles, user }: { roles: string[], user: UserRole }) {
    const { auth } = usePage().props as any;

    
    const { data, setData, put, errors, processing, } = useForm({
        first_name: user.basicInfo?.first_name || '',
        last_name: user.basicInfo?.last_name || '',
        email: user.email || '',
        phone_number: user.basicInfo?.phone || '',
        birth_date: user.basicInfo?.birth_date || '',
        facebook: user.basicInfo?.Facebook || '',
        linkedin: user.basicInfo?.LinkedIn || '',
        viber: user.basicInfo?.Viber || '',
        password: '',
        password_confirmation: '', 
        roles: user.roles ? user.roles.map(r => r.name) : [],
        region_code: user.address?.region_code ?? '',
        region_name: user.address?.region_name ?? '',
        province_code: user.address?.province_code ?? '',
        province_name: user.address?.province_name ?? '',
        citymun_code: user.address?.citymun_code ?? '',
        citymun_name: user.address?.citymun_name ?? '',
        barangay_code: user.address?.barangay_code ?? '',
        barangay_name: user.address?.barangay_name ?? ''
    });
    useEffect(() => {
        setData({
            first_name: user.basic_info?.first_name || '',
            last_name: user.basic_info?.last_name || '',
            email: user.email || '',
            phone_number: user.basic_info?.phone || '',
            birth_date: user.basic_info?.birth_date || '',
            facebook: user.basic_info?.Facebook || '',
            linkedin: user.basic_info?.LinkedIn || '',
            viber: user.basic_info?.Viber || '',
            roles: user.roles ? user.roles.map(r => r.name) : [],
            region_code: user.address?.region_code || '',
            region_name: user.address?.region_name || '',
            province_code: user.address?.province_code || '',
            province_name: user.address?.province_name || '',
            citymun_code: user.address?.citymun_code || '',
            citymun_name: user.address?.citymun_name || '',
            barangay_code: user.address?.barangay_code || '',
            barangay_name: user.address?.barangay_name || '',
            password: '',
            password_confirmation: '',
        });
    }, [user]);


    const [regions, setRegions] = useState<{ code: string; name: string }[]>([]);
    const [provinces, setProvinces] = useState<{ code: string; name: string }[]>([]);
    const [citiesMunicipalities, setCitiesMunicipalities] = useState<{ code: string; name: string }[]>([]);
    const [barangays, setBarangays] = useState<{ code: string; name: string }[]>([]);

    const [loadingRegions, setLoadingRegions] = useState(false);
    const [loadingProvinces, setLoadingProvinces] = useState(false);
    const [loadingCities, setLoadingCities] = useState(false);
    const [loadingBarangays, setLoadingBarangays] = useState(false);

    const isoDate = user.basic_info?.birth_date || new Date().toISOString();
    const formattedDate = isoDate.split("T")[0];

    useEffect(() => {
    setLoadingRegions(true);
        fetch('/psgc/regions')
            .then(res => res.json())
            .then(data => setRegions(data.map((r: any) => ({ code: r.code, name: r.name }))))
            .catch(console.error)
        .finally(() => setLoadingRegions(false));  
    }, []);

    useEffect(() => {
        if (data.region_code) {
        setLoadingProvinces(true);
            fetch(`/psgc/regions/${data.region_code}/provinces`)
                .then(res => res.json())
                .then(data => setProvinces(data.map((p: any) => ({ code: p.code, name: p.name }))))
                .catch(console.error)
            .finally(() => setLoadingProvinces(false));
        } else setProvinces([]);
    }, [data.region_code]);

    useEffect(() => {
        if (data.province_code) {
        setLoadingCities(true);
            fetch(`/psgc/provinces/${data.province_code}/cities-municipalities`)
                .then(res => res.json())
                .then(data => setCitiesMunicipalities(data.map((c: any) => ({ code: c.code, name: c.name }))))
                .catch(console.error)
            .finally(() => setLoadingCities(false));
        } else setCitiesMunicipalities([]);
    }, [data.province_code]);

    useEffect(() => {
        if (data.citymun_code) {
        setLoadingBarangays(true);
            fetch(`/psgc/cities-municipalities/${data.citymun_code}/barangays`)
                .then(res => res.json())
                .then(data => setBarangays(data.map((b: any) => ({ code: b.code, name: b.name }))))
                .catch(console.error)
            .finally(() => setLoadingBarangays(false));
        } else setBarangays([]);
    }, [data.citymun_code]);

    const handleRegionChange = (code: string) => {
        const selected = regions.find(r => r.code === code);
        setData({
            ...data,
            region_code: code,
            region_name: selected?.name || '',
            province_code: '',
            province_name: '',
            citymun_code: '',
            citymun_name: '',
            barangay_code: '',
            barangay_name: ''
        });
        setProvinces([]);
        setCitiesMunicipalities([]);
        setBarangays([]);
    };

    const handleProvinceChange = (code: string) => {
        const selected = provinces.find(p => p.code === code);
        setData({
            ...data,
            province_code: code,
            province_name: selected?.name || '',
            citymun_code: '',
            citymun_name: '',
            barangay_code: '',
            barangay_name: ''
        });
        setCitiesMunicipalities([]);
        setBarangays([]);
    };

    const handleCityChange = (code: string) => {
        const selected = citiesMunicipalities.find(c => c.code === code);
        setData({
            ...data,
            citymun_code: code,
            citymun_name: selected?.name || '',
            barangay_code: '',
            barangay_name: ''
        });
        setBarangays([]);
    };

    const handleBarangayChange = (code: string) => {
        const selected = barangays.find(b => b.code === code);
        setData({
            ...data,
            barangay_code: code,
            barangay_name: selected?.name || ''
        });
    };

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        put(`/users/${user.id}`, {
            onSuccess: () => console.log('User updated:', data),
            onError: (err) => console.log(err)
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit User" />
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Users size={32} />
                            <div>
                                <h1 className="text-3xl font-bold">Edit User</h1>
                                <p className="text-indigo-100 mt-1">Update user account information</p>
                            </div>
                        </div>
                        <Link href="/users">
                            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                                <ArrowLeft size={18} className="mr-2" />
                                Go Back
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Form Card */}
                <Card className="shadow-lg">
                    <CardContent className="p-6">
                        <form onSubmit={submit} className="space-y-4">

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="first_name">First Name</Label>
                                    <Input
                                        id="first_name"
                                        name="first_name"
                                        value={data.first_name}
                                        onChange={e => setData('first_name', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.first_name} />
                                </div>
                                <div>
                                    <Label htmlFor="last_name">Last Name</Label>
                                    <Input
                                        id="last_name"
                                        name="last_name"
                                        value={data.last_name}
                                        onChange={e => setData('last_name', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.last_name} />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    required
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div>
                                <Label htmlFor="phone_number">Phone Number</Label>
                                <Input
                                    id="phone_number"
                                    name="phone_number"
                                    value={data.phone_number}
                                    onChange={e => setData('phone_number', e.target.value)}
                                    required
                                />
                                <InputError message={errors.phone_number} />
                            </div>

                            <div>
                                <Label htmlFor="birth_date">Birth Date</Label>
                                <Input
                                    type="date"
                                    id="birth_date"
                                    name="birth_date"
                                    value={formattedDate}
                                    onChange={e => setData('birth_date', e.target.value)}
                                    required
                                />
                                <InputError message={errors.birth_date} />
                            </div>

                            <div>
                                <Label htmlFor="facebook">Facebook (Optional)</Label>
                                <Input
                                    id="facebook"
                                    name="facebook"
                                    value={data.facebook}
                                    onChange={e => setData('facebook', e.target.value)}
                                />
                                <InputError message={errors.facebook} />
                            </div>
                            <div>
                                <Label htmlFor="linkedin">LinkedIn (Optional)</Label>
                                <Input
                                    id="linkedin"
                                    name="linkedin"
                                    value={data.linkedin}
                                    onChange={e => setData('linkedin', e.target.value)}
                                />
                                <InputError message={errors.linkedin} />
                            </div>
                            <div>
                                <Label htmlFor="viber">Viber (Optional)</Label>
                                <Input
                                    id="viber"
                                    name="viber"
                                    value={data.viber}
                                    onChange={e => setData('viber', e.target.value)}
                                />
                                <InputError message={errors.viber} />
                            </div>

                            <div>
                                <Label>Address</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                        <Label>Region</Label>
                                        <div className="relative">
                                        <Select value={data.region_code} onValueChange={handleRegionChange}>
                                            <SelectTrigger><SelectValue placeholder="Select Region" /></SelectTrigger>
                                            <SelectContent>
                                            {loadingRegions ? (
                                            <SelectItem disabled value="loading">Loading barangays...</SelectItem>
                                            ) : (
                                            regions.map(r => <SelectItem key={r.code} value={r.code}>{r.name}</SelectItem>)
                                            )}
                                            </SelectContent>
                                        </Select>
                                          {loadingRegions && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <div className="loader scale-45"></div>
                                            </div>
                                        )}
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Province</Label>
                                        <div className="relative">
                                        <Select value={data.province_code} onValueChange={handleProvinceChange} disabled={!data.region_code}>
                                            <SelectTrigger><SelectValue placeholder="Select Province" /></SelectTrigger>
                                            <SelectContent>
                                            {loadingProvinces ? (
                                            <SelectItem disabled value="loading">Loading barangays...</SelectItem>
                                            ) : (
                                            provinces.map(p => <SelectItem key={p.code} value={p.code}>{p.name}</SelectItem>)
                                            )}
                                            </SelectContent>
                                        </Select>
                                          {loadingProvinces && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <div className="loader scale-45"></div>
                                            </div>
                                        )}
                                        </div>
                                    </div>
                                    <div>
                                        <Label>City/Municipality</Label>
                                        <div className="relative">
                                        <Select value={data.citymun_code} onValueChange={handleCityChange} disabled={!data.province_code}>
                                            <SelectTrigger><SelectValue placeholder="Select City/Municipality" /></SelectTrigger>
                                            <SelectContent>
                                            {loadingCities ? (
                                            <SelectItem disabled value="loading">Loading barangays...</SelectItem>
                                            ) : (
                                            citiesMunicipalities.map(c => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)
                                            )}
                                            </SelectContent>
                                        </Select>
                                          {loadingCities && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <div className="loader scale-45"></div>
                                            </div>
                                        )}
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Barangay</Label>
                                        <div className="relative">
                                        <Select value={data.barangay_code} onValueChange={handleBarangayChange} disabled={!data.citymun_code}>
                                            <SelectTrigger><SelectValue placeholder="Select Barangay" /></SelectTrigger>
                                            <SelectContent>
                                            {loadingBarangays ? (
                                            <SelectItem disabled value="loading">Loading barangays...</SelectItem>
                                            ) : (
                                            barangays.map(b => <SelectItem key={b.code} value={b.code}>{b.name}</SelectItem>)
                                            )}
                                            </SelectContent>
                                        </Select>
                                          {loadingBarangays && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <div className="loader scale-45"></div>
                                            </div>
                                        )}
                                        </div>
                                    </div>
                                </div> 
                                {/* <InputError message={errors.address} /> */}
                            </div>

                            <div>
                                <Label>Select Role(s)</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 my-2">
                                    {roles.map((role, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <Checkbox
                                                id={`role-${role}`}
                                                checked={data.roles.includes(role)}
                                                onCheckedChange={checked => {
                                                    if (checked) setData('roles', [...data.roles, role]);
                                                    else setData('roles', data.roles.filter(r => r !== role));
                                                }}
                                            />
                                            <Label htmlFor={`role-${role}`}>{role}</Label>
                                        </div>
                                    ))}
                                </div>
                                <InputError message={errors.roles} />
                            </div>

                            <div>
                                <Label htmlFor="password">Password (Optional)</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                />
                                <InputError message={errors.password} />
                            </div>
                            <div>
                                <Label htmlFor="password_confirmation">Confirm Password</Label>
                                <Input
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={e => setData('password_confirmation', e.target.value)}
                                />
                                <InputError message={errors.password_confirmation} />
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                                <Link href="/users">
                                    <Button type="button" variant="outline" size="lg">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing} size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                                    <Save size={18} className="mr-2" />
                                    Update User
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
