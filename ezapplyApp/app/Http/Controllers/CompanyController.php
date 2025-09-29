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
use App\Models\Application;
use Inertia\Inertia;


class CompanyController extends Controller
{
    public function store(Request $request)
    {
        // Validate ONLY the fields for the 5 tables we kept.
        $v = $request->validate([
            // Step 1 — companies
            'company_name'             => 'required|string|max:255',
            'brand_name'               => 'nullable|string|max:255',
            'city'                     => 'required|string|max:255',
            'state_province'           => 'required|string|max:255',
            'zip_code'                 => 'required|string|max:50',
            'country'                  => 'required|string|max:100',
            'company_website'          => 'nullable|string|max:255',
            'description'              => 'required|string',
            'year_founded'             => 'required|integer|between:1800,' . date('Y'),
            'num_franchise_locations'  => 'nullable|integer|min:0',

            // Step 2 — company_opportunities
            'franchise_type'           => 'required|string|max:255',
            'min_investment'           => 'required|numeric|min:0',
            'franchise_fee'            => 'required|numeric|min:0',
            'royalty_fee_structure'    => 'required|string|max:255',
            'avg_annual_revenue'       => 'nullable|numeric|min:0',
            'target_markets'           => 'required|string|max:255',
            'training_support'         => 'nullable|string',
            'franchise_term'           => 'required|string|max:255',
            'unique_selling_points'    => 'nullable|string',

            // Step 3 — company_backgrounds
            'industry_sector'          => 'required|string|max:255',
            'years_in_operation'       => 'required|integer|min:0',
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
        ]);

        // Handle optional file upload
        $logoPath = null;
        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store('logos', 'public');
        }

        try {
            DB::transaction(function () use ($v, $logoPath) {
                // Parent Company
                $company = Company::create([
                    'company_name'            => $v['company_name'],
                    'brand_name'              => $v['brand_name'] ?? null,
                    'city'                    => $v['city'],
                    'state_province'          => $v['state_province'],
                    'zip_code'                => $v['zip_code'],
                    'country'                 => $v['country'],
                    'company_website'         => $v['company_website'] ?? null,
                    'description'             => $v['description'],
                    'year_founded'            => $v['year_founded'],
                    'num_franchise_locations' => $v['num_franchise_locations'] ?? null,
                    'status'                  => 'pending',
                    'user_id'                 => Auth::id(),
                ]);

                // Opportunity
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
                Log::info('Company opportunity created');

                // Background
                $company->background()->create([
                    'industry_sector'    => $v['industry_sector'],
                    'years_in_operation' => $v['years_in_operation'],
                    'total_revenue'      => $v['total_revenue'] ?? null,
                    'awards'             => $v['awards'] ?? null,
                    'company_history'    => $v['company_history'] ?? null,
                ]);
                Log::info('Company background created');

                // Requirements
                $company->requirements()->create([
                    'min_net_worth'        => $v['min_net_worth'],
                    'min_liquid_assets'    => $v['min_liquid_assets'],
                    'prior_experience'     => $v['prior_experience'] ?? false,
                    'experience_type'      => $v['experience_type'] ?? null,
                    'other_qualifications' => $v['other_qualifications'] ?? null,
                ]);

                // Marketing
                $company->marketing()->create([
                    'listing_title'            => $v['listing_title'] ?? null,
                    'listing_description'      => $v['listing_description'] ?? null,
                    'logo_path'                => $logoPath,
                    'target_profile'           => $v['target_profile'] ?? null,
                    'preferred_contact_method' => $v['preferred_contact_method'] ?? null,
                ]);
            });

            return back()->with('success', 'Company saved successfully. Pending approval.');

        } catch (\Throwable $e) {
            Log::error('Company store failed: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->withInput()->withErrors([
                'error' => 'Failed to save company. Please try again later.',
            ]);
        }
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
            'user',
        ])->get();

        return response()->json($companies);
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

    public function myCompanies()
{
    $companies = Company::where('user_id', Auth::id())
    ->with(['opportunity','background','requirements','marketing'])
    ->get(['id', 'company_name', 'brand_name', 'year_founded', 'country','status', 'created_at']);
    return inertia('Company/CompanyRegistered', compact('companies'));
}

   public function companyApplicants()
{
    $companyIds = auth()->user()->companies()->pluck ('id') ?? null;

    if (!$companyIds) {
        abort(403, 'You do not have a company assigned.');
    }

    // Get applicants that applied to this company
    $applicants = Application::with([
        'user',
        'user.basicinfo',
        'company'
        ])
        ->whereIn('company_id',$companyIds)
    ->get();

return Inertia::render('Company/Applicants/CompanyApplicants', [
    'applicants' => $applicants,
    ]);
}


public function updateApplicantStatus(Request $request, $id)
{
    $request->validate([
        'status' => 'required|in:pending,approved,rejected,interested',
    ]);

    $companyIds = auth()->user()->companies()->pluck('id');

    $application = Application::where('id', $id)
        ->whereIn('company_id', $companyIds) 
        ->firstOrFail();

    $application->update(['status' => $request->status]);

    return back()->with('success', 'Applicant status updated.');
}

public function destroy(Company $company)
    {
        abort_unless($company->user_id === Auth::id(), 403);

        try {
            DB::transaction(function () use ($company) {
                $company->opportunity()?->delete();
                $company->background()?->delete();
                $company->requirements()?->delete();
                $company->marketing()?->delete();
                $company->documents()?->delete();
                $company->applications()->delete();
                $company->delete();
            });

            return redirect('/my-companies')->with('success', 'Company deleted successfully.');
        } catch (\Throwable $e) {
            Log::error('Failed to delete company: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->withErrors(['error' => 'Failed to delete company. Please try again later.']);
        }
    }
}
