<div class="bg-gray-900/60 rounded-2xl p-6 shadow mt-6">
    <h3 class="text-lg font-semibold text-gray-100 mb-4">Franchise Application Form</h3>

    <form method="POST" action="{{ route('companies.store') }}" class="space-y-4">
        @csrf

        {{-- Personal Information --}}
        <h4 class="text-gray-200 font-semibold">Personal Information</h4>
        <x-text-input name="full_name" placeholder="Full Name" required />
        <x-text-input name="email" type="email" placeholder="Email Address" required />
        <x-text-input name="phone_number" placeholder="Phone Number" required />
        <x-text-input name="residential_address" placeholder="Residential Address" required />
        <x-text-input name="city" placeholder="City" required />
        <x-text-input name="state_province" placeholder="State/Province" required />
        <x-text-input name="zip_code" placeholder="ZIP/Postal Code" required />
        <x-text-input name="country" placeholder="Country" required />

        {{-- Business Background --}}
        <h4 class="text-gray-200 font-semibold mt-6">Business Background</h4>
        <x-text-input name="current_occupation" placeholder="Current Occupation" />
        <label><input type="checkbox" name="business_ownership_experience" value="1"> Business Ownership Experience?</label>
        <textarea name="previous_business_details" placeholder="Details of Previous Business"></textarea>
        <textarea name="management_experience" placeholder="Management Experience"></textarea>
        <textarea name="industry_experience" placeholder="Industry Experience"></textarea>

        {{-- Financial Information --}}
        <h4 class="text-gray-200 font-semibold mt-6">Financial Information</h4>
        <x-text-input name="net_worth" type="number" step="0.01" placeholder="Estimated Net Worth" />
        <x-text-input name="liquid_assets" type="number" step="0.01" placeholder="Liquid Assets Available" />
        <x-text-input name="source_of_funds" placeholder="Source of Funds" />
        <x-text-input name="annual_income" type="number" step="0.01" placeholder="Annual Income" />
        <label><input type="checkbox" name="seeking_financing" value="1"> Seeking Financing?</label>

        {{-- Franchise Interest --}}
        <h4 class="text-gray-200 font-semibold mt-6">Franchise Interest</h4>
        <x-text-input name="preferred_location" placeholder="Preferred Franchise Location" />
        <x-text-input name="franchise_type" placeholder="Desired Franchise Type" />
        <textarea name="interest_reason" placeholder="Why are you interested?"></textarea>
        <x-text-input name="timeline" placeholder="Proposed Timeline for Opening" />
        <x-text-input name="application_type" placeholder="Individual / Partner / Group" />

        <x-primary-button class="mt-4">Submit Application</x-primary-button>
    </form>
    <form method="POST" action="{{ route('companies.store') }}" enctype="multipart/form-data">
        @csrf
        {{-- ... all Step 1–6 inputs you already added ... --}}

        {{-- checkbox default --}}
        <input type="hidden" name="prior_experience" value="0">
        <input type="checkbox" name="prior_experience" value="1"> Prior Business Experience Preferred?

        {{-- logo upload field name="logo" --}}
        <input type="file" name="logo" accept="image/*">

        <x-primary-button>Submit Franchise Information</x-primary-button>
    </form>

</div>
