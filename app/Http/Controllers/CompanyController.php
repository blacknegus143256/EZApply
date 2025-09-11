<?php

namespace App\Http\Controllers;

use App\Models\{
    Company,
    CompanyOpportunity,
    CompanyBackground,
    CompanyRequirement,
    CompanyMarketing
};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class CompanyController extends Controller
{
    
    public function store(Request $request)
    {
        Log::info('CompanyController@store invoked');

        $rules = [
            // Step 1 — companies
            'company_name'             => 'required|string|max:255',
            'brand_name'               => 'nullable|string|max:255',
            'hq_address'               => 'required|string|max:255',
            'city'                     => 'required|string|max:255',
            'state_province'           => 'required|string|max:255',
            'zip_code'                 => 'required|string|max:50',
            'country'                  => 'required|string|max:100',
            'company_website'          => 'nullable|string|max:255',
            'description'              => 'required|string',
            'year_founded'             => 'required|integer|between:1800,'.date('Y'),
            'num_franchise_locations'  => 'nullable|integer|min:0',

            // Step 3 — company_opportunities
            'franchise_type'           => 'required|string|max:255',
            'min_investment'           => 'required|numeric|min:0',
            'franchise_fee'            => 'required|numeric|min:0',
            'royalty_fee_structure'    => 'required|string|max:255',
            'avg_annual_revenue'       => 'nullable|numeric|min:0',
            'target_markets'           => 'required|string|max:255',
            'training_support'         => 'nullable|string',
            'franchise_term'           => 'required|string|max:255',
            'unique_selling_points'    => 'nullable|string',

            // Step 4 — company_backgrounds
            'industry_sector'          => 'required|string|max:255',
            'years_in_operation'       => 'required|integer|min:0',
            'total_revenue'            => 'nullable|numeric|min:0',
            'awards'                   => 'nullable|string|max:255',
            'company_history'          => 'nullable|string',

            // Step 5 — company_requirements
            'min_net_worth'            => 'required|numeric|min:0',
            'min_liquid_assets'        => 'required|numeric|min:0',
            'prior_experience'         => 'sometimes|boolean',
            'experience_type'          => 'nullable|string|max:255',
            'other_qualifications'     => 'nullable|string',

            // Step 6 — company_marketings
            'listing_title'            => 'nullable|string|max:255',
            'listing_description'      => 'nullable|string',
            'logo'                     => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'target_profile'           => 'nullable|string|max:255',
            'preferred_contact_method' => 'nullable|string|max:50',
        ];

        $validator = Validator::make($request->all(), $rules);
        if ($validator->fails()) {
            Log::info('Company store validation failed', ['errors' => $validator->errors()]);
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
        }

        $createdCompanyId = null;

        try {
            DB::transaction(function () use ($v, $logoPath, &$createdCompanyId) {
                // 1) Parent
                $company = Company::create([
                    'company_name'            => $v['company_name'],
                    'brand_name'              => $v['brand_name'] ?? null,
                    'hq_address'              => $v['hq_address'],
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
                Log::info('Company created', ['company_id' => $company->id]);

                // 2) Opportunity
                $company->opportunity()->create([
                    'franchise_type'        => $v['franchise_type'],
                    'min_investment'        => $v['min_investment'],
                    'franchise_fee'         => $v['franchise_fee'],
                    'royalty_fee_structure' => $v['royalty_fee_structure'],
                    'avg_annual_revenue'    => $v['avg_annual_revenue'] ?? null,
                    'target_markets'        => $v['target_markets'],
                    'training_support'      => $v['training_support'] ?? null,
                    'franchise_term'        => $v['franchise_term'],
                    'unique_selling_points' => $v['unique_selling_points'] ?? null,
                ]);

                // 3) Background
                $company->background()->create([
                    'industry_sector'    => $v['industry_sector'],
                    'years_in_operation' => $v['years_in_operation'],
                    'total_revenue'      => $v['total_revenue'] ?? null,
                    'awards'             => $v['awards'] ?? null,
                    'company_history'    => $v['company_history'] ?? null,
                ]);

                // 4) Requirements
                $company->requirements()->create([
                    'min_net_worth'     => $v['min_net_worth'],
                    'min_liquid_assets' => $v['min_liquid_assets'],
                    'prior_experience'  => (bool)($v['prior_experience'] ?? false),
                    'experience_type'   => $v['experience_type'] ?? null,
                    'other_qualifications' => $v['other_qualifications'] ?? null,
                ]);

                // 5) Marketing
                $company->marketing()->create([
                    'listing_title'            => $v['listing_title'] ?? null,
                    'listing_description'      => $v['listing_description'] ?? null,
                    'logo_path'                => $logoPath,
                    'target_profile'           => $v['target_profile'] ?? null,
                    'preferred_contact_method' => $v['preferred_contact_method'] ?? null,
                ]);
            });
        } catch (\Throwable $e) {
            Log::error('Company store failed', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
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
    // Get all companies and eager load their related data
    
    $companies = Company::with([
        'opportunity',
        'background',
        'requirements',
        'marketing',
    ])->get();

    return response()->json($companies);
}
}
