// resources/js/Pages/Auth/Register.tsx
import { login } from '@/routes';
import { LoaderCircle } from 'lucide-react';
import { useForm, Head } from '@inertiajs/react';
import '../../../css/easyApply.css';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import axios from 'axios';
import { useState } from 'react';
import { useEffect } from 'react'; 

type UserAddress = {
  region_code: string;
  region_name: string;
  province_code: string;
  province_name: string;
  citymun_code: string;
  citymun_name: string;
  barangay_code: string;
  barangay_name: string;
};
type PSGCItem = { code: string; name: string };
interface RegisterProps {
first_name: string;
last_name: string;
roles: string[];
email: string;
phone_number: string;
password: string;
password_confirmation: string;
users_address: UserAddress;
}

export default function Register({ roles }: { roles: string[] }) {
const { data, setData, post, processing, errors } = useForm({
    first_name: '',
    last_name: '',
    role: roles?.[1] || '', 
    email: '',
    phone_number: '',
    password: '',
    password_confirmation: '',
    users_address:{
         region_code: "",
        region_name: "",
        province_code: "",
        province_name: "",  
        citymun_code: "",
        citymun_name: "",
        barangay_code: "",
        barangay_name: ""
    },
});

    const [regions, setRegions] = useState<PSGCItem[]>([]);
    const [provinces, setProvinces] = useState<PSGCItem[]>([]);
    const [cities, setCities] = useState<PSGCItem[]>([]);
    const [barangays, setbarangays] = useState<PSGCItem[]>([]);


const handleRegionChange = async (code: string) => {
  const region = regions.find(r => r.code === code);
  if (!region) return;

  setData("users_address", {
    ...data.users_address,
    region_code: region.code,
    region_name: region.name,
    province_code: "",
    province_name: "",
    citymun_code: "",
    citymun_name: "",
    barangay_code: "",
    barangay_name: ""
  });

  const res = await axios.get(`/psgc/regions/${region.code}/provinces`);
  setProvinces(res.data);
  setCities([]);
  setbarangays([]);
};

const handleProvinceChange = async (code: string) => {
  const province = provinces.find(p => p.code === code);
  if (!province) return;

  setData("users_address", {
    ...data.users_address,
    province_code: province.code,
    province_name: province.name,
    citymun_code: "",
    citymun_name: "",
    barangay_code: "",
    barangay_name: ""
  });

  const res = await axios.get(`/psgc/provinces/${province.code}/cities-municipalities`);
  setCities(res.data);
  setbarangays([]);
};

const handleCityChange = async (code: string) => {
  const city = cities.find(c => c.code === code);
  if (!city) return;

  setData("users_address", {
    ...data.users_address,
    citymun_code: city.code,
    citymun_name: city.name,
    barangay_code: "",
    barangay_name: ""
  });

  const res = await axios.get(`/psgc/cities-municipalities/${city.code}/barangays`);
  setbarangays(res.data);
};

const handleBarangayChange = (code: string) => {
  const barangay = barangays.find(b => b.code === code);
  if (!barangay) return;

  setData("users_address", {
    ...data.users_address,
    barangay_code: barangay.code,
    barangay_name: barangay.name,
  });
};


 useEffect(() => {
    
    axios.get("/psgc/regions").then(res => setRegions(res.data));
 }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/register', {
            onSuccess: () => {
                console.log('Name:', data.first_name + ' ' + data.last_name);
                console.log('Role:', data.role);
            },
            onError: (errors) => {
                console.log(errors);
            },
        });
    };

    return (
        <AuthLayout title="Create an account" description="Enter your details below to create your account">
            <Head title="Register" />

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid gap-6">


                    {/* Role */}
                    <div className="grid gap-2">
                        <Label htmlFor="role">Register as</Label>
                        <select
                            id="role"
                            name="role"
                            required
                            className="border rounded-md px-3 py-2"
                            value={(data as any).role}
                            onChange={(e) => setData('role' as any, e.target.value)}
                            tabIndex={3}
                        >
                            {/* {roles.map((role) => (
                                <option key={role} value={role}>
                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                </option>
                            ))} */}
                            <option key={roles[1]} value={roles[1]}>
                                {roles[1]}
                            </option>
                            <option key={roles[0]} value={roles[0]}>
                                {roles[0]}
                            </option>
                        </select>
                        <InputError message={(errors as any).role} className="mt-2" />
                    </div>

                    {/* Email */}
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={4}
                            autoComplete="email"
                            name="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="email@example.com"
                        />
                        <InputError message={errors.email} />
                    </div>




                    {/* Password */}
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={7}
                            autoComplete="new-password"
                            name="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Password"
                        />
                        <InputError message={errors.password} />
                    </div>

                    {/* Confirm Password */}
                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirm password</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            required
                            tabIndex={8}
                            autoComplete="new-password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            placeholder="Confirm password"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>
                    {/* Submit Button */}
                    <Button type="submit" className="mt-2 w-full" tabIndex={9}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Create account
                    </Button>
                </div>

                {/* Already have account */}
                <div className="text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <TextLink href={login()} tabIndex={10}>
                        Log in
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}