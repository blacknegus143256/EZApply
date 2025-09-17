<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\Auth;
use App\Models\{
    Company,
    CompanyOpportunity,
    CompanyBackground,
    CompanyRequirement,
    CompanyMarketing
};
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class CompanyController extends Controller
{
    public function store(Request $request)
    {
        
        Log::info('CompanyController@store invoked'); // Debugging log

        $rules = [
            // Step 1 — companies
            'company_name'             => 'required|string|max:255',
            'brand_name'               => 'required|string|max:255',
            'city'                     => 'required|string|max:255',
            'state_province'           => 'required|string|max:255',
            'zip_code'                 => 'required|string|max:50',
            'country'                  => 'required|string|max:100',
            'company_website'          => 'nullable|string|max:255',
            'description'              => 'required|string',
            'year_founded'             => 'required|integer|between:1900,'.date('Y'),
            'num_franchise_locations'  => 'nullable|integer|min:0',

            // Step 2 — company_opportunities
            'franchise_type'           => 'required|string|max:255',
            'min_investment'           => 'required|numeric|min:0',
            'franchise_fee'            => 'required|numeric|min:0',
            'royalty_fee'              => 'required|string|max:255',
            'avg_annual_revenue'       => 'nullable|numeric|min:0',
            'target_markets'           => 'required|string|max:255',
            'training_support'         => 'nullable|string',
            'franchise_term'           => 'required|string|max:255',
            'unique_selling_points'    => 'nullable|string',

            // Step 3 — company_backgrounds
            'industry_sector'          => 'required|string|max:255',
            'date_started'             => 'required',
            'total_revenue'            => 'nullable|numeric|min:0',
            'awards'                   => 'nullable|string|max:255',
            'company_history'          => 'nullable|string',

            // Step 4 — company_requirements
            'min_net_worth'            => 'required|numeric|min:0',
            'min_liquid_assets'        => 'required|numeric|min:0',
            'prior_experience'         => 'sometimes|boolean',
            'experience_type'          => 'nullable|string|max:255',
            'other_qualifications'     => 'nullable|string',

            // Step 5 — company_marketings
            'listing_title'            => 'nullable|string|max:255',
            'listing_description'      => 'nullable|string',
            'logo'                     => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'target_profile'           => 'nullable|string|max:255',
            'preferred_contact_method' => 'nullable|string|max:50',

            // Step 6 — required documents
            'dti_sbc'           => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'bir_2303'          => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'ipo_registration'  => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ];

        $validator = Validator::make($request->all(), $rules);
        if ($validator->fails()) {
            Log::info('Company store validation failed', ['errors' => $validator->errors()]); // Debugging log
            if ($request->header('X-Inertia')) {
                return back()->withErrors($validator)->withInput();
            }
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }
        $v = $validator->validated();
        // Handle optional file upload
        $logoPath = null;
        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store('logos', 'public');
            Log::info('Logo uploaded', ['path' => $logoPath]); // Debugging log
        }

        // Handle required document uploads
        $dtiSbcPath = $request->file('dti_sbc')->store('documents', 'public');
        $bir2303Path = $request->file('bir_2303')->store('documents', 'public');
        $ipoRegistrationPath = $request->file('ipo_registration')->store('documents', 'public');
        Log::info('Documents uploaded', [
            'dti_sbc_path' => $dtiSbcPath,
            'bir_2303_path' => $bir2303Path,
            'ipo_registration_path' => $ipoRegistrationPath,
        ]); // Debugging log

        $createdCompanyId = null;

        try {
            DB::transaction(function () use ($v, $logoPath, $dtiSbcPath, $bir2303Path, $ipoRegistrationPath, &$createdCompanyId) {
                // 1) Parent
                $company = Company::create([
                    'user_id' => Auth::id(),
                    'status'                  => 'pending',
                    'company_name'            => $v['company_name'],
                    'brand_name'              => $v['brand_name'],
                    'city'                    => $v['city'],
                    'state_province'          => $v['state_province'],
                    'zip_code'                => $v['zip_code'],
                    'country'                 => $v['country'],
                    'company_website'         => $v['company_website'] ?? null,
                    'description'             => $v['description'],
                    'year_founded'            => $v['year_founded'],
                    'num_franchise_locations' => $v['num_franchise_locations'] ?? null,
                ]);
                $createdCompanyId = $company->id;
                Log::info('Company created', ['company_id' => $company->id]); // Debugging log

                // 2) Opportunity
                $company->opportunity()->create([
                    'franchise_type'        => $v['franchise_type'],
                    'min_investment'        => $v['min_investment'],
                    'franchise_fee'         => $v['franchise_fee'],
                    'royalty_fee'           => $v['royalty_fee'],
                    'avg_annual_revenue'    => $v['avg_annual_revenue'] ?? null,
                    'target_markets'        => $v['target_markets'],
                    'training_support'      => $v['training_support'] ?? null,
                    'franchise_term'        => $v['franchise_term'],
                    'unique_selling_points' => $v['unique_selling_points'] ?? null,
                ]);
                Log::info('Company opportunity created'); // Debugging log

                // 3) Background
                $company->background()->create([
                    'industry_sector'    => $v['industry_sector'],
                    'date_started'       => $v['date_started'], // Renamed from years_in_operation
                    'total_revenue'      => $v['total_revenue'] ?? null,
                    'awards'             => $v['awards'] ?? null,
                    'company_history'    => $v['company_history'] ?? null,
                ]);
                Log::info('Company background created'); // Debugging log

                // 4) Requirements
                $company->requirements()->create([
                    'min_net_worth'     => $v['min_net_worth'],
                    'min_liquid_assets' => $v['min_liquid_assets'],
                    'prior_experience'  => (bool)($v['prior_experience'] ?? false),
                    'experience_type'   => $v['experience_type'] ?? null,
                    'other_qualifications' => $v['other_qualifications'] ?? null,
                ]);
                Log::info('Company requirements created'); // Debugging log

                // 5) Marketing
                $company->marketing()->create([
                    'listing_title'            => $v['listing_title'] ?? null,
                    'listing_description'      => $v['listing_description'] ?? null,
                    'logo_path'                => $logoPath,
                    'target_profile'           => $v['target_profile'] ?? null,
                    'preferred_contact_method' => $v['preferred_contact_method'] ?? null,
                ]);
                Log::info('Company marketing created'); // Debugging log

                // 6) Documents
                $company->documents()->create([
                    'dti_sbc_path'          => $dtiSbcPath,
                    'bir_2303_path'         => $bir2303Path,
                    'ipo_registration_path' => $ipoRegistrationPath,
                ]);
                Log::info('Company documents created'); // Debugging log
            });
        } catch (\Throwable $e) {
            Log::error('Company store failed', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]); // Debugging log
            if ($request->header('X-Inertia')) {
                return back()->withErrors(['server' => 'Failed to save company.']);
            }
            return response()->json(['message' => 'Failed to save company.'], 500);
        }

        if ($request->header('X-Inertia')) {
            return back()->with('success', 'Company saved.');
        }
        return response()->json(['message' => 'Company saved.', 'id' => $createdCompanyId], 201);
    }

    public function show($id)
    {
        // Load company + all related data
        $company = Company::with([
            'opportunity',
            'background',
            'requirements',
            'marketing',
        ])->findOrFail($id);

        return response()->json($company);
    }
    public function index()
{
    $companies = Company::with([
        'opportunity',
        'background',
        'requirements',
        'marketing',
    ])->get()
    ->map(function ($c) {
        return [
            'id' => $c->id,
            'company_name' => $c->company_name,
            'brand_name' => $c->brand_name,
            'opportunity' => [
                'franchise_type' => optional($c->opportunity)->franchise_type,
            ],
            'year_founded' => $c->year_founded,
            'country' => $c->country,
            'status' => $c->status,
            'logo_url' => optional($c->marketing)->logo_path ? asset('storage/' . $c->marketing->logo_path) : null,
        ];
    });

    return inertia('Company/Index', [
        'companies' => $companies,
    ]);
}
public function edit($id)
{
    $company = Company::with(['opportunity', 'background', 'requirements', 'marketing'])->findOrFail($id);
    return inertia('Company/Edit', ['company' => $company]);
}


public function update(Request $request, Company $company)
{
    Log::info('CompanyController@update invoked', ['company_id' => $company->id]);

    $rules = [
        'company_name'             => 'required|string|max:255',
        'brand_name'               => 'required|string|max:255',
        'city'                     => 'required|string|max:255',
        'state_province'           => 'required|string|max:255',
        'zip_code'                 => 'required|string|max:50',
        'country'                  => 'required|string|max:100',
        'company_website'          => 'nullable|string|max:255',
        'description'              => 'required|string',
        'year_founded'             => 'required|integer|between:1900,'.date('Y'),
        'num_franchise_locations'  => 'nullable|integer|min:0',

        'franchise_type'           => 'required|string|max:255',
        'min_investment'           => 'required|numeric|min:0',
        'franchise_fee'            => 'required|numeric|min:0',
        'royalty_fee'              => 'required|string|max:255',
        'avg_annual_revenue'       => 'nullable|numeric|min:0',
        'target_markets'           => 'required|string|max:255',
        'training_support'         => 'nullable|string',
        'franchise_term'           => 'required|string|max:255',
        'unique_selling_points'    => 'nullable|string',

        'industry_sector'          => 'required|string|max:255',
        'date_started'             => 'required',
        'total_revenue'            => 'nullable|numeric|min:0',
        'awards'                   => 'nullable|string|max:255',
        'company_history'          => 'nullable|string',

        'min_net_worth'            => 'required|numeric|min:0',
        'min_liquid_assets'        => 'required|numeric|min:0',
        'prior_experience'         => 'sometimes|boolean',
        'experience_type'          => 'nullable|string|max:255',
        'other_qualifications'     => 'nullable|string',

        'listing_title'            => 'nullable|string|max:255',
        'listing_description'      => 'nullable|string',
        'logo'                     => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
        'target_profile'           => 'nullable|string|max:255',
        'preferred_contact_method' => 'nullable|string|max:50',

        'dti_sbc'           => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        'bir_2303'          => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        'ipo_registration'  => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
    ];

    $validator = Validator::make($request->all(), $rules);
    if ($validator->fails()) {
        if ($request->header('X-Inertia')) {
            return back()->withErrors($validator)->withInput();
        }
        return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
    }

    $v = $validator->validated();

    try {
        DB::transaction(function () use ($request, $company, $v) {
            $company->update([
                'company_name'            => $v['company_name'],
                'brand_name'              => $v['brand_name'],
                'city'                    => $v['city'],
                'state_province'          => $v['state_province'],
                'zip_code'                => $v['zip_code'],
                'country'                 => $v['country'],
                'company_website'         => $v['company_website'] ?? null,
                'description'             => $v['description'],
                'year_founded'            => $v['year_founded'],
                'num_franchise_locations' => $v['num_franchise_locations'] ?? null,
            ]);

            $company->opportunity()->updateOrCreate([], [
                'franchise_type'        => $v['franchise_type'],
                'min_investment'        => $v['min_investment'],
                'franchise_fee'         => $v['franchise_fee'],
                'royalty_fee'           => $v['royalty_fee'],
                'avg_annual_revenue'    => $v['avg_annual_revenue'] ?? null,
                'target_markets'        => $v['target_markets'],
                'training_support'      => $v['training_support'] ?? null,
                'franchise_term'        => $v['franchise_term'],
                'unique_selling_points' => $v['unique_selling_points'] ?? null,
            ]);

            $company->background()->updateOrCreate([], [
                'industry_sector'    => $v['industry_sector'],
                'date_started'       => $v['date_started'],
                'total_revenue'      => $v['total_revenue'] ?? null,
                'awards'             => $v['awards'] ?? null,
                'company_history'    => $v['company_history'] ?? null,
            ]);

            $company->requirements()->updateOrCreate([], [
                'min_net_worth'     => $v['min_net_worth'],
                'min_liquid_assets' => $v['min_liquid_assets'],
                'prior_experience'  => (bool)($v['prior_experience'] ?? false),
                'experience_type'   => $v['experience_type'] ?? null,
                'other_qualifications' => $v['other_qualifications'] ?? null,
            ]);

            $marketingData = [
                'listing_title'            => $v['listing_title'] ?? null,
                'listing_description'      => $v['listing_description'] ?? null,
                'target_profile'           => $v['target_profile'] ?? null,
                'preferred_contact_method' => $v['preferred_contact_method'] ?? null,
            ];
            if ($request->hasFile('logo')) {
                $marketingData['logo_path'] = $request->file('logo')->store('logos', 'public');
            }
            $company->marketing()->updateOrCreate([], $marketingData);

            $docData = [];
            if ($request->hasFile('dti_sbc')) {
                $docData['dti_sbc_path'] = $request->file('dti_sbc')->store('documents', 'public');
            }
            if ($request->hasFile('bir_2303')) {
                $docData['bir_2303_path'] = $request->file('bir_2303')->store('documents', 'public');
            }
            if ($request->hasFile('ipo_registration')) {
                $docData['ipo_registration_path'] = $request->file('ipo_registration')->store('documents', 'public');
            }
            if (!empty($docData)) {
                $company->documents()->updateOrCreate([], $docData);
            }
        });
    } catch (\Throwable $e) {
        Log::error('Company update failed', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
        if ($request->header('X-Inertia')) {
            return back()->withErrors(['server' => 'Failed to update company.']);
        }
        return response()->json(['message' => 'Failed to update company.'], 500);
    }

    if ($request->header('X-Inertia')) {
        return back()->with('success', 'Company updated.');
    }
    return response()->json(['message' => 'Company updated.']);
}


public function updateStatus(Request $request, Company $company)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,approved,rejected',
        ]);

        $company->status = $validated['status'];
        $company->save();

        return back()->with('success', 'Company status updated successfully.');
    }
};