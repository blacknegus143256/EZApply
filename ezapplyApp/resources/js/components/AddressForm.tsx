import React, { useState, useEffect, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import usePostalPH from 'use-postal-ph';


interface AddressData {
    region_code: string;
    region_name: string;
    province_code: string;
    province_name: string;
    citymun_code: string;
    citymun_name: string;
    barangay_code: string;
    barangay_name: string;
    postal_code: string;
    country: string;
}

interface AddressFormProps {
    value: AddressData;
    onChange: (address: AddressData) => void;
    errors?: Record<string, string>;
    disabled?: boolean;
}

const AddressForm: React.FC<AddressFormProps> = ({ value, onChange, errors, disabled }) => {
    const [regions, setRegions] = useState<{ code: string; name: string }[]>([]);
    const [provinces, setProvinces] = useState<{ code: string; name: string }[]>([]);
    const [citiesMunicipalities, setCitiesMunicipalities] = useState<{ code: string; name: string }[]>([]);
    const [barangays, setBarangays] = useState<{ code: string; name: string }[]>([]);

    const postalPH = useMemo(() => usePostalPH(), []);
    const { fetchDataLists } = postalPH;

    const resolvePostalCode = async (address: AddressData) => {
        const { region_name, citymun_name, barangay_name } = address;
        console.log('resolvePostalCode called with:', { region_name, citymun_name, barangay_name });
        if (!region_name || !citymun_name || !barangay_name) return '';

        try {
            const result = await fetchDataLists({
                region: region_name,
                municipality: citymun_name,
                location: barangay_name,
                limit: 1,
            });

            console.log('fetchDataLists result:', result);

            const entry = Array.isArray(result?.data) ? result.data[0] : undefined;
            const postCode = entry?.post_code ?? '';
            return typeof postCode === 'number' ? String(postCode) : postCode;
        } catch (error) {
            console.error('Error fetching postal code:', error);
            return '';
        }
    };



    useEffect(() => {
        fetch('/psgc/regions')
            .then(res => res.json())
            .then(data => {
                setRegions(data.map((region: any) => ({ code: region.code, name: region.name })));
            })
            .catch(err => console.error('Error fetching regions:', err));
    }, []);

    useEffect(() => {
        if (value.region_code) {
            fetch(`/psgc/regions/${value.region_code}/provinces`)
                .then(res => res.json())
                .then(data => {
                    setProvinces(data.map((province: any) => ({ code: province.code, name: province.name })));
                })
                .catch(err => console.error('Error fetching provinces:', err));
        } else {
            setProvinces([]);
        }
    }, [value.region_code]);

    useEffect(() => {
        if (value.province_code) {
            fetch(`/psgc/provinces/${value.province_code}/cities-municipalities`)
                .then(res => res.json())
                .then(data => {
                    setCitiesMunicipalities(data.map((city: any) => ({ code: city.code, name: city.name })));
                })
                .catch(err => console.error('Error fetching cities:', err));
        } else {
            setCitiesMunicipalities([]);
        }
    }, [value.province_code]);

    useEffect(() => {
        if (value.citymun_code) {
            fetch(`/psgc/cities-municipalities/${value.citymun_code}/barangays`)
                .then(res => res.json())
                .then(data => {
                    setBarangays(data.map((barangay: any) => ({ code: barangay.code, name: barangay.name })));
                })
                .catch(err => console.error('Error fetching barangays:', err));
        } else {
            setBarangays([]);
        }
    }, [value.citymun_code]);

    const handleRegionChange = (regionCode: string) => {
        const selectedRegion = regions.find(region => region.code === regionCode);
        onChange({
            ...value,
            region_code: regionCode,
            region_name: selectedRegion?.name || '',
            province_code: '',
            province_name: '',
            citymun_code: '',
            citymun_name: '',
            barangay_code: '',
            barangay_name: '',
            postal_code: ''
        });
        setProvinces([]);
        setCitiesMunicipalities([]);
        setBarangays([]);
    };

    const handleProvinceChange = (provinceCode: string) => {
        const selectedProvince = provinces.find(province => province.code === provinceCode);
        onChange({
            ...value,
            province_code: provinceCode,
            province_name: selectedProvince?.name || '',
            citymun_code: '',
            citymun_name: '',
            barangay_code: '',
            barangay_name: '',
            postal_code: ''
        });
        setCitiesMunicipalities([]);
        setBarangays([]);
    };

    const handleCityMunicipalityChange = async (cityMunCode: string) => {
        const selectedCity = citiesMunicipalities.find(city => city.code === cityMunCode);

        const updatedAddress = {
            ...value,
            citymun_code: cityMunCode,
            citymun_name: selectedCity?.name || '',
            barangay_code: '',
            barangay_name: '',
            postal_code: ''
        };

        const postalCode = await resolvePostalCode(updatedAddress);

        onChange({
            ...updatedAddress,
            postal_code: postalCode
        });
        setBarangays([]);
    };

    const handleBarangayChange = async (barangayCode: string) => {
        const selectedBarangay = barangays.find(barangay => barangay.code === barangayCode);
        const updatedAddress = {
            ...value,
            barangay_code: barangayCode,
            barangay_name: selectedBarangay?.name || ''
        };
        const postalCode = await resolvePostalCode(updatedAddress);
        onChange({
            ...updatedAddress,
            postal_code: postalCode
        });
    };

    return (
        <div className="space-y-4">
            <div>
                <Label>Region</Label>
                <Select
                    value={value.region_code}
                    onValueChange={handleRegionChange}
                    disabled={disabled}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Region" />
                    </SelectTrigger>
                    <SelectContent>
                        {regions.map(region => (
                            <SelectItem key={region.code} value={region.code}>
                                {region.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <InputError message={errors?.region_code} />
            </div>

            <div>
                <Label>Province</Label>
                <Select
                    value={value.province_code}
                    onValueChange={handleProvinceChange}
                    disabled={disabled || !value.region_code}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Province" />
                    </SelectTrigger>
                    <SelectContent>
                        {provinces.map(province => (
                            <SelectItem key={province.code} value={province.code}>
                                {province.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <InputError message={errors?.province_code} />
            </div>

            <div>
                <Label>City/Municipality</Label>
                <Select
                    value={value.citymun_code}
                    onValueChange={handleCityMunicipalityChange}
                    disabled={disabled || !value.province_code}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select City/Municipality" />
                    </SelectTrigger>
                    <SelectContent>
                        {citiesMunicipalities.map(city => (
                            <SelectItem key={city.code} value={city.code}>
                                {city.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <InputError message={errors?.citymun_code} />
            </div>

            <div>
                <Label>Barangay</Label>
                <Select
                    value={value.barangay_code}
                    onValueChange={handleBarangayChange}
                    disabled={disabled || !value.citymun_code}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Barangay" />
                    </SelectTrigger>
                    <SelectContent>
                        {barangays.map(barangay => (
                            <SelectItem key={barangay.code} value={barangay.code}>
                                {barangay.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <InputError message={errors?.barangay_code} />
            </div>
            {/* Postal Code (readonly) - commented out */}
            {/* <div>
                <Label>Postal Code</Label>
                <input
                    type="text"
                    value={value.postal_code}
                    disabled
                    className="w-full border rounded px-2 py-1 bg-gray-100"
                />
            </div> */}
        </div>
    );
};

export default AddressForm;
