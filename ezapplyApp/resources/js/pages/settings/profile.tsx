import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import { send } from '@/routes/verification';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { User, Mail, MapPin, Phone, Calendar, Share2, Shield, Save, CheckCircle2 } from 'lucide-react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Settings',
        href: edit().url,
    },
];

export default function Profile({ mustVerifyEmail, status, basicInfo, address }: { mustVerifyEmail: boolean; status?: string; basicInfo?: any; address?: any }) {
    const { auth } = usePage<SharedData>().props;
    const [loadingRegions, setLoadingRegions] = useState(true);
    const [loadingProvinces, setLoadingProvinces] = useState(false);
    const [loadingCities, setLoadingCities] = useState(false);
    const [loadingBarangays, setLoadingBarangays] = useState(false);
    const [regions, setRegions] = useState<{ code: string; name: string }[]>([]);
    const [provinces, setProvinces] = useState<{ code: string; name: string }[]>([]);
    const [citiesMunicipalities, setCitiesMunicipalities] = useState<{ code: string; name: string }[]>([]);
    const [barangays, setBarangays] = useState<{ code: string; name: string }[]>([]);

    const [addressData, setAddressData] = useState({
        region_code: address?.region_code || '',
        region_name: address?.region_name || '',
        province_code: address?.province_code || '',
        province_name: address?.province_name || '',
        citymun_code: address?.citymun_code || '',
        citymun_name: address?.citymun_name || '',
        barangay_code: address?.barangay_code || '',
        barangay_name: address?.barangay_name || '',
    });

    useEffect(() => {
    setLoadingRegions(true);
        fetch('/psgc/regions')
            .then(res => res.json())
            .then(data => {
                const mapped = (data.map((region: any) => ({ code: region.code, name: region.name })));
                setRegions(mapped);
                if (addressData.region_code) {
                const match = mapped.find((r: { code: string; name: string }) => r.code === addressData.region_code);
                if (match) {
                    setAddressData(prev => ({
                    ...prev,
                    region_name: match.name,
                    }));
                }
                }
                
            })
            .catch(err => console.error('Error fetching regions:', err))
        .finally(() => setLoadingRegions(false));
    }, []);

    useEffect(() => {
        if (addressData.region_code) {
        setLoadingProvinces(true);
            fetch(`/psgc/regions/${addressData.region_code}/provinces`)
                .then(res => res.json())
                .then(data => {
                    setProvinces(data.map((province: any) => ({ code: province.code, name: province.name })));
                })
                .catch(err => console.error('Error fetching provinces:', err))
            .finally(() => setLoadingProvinces(false));
        } else {
            setProvinces([]);
        }
    }, [addressData.region_code]);

    useEffect(() => {
        if (addressData.province_code) {
        setLoadingCities(true);
            fetch(`/psgc/provinces/${addressData.province_code}/cities-municipalities`)
                .then(res => res.json())
                .then(data => {
                    setCitiesMunicipalities(data.map((city: any) => ({ code: city.code, name: city.name })));
                })
                .catch(err => console.error('Error fetching cities:', err))
            .finally(() => setLoadingCities(false));
        } else {
            setCitiesMunicipalities([]);
        }
    }, [addressData.province_code]);

    useEffect(() => {
        if (addressData.citymun_code) {
        setLoadingBarangays(true);
            fetch(`/psgc/cities-municipalities/${addressData.citymun_code}/barangays`)
                .then(res => res.json())
                .then(data => {
                    setBarangays(data.map((barangay: any) => ({ code: barangay.code, name: barangay.name })));
                })
                .catch(err => console.error('Error fetching barangays:', err))
            .finally(() => setLoadingBarangays(false));
        } else {
            setBarangays([]);
        }
    }, [addressData.citymun_code]);

    const handleRegionChange = (regionCode: string) => {
        const selectedRegion = regions.find(region => region.code === regionCode);
        setAddressData({
            ...addressData,
            region_code: regionCode,
            region_name: selectedRegion?.name || '',
            province_code: '',
            province_name: '',
            citymun_code: '',
            citymun_name: '',
            barangay_code: '',
            barangay_name: '',
        });
        setProvinces([]);
        setCitiesMunicipalities([]);
        setBarangays([]);
    };

    const handleProvinceChange = (provinceCode: string) => {
        const selectedProvince = provinces.find(province => province.code === provinceCode);
        setAddressData({
            ...addressData,
            province_code: provinceCode,
            province_name: selectedProvince?.name || '',
            citymun_code: '',
            citymun_name: '',
            barangay_code: '',
            barangay_name: '',
        });
        setCitiesMunicipalities([]);
        setBarangays([]);
    };

    const handleCityMunicipalityChange = (cityMunCode: string) => {
        const selectedCity = citiesMunicipalities.find(city => city.code === cityMunCode);
        setAddressData({
            ...addressData,
            citymun_code: cityMunCode,
            citymun_name: selectedCity?.name || '',
            barangay_code: '',
            barangay_name: '',
        });
        setBarangays([]);
    };

    const handleBarangayChange = (barangayCode: string) => {
        const selectedBarangay = barangays.find(barangay => barangay.code === barangayCode);
        setAddressData({
            ...addressData,
            barangay_code: barangayCode,
            barangay_name: selectedBarangay?.name || '',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    {/* Header Section */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
                        <div className="flex items-center gap-3 mb-2">
                            <User size={32} className="sm:w-10 sm:h-10" />
                            <h1 className="text-2xl sm:text-3xl font-bold">User Profile</h1>
                        </div>
                        <p className="text-blue-100 text-sm sm:text-base">
                            Update your personal information and account details
                        </p>
                    </div>

                    <Form
                        {...ProfileController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-6"
                    >
                        {({ processing, recentlySuccessful, errors }) => (
                            <>
                                {/* Personal Information Card */}
                                <Card className="shadow-lg">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <User size={20} className="text-blue-600" />
                                            Personal Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                    <div className="grid gap-2">
                                        <Label htmlFor="first_name">First Name</Label>
                                        <Input
                                            id="first_name"
                                            className="mt-1 block w-full"
                                            defaultValue={basicInfo?.first_name || ''}
                                            name="first_name"
                                            required
                                            autoComplete="first-name"
                                            placeholder="First name"
                                        />
                                        <InputError className="mt-2" message={errors.first_name} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="last_name">Last Name</Label>
                                        <Input
                                            id="last_name"
                                            className="mt-1 block w-full"
                                            defaultValue={basicInfo?.last_name || ''}
                                            name="last_name"
                                            required
                                            autoComplete="family-name"
                                            placeholder="Last name"
                                        />
                                        <InputError className="mt-2" message={errors.last_name} />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="birth_date" className="flex items-center gap-2">
                                        <Calendar size={16} className="text-gray-500" />
                                        Birth Date
                                    </Label>

                                    <Input
                                        id="birth_date"
                                        type="date"
                                        className="mt-1 block w-full"
                                        defaultValue={basicInfo?.birth_date ? new Date(basicInfo.birth_date).toISOString().split('T')[0] : ''}
                                        name="birth_date"
                                        required
                                        autoComplete="bday"
                                        placeholder="Birth date"
                                    />

                                    <InputError className="mt-2" message={errors.birth_date} />
                                </div>
                                    </CardContent>
                                </Card>

                                {/* Contact Information Card */}
                                <Card className="shadow-lg">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Phone size={20} className="text-green-600" />
                                            Contact Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="phone" className="flex items-center gap-2">
                                        <Phone size={16} className="text-gray-500" />
                                        Phone Number
                                    </Label>

                                    <Input
                                        id="phone"
                                        className="mt-1 block w-full"
                                        defaultValue={basicInfo?.phone || ''}
                                        name="phone"
                                        required
                                        autoComplete="tel"
                                        placeholder="Phone number"
                                    />

                                    <InputError className="mt-2" message={errors.phone} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email" className="flex items-center gap-2">
                                        <Mail size={16} className="text-gray-500" />
                                        Email Address
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user?.email || ''}
                                        name="email"
                                        required
                                        autoComplete="username"
                                        placeholder="Email address"
                                    />
                                    <InputError className="mt-2" message={errors.email} />
                                </div>

                                {mustVerifyEmail && auth.user?.email_verified_at === null && (
                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                            Your email address is unverified.{' '}
                                            <Link
                                                href={send()}
                                                as="button"
                                                className="font-semibold underline decoration-yellow-600 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-yellow-800"
                                            >
                                                Click here to resend the verification email.
                                            </Link>
                                        </p>

                                        {status === 'verification-link-sent' && (
                                            <div className="mt-2 text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-2">
                                                <CheckCircle2 size={16} />
                                                A new verification link has been sent to your email address.
                                            </div>
                                        )}
                                    </div>
                                )}
                                    </CardContent>
                                </Card>

                                {/* Social Media Links Card */}
                                <Card className="shadow-lg">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Share2 size={20} className="text-purple-600" />
                                            Social Media Links
                                            <span className="text-sm font-normal text-gray-500">(Optional)</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="Facebook">Facebook</Label>

                                    <Input
                                        id="Facebook"
                                        className="mt-1 block w-full"
                                        defaultValue={basicInfo?.Facebook || ''}
                                        name="Facebook"
                                        autoComplete="url"
                                        placeholder="Facebook profile URL"
                                    />

                                    <InputError className="mt-2" message={errors.Facebook} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="LinkedIn">LinkedIn</Label>

                                    <Input
                                        id="LinkedIn"
                                        className="mt-1 block w-full"
                                        defaultValue={basicInfo?.LinkedIn || ''}
                                        name="LinkedIn"
                                        autoComplete="url"
                                        placeholder="LinkedIn profile URL"
                                    />

                                    <InputError className="mt-2" message={errors.LinkedIn} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="Viber">Viber</Label>

                                    <Input
                                        id="Viber"
                                        className="mt-1 block w-full"
                                        defaultValue={basicInfo?.Viber || ''}
                                        name="Viber"
                                        autoComplete="tel"
                                        placeholder="Viber number"
                                    />

                                    <InputError className="mt-2" message={errors.Viber} />
                                </div>
                                    </CardContent>
                                </Card>

                                {/* Address Information Card */}
                                <Card className="shadow-lg">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <MapPin size={20} className="text-orange-600" />
                                            Address Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label>Region</Label>
                                            <div className="relative">
                                            <Select
                                                value={addressData.region_code}
                                                onValueChange={handleRegionChange}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select Region" />
                                                </SelectTrigger>
                                                <SelectContent>    
                                                    {loadingRegions ? (
                                                        <div className="p-3 text-center text-sm text-gray-500">Loading...</div>
                                                    ) : (
                                                    regions.map(region => (
                                                        <SelectItem key={region.code} value={region.code}>
                                                            {region.name}
                                                        </SelectItem>
                                                    ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {loadingRegions && 
                                            <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-neutral-900/50 rounded-md"><div className="loader scale-25 ml-1" />
                                            </div>}
                                            </div>
                                            
                                            <InputError message={errors['users_address.region_code']} />
                                            <Input
                                                type="hidden"
                                                name="users_address[region_code]"
                                                value={addressData.region_code}
                                            />
                                            <Input
                                                type="hidden"
                                                name="users_address[region_name]"
                                                value={addressData.region_name}
                                            />
                                        </div>

                                        <div>
                                            <Label>Province</Label>
                                            <div className="relative">
                                            <Select
                                                value={addressData.province_code}
                                                onValueChange={handleProvinceChange}
                                                disabled={!addressData.region_code}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select Province" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                        {loadingProvinces ? (
                                                        <div className="flex flex-col items-center justify-center p-3">
                                                        <div className="loader mb-2"></div>
                                                        <div className="p-3 text-center text-sm text-gray-500">Loading...</div>
                                                        </div>
                                                    ) : (
                                                    provinces.map(province => (
                                                        <SelectItem key={province.code} value={province.code}>
                                                            {province.name}
                                                        </SelectItem>
                                                    ))
                                                    )}
                                                </SelectContent>
                                            </Select>                                           
                                            {loadingProvinces && 
                                            <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-neutral-900/50 rounded-md"><div className="loader scale-25 ml-1" />
                                            </div>}
                                            </div>
                                            <InputError message={errors['users_address.province_code']} />
                                            <Input
                                                type="hidden"
                                                name="users_address[province_code]"
                                                value={addressData.province_code}
                                            />
                                            <Input
                                                type="hidden"
                                                name="users_address[province_name]"
                                                value={addressData.province_name}
                                            />
                                        </div>

                                        <div>
                                            <Label>City/Municipality</Label>
                                            <div className="relative">
                                            <Select
                                                value={addressData.citymun_code}
                                                onValueChange={handleCityMunicipalityChange}
                                                disabled={!addressData.province_code}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select City/Municipality" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                        {loadingCities ? (
                                                        <div className="flex flex-col items-center justify-center p-3">
                                                        <div className="loader mb-2"></div>
                                                        <div className="p-3 text-center text-sm text-gray-500">Loading...</div>
                                                        </div>
                                                    ) : (
                                                    citiesMunicipalities.map(city => (
                                                        <SelectItem key={city.code} value={city.code}>
                                                            {city.name}
                                                        </SelectItem>
                                                    ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {loadingCities && 
                                            <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-neutral-900/50 rounded-md"><div className="loader scale-25 ml-1" />
                                            </div>}
                                            </div>
                                            <InputError message={errors['users_address.citymun_code']} />
                                            <Input
                                                type="hidden"
                                                name="users_address[citymun_code]"
                                                value={addressData.citymun_code}
                                            />
                                            <Input
                                                type="hidden"
                                                name="users_address[citymun_name]"
                                                value={addressData.citymun_name}
                                            />
                                        </div>

                                        <div>
                                            <Label>Barangay</Label>
                                            <div className="relative">
                                            <Select
                                                value={addressData.barangay_code}
                                                onValueChange={handleBarangayChange}
                                                disabled={!addressData.citymun_code}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select Barangay" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                        {loadingBarangays ? (
                                                        <div className="flex flex-col items-center justify-center p-3">
                                                        <div className="loader mb-2"></div>
                                                        <div className="p-3 text-center text-sm text-gray-500">Loading...</div>
                                                        </div>
                                                    ) : (
                                                    barangays.map(barangay => (
                                                        <SelectItem key={barangay.code} value={barangay.code}>
                                                            {barangay.name}
                                                        </SelectItem>
                                                    ))
                                                )}
                                                </SelectContent>
                                            </Select>
                                            {loadingBarangays && 
                                            <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-neutral-900/50 rounded-md"><div className="loader scale-25 ml-1" />
                                            </div>}
                                            </div>
                                            <InputError message={errors['users_address.barangay_code']} />
                                            <Input
                                                type="hidden"
                                                name="users_address[barangay_code]"
                                                value={addressData.barangay_code}
                                            />
                                            <Input
                                                type="hidden"
                                                name="users_address[barangay_name]"
                                                value={addressData.barangay_name}
                                            />
                                        </div>
                                    </div>
                                    </CardContent>
                                </Card>

                                {/* Account Information Card */}
                                <Card className="shadow-lg">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Shield size={20} className="text-indigo-600" />
                                            Account Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid gap-2">
                                            <Label htmlFor="role">Role</Label>
                                            <div
                                                id="role"
                                                className="border rounded-md px-4 py-3 h-12 border-gray-300 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-neutral-800 dark:to-neutral-700 text-sm flex items-center"
                                                tabIndex={3}
                                            >
                                                <Shield size={16} className="text-indigo-600 mr-2" />
                                                <span className="text-gray-700 dark:text-gray-300 font-semibold">
                                                    {auth.user?.roles?.[0]?.name || 'No role assigned'}
                                                </span>
                                            </div>
                                            <InputError message={(errors as any).role} className="mt-2" />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0 scale-95"
                                        enterTo="opacity-100 scale-100"
                                        leave="transition ease-in-out"
                                        leaveFrom="opacity-100 scale-100"
                                        leaveTo="opacity-0 scale-95"
                                    >
                                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold">
                                            <CheckCircle2 size={20} />
                                            <span>Profile saved successfully!</span>
                                        </div>
                                    </Transition>
                                    <Button 
                                        disabled={processing} 
                                        size="lg"
                                        className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                    >
                                        {processing ? (
                                            <>
                                                <div className="loader scale-50 mr-2" />
                                                <span>Saving...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save size={18} className="mr-2" />
                                                <span>Save Changes</span>
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
