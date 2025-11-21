<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use App\Models\{
    Company,
    CompanyOpportunity,
    CompanyBackground,
    CompanyRequirement,
    CompanyMarketing,
    CompanyDocument
};
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Application;
use App\Notifications\CompanyApproved;
use App\Notifications\CompanyRejected;
use Inertia\Inertia;
use App\Models\BasicInfo;
use Illuminate\Support\Facades\Storage;
use App\Models\User;

class CompanyController extends Controller
{
    public function store(Request $request)
    {
        // Validate ONLY the fields for the 5 tables we kept.
        $v = $request->validate([
            // Step 1 — companies
            'company_name'             => 'required|string|max:255',
            'brand_name'               => 'nullable|string|max:255',
            'city'                     => 'nullable|string|max:255',
            'state_province'           => 'nullable|string|max:255',
            'zip_code'                 => 'nullable|string|max:50',
            'region_code'              => 'nullable|string|max:50',
            'region_name'              => 'nullable|string|max:255',
            'province_code'            => 'nullable|string|max:50',
            'province_name'            => 'nullable|string|max:255',
            'citymun_code'             => 'nullable|string|max:50',
            'citymun_name'             => 'nullable|string|max:255',
            'barangay_code'            => 'nullable|string|max:50',
            'barangay_name'            => 'nullable|string|max:255',
            'postal_code'              => 'nullable|string|max:20',
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
        'logo'                     => 'nullable|image|mimes:jpg,jpeg,png,gif,webp,bmp,tiff,svg|max:5120',
        'target_profile'           => 'nullable|string|max:255',
        'preferred_contact_method' => 'nullable|string|max:50',

             // Step 6 — required documents
            'dti_sbc'           => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'bir_2303'          => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'ipo_registration'  => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120', 
        ]);

        // Handle optional file upload
        $logoPath = null;
        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store('logos', 'public');
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
            DB::transaction(function () use ($v, $logoPath, $dtiSbcPath, $bir2303Path, $ipoRegistrationPath) {
                // Parent Company
        $company = Company::create([
            'company_name'            => $v['company_name'],
            'brand_name'              => $v['brand_name'] ?? null,
            'city'                    => $v['citymun_name'] ?? $v['city'],
            'state_province'          => $v['province_name'] ?? $v['state_province'],
            'zip_code'                => $v['zip_code'] ?? '',
            'region_code'             => $v['region_code'] ?? null,
            'region_name'             => $v['region_name'] ?? null,
            'province_code'           => $v['province_code'] ?? null,
            'province_name'           => $v['province_name'] ?? null,
            'citymun_code'            => $v['citymun_code'] ?? null,
            'citymun_name'            => $v['citymun_name'] ?? null,
            'barangay_code'           => $v['barangay_code'] ?? null,
            'barangay_name'           => $v['barangay_name'] ?? null,
            'postal_code'             => $v['postal_code'] ?? null,
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

                 // 6) Documents
                $company->documents()->create([
                    'dti_sbc_path'          => $dtiSbcPath,
                    'bir_2303_path'         => $bir2303Path,
                    'ipo_registration_path' => $ipoRegistrationPath,
                ]);
                Log::info('Company documents created'); // Debugging log
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
            'documents',
        ])->findOrFail($id);

        return response()->json($company);
    }

public function details($id)
{
    $company = Company::with([
        'agents.basicInfo',
        'user.basicInfo',
        'opportunity',
        'background',
        'requirements',
        'marketing',
        'documents',
    ])->findOrFail($id);

    $allAgents = User::role('company') 
        ->with('basicInfo')
        ->get()
        ->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->basicInfo
                    ? $user->basicInfo->first_name . ' ' . $user->basicInfo->last_name
                    : $user->email,
                'email' => $user->email,
            ];
        });

    // Explicitly transform company to ensure agents are included
    $companyData = $company->toArray();
    \Log::info('Company agents in response:', ['agents' => $companyData['agents'] ?? 'MISSING']);

    return Inertia::render('Company/CompanyFullDetails', [
        'company' => $company,
        'allAgents' => $allAgents,
    ]);
}



    public function index()
    {
        // Get all companies and eager load their related data
        $companies = Company::with([
            'opportunity',
            'background',
            'requirements',
            'marketing',
            'documents',
            'user.basicInfo',
        ])->get();

        
        $companiesWithAgentName = $companies->map(function ($company) {
            $companyArray = $company->toArray();
            
            if (!isset($companyArray['agent_name'])) {
                $basicInfo = optional($company->user)->basicInfo;
                $companyArray['agent_name'] = $basicInfo 
                    ? "{$basicInfo->first_name} {$basicInfo->last_name}" 
                    : 'N/A';
            }
            return $companyArray;
        });

        return response()->json($companiesWithAgentName);   
    }

    public function apiIndex()
    {
        $companies = Company::where('user_id', Auth::id())
            ->select('id', 'company_name')
            ->get();

        return response()->json($companies);
    }

    public function updateStatus(Request $request, Company $company)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,approved,rejected',
            'reason' => 'nullable|string|max:500',
        ]);

        $oldStatus = $company->status;
        $company->status = $validated['status'];
        $company->save();

        // Notify company owner if status changed
        if ($oldStatus !== $validated['status'] && $company->user) {
            $company->load('user');
            if ($validated['status'] === 'approved') {
                $company->user->notify(new CompanyApproved($company));
            } elseif ($validated['status'] === 'rejected') {
                $company->user->notify(new CompanyRejected($company, $validated['reason'] ?? null));
            }
        }

        return back()->with('success', 'Company status updated successfully.');
    }

public function myCompanies()
{
    $user = Auth::user();
    
    $companies = collect();

    if ($user->hasRole('super_admin')) {

        $companies = Company::with(['opportunity', 'background', 'requirements', 'marketing', 'documents'])
            ->get(['id', 'company_name', 'brand_name', 'year_founded', 'country', 'status', 'created_at', 'user_id']);

    } elseif ($user->hasRole('company')) {

        $ownedCompanies = $user->companies()
            ->with(['opportunity', 'background', 'requirements', 'marketing', 'documents'])
            ->select('companies.id', 'companies.company_name', 'companies.brand_name', 'companies.year_founded', 'companies.country', 'companies.status', 'companies.created_at', 'companies.user_id')
            ->get();
        

            $assignedCompanies = $user->assignedCompanies()
            ->with(['opportunity', 'background', 'requirements', 'marketing', 'documents'])
            ->select('companies.id', 'companies.company_name', 'companies.brand_name', 'companies.year_founded', 'companies.country', 'companies.status', 'companies.created_at', 'companies.user_id')
            ->get();
        
        $companies = $ownedCompanies->concat($assignedCompanies)->unique('id')->values();
    } else {
        $companies = collect();
    }

    return Inertia::render('Company/CompanyRegistered', compact('companies'));
}

   public function companyApplicants()
{
    $companyIds = auth()->user()->companies()->pluck ('id') ?? null;

    if (!$companyIds) {
        abort(403, 'You do not have a company assigned.');
    }

    // Get applicants that applied to this company
    $applicants = Application::with([
        'user.basicInfo',
        'company'
        ])
        ->whereIn('company_id',$companyIds)
        ->get()
        ->map(function ($application) {
            // Ensure basicInfo is properly accessible
            if ($application->user) {
                $application->user->load('basicInfo');
            }
            return $application;
        });

return Inertia::render('Company/Applicants/CompanyApplicants', [
    'applicants' => $applicants,
    'pricing' => [
        'applicant_info_cost' => config('pricing.applicant_info_cost', 1),
    ],
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

    $oldStatus = $application->status;
    $application->update(['status' => $request->status]);

    // Notify applicant if status changed
    if ($oldStatus !== $request->status && $application->user) {
        $application->load('company');
        $application->user->notify(new \App\Notifications\ApplicationStatusChanged($application, $request->status));
    }

    return back()->with('success', 'Applicant status updated.');
}

public function update(Request $request, Company $company)
{
    abort_unless($company->user_id === Auth::id(), 403);

    // $company = Company::with(['opportunity','background','requirements','marketing'])
    //     ->where('user_id', Auth::id()) // ensure owner
    //     ->findOrFail($id);

    $v = $request->validate([
        // Step 1 — companies
        'company_name'             => 'required|string|max:255',
        'brand_name'               => 'nullable|string|max:255',
        'city'                     => 'nullable|string|max:255',
        'state_province'           => 'nullable|string|max:255',
        'zip_code'                 => 'nullable|string|max:50',
        'region_code'              => 'nullable|string|max:50',
        'region_name'              => 'nullable|string|max:255',
        'province_code'            => 'nullable|string|max:50',
        'province_name'            => 'nullable|string|max:255',
        'citymun_code'             => 'nullable|string|max:50',
        'citymun_name'             => 'nullable|string|max:255',
        'barangay_code'            => 'nullable|string|max:50',
        'barangay_name'            => 'nullable|string|max:255',
        'postal_code'              => 'nullable|string|max:20',
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
        'other_qualifications'    => 'nullable|string',

        // Step 5 — company_marketings
        'listing_title'            => 'nullable|string|max:255',
        'listing_description'      => 'nullable|string',
        'logo'                     => 'nullable|image|mimes:jpg,jpeg,png,gif,webp,bmp,tiff,svg|max:5120',
        'target_profile'           => 'nullable|string|max:255',
        'preferred_contact_method' => 'nullable|string|max:50',

         // Step 6 — optional documents for update
        'dti_sbc'           => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        'bir_2303'          => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        'ipo_registration'  => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
    ]);

    $logoPath = optional($company->marketing)->logo_path;
    if ($request->hasFile('logo')) {
    Storage::disk('public')->delete($company->marketing->logo_path ?? '');
    $logoPath = $request->file('logo')->store('logos', 'public');
}

    $dtiSbcPath = optional($company->documents)->dti_sbc_path;
    if ($request->hasFile('dti_sbc')) {
        $dtiSbcPath = $request->file('dti_sbc')->store('documents','public');
    }

    $bir2303Path = optional($company->documents)->bir_2303_path;
    if ($request->hasFile('bir_2303')) {
        $bir2303Path = $request->file('bir_2303')->store('documents','public');
    }

    $ipoRegistrationPath = optional($company->documents)->ipo_registration_path;
    if ($request->hasFile('ipo_registration')) {
        $ipoRegistrationPath = $request->file('ipo_registration')->store('documents','public');
    }

    DB::transaction(function () use ($company, $v, $logoPath, $dtiSbcPath, $bir2303Path, $ipoRegistrationPath) {
        // Update parent
        $company->update([
            'company_name'            => $v['company_name'],
            'brand_name'              => $v['brand_name'] ?? null,
            'city'                    => $v['citymun_name'] ?? $v['city'],
            'state_province'          => $v['province_name'] ?? $v['state_province'],
            'zip_code'                => $v['zip_code'] ?? $v['postal_code'] ?? '',
            'region_code'             => $v['region_code'] ?? null,
            'region_name'             => $v['region_name'] ?? null,
            'province_code'           => $v['province_code'] ?? null,
            'province_name'           => $v['province_name'] ?? null,
            'citymun_code'            => $v['citymun_code'] ?? null,
            'citymun_name'            => $v['citymun_name'] ?? null,
            'barangay_code'           => $v['barangay_code'] ?? null,
            'barangay_name'           => $v['barangay_name'] ?? null,
            'postal_code'             => $v['postal_code'] ?? null,
            'country'                 => $v['country'],
            'company_website'         => $v['company_website'] ?? null,
            'description'             => $v['description'],
            'year_founded'            => $v['year_founded'],
            'num_franchise_locations' => $v['num_franchise_locations'] ?? null,
        ]);

        // Update related rows (if null yet, create them)
        $company->opportunity()->updateOrCreate(
            ['company_id'=>$company->id],
            [
                'franchise_type'        => $v['franchise_type'],
                'min_investment'        => $v['min_investment'],
                'franchise_fee'         => $v['franchise_fee'],
                'royalty_fee_structure' => $v['royalty_fee_structure'],
                'avg_annual_revenue'    => $v['avg_annual_revenue'] ?? null,
                'target_markets'        => $v['target_markets'],
                'training_support'      => $v['training_support'] ?? null,
                'franchise_term'        => $v['franchise_term'],
                'unique_selling_points' => $v['unique_selling_points'] ?? null,
            ]
        );

        $company->background()->updateOrCreate(
            ['company_id'=>$company->id],
            [
                'industry_sector'    => $v['industry_sector'],
                'years_in_operation' => $v['years_in_operation'],
                'total_revenue'      => $v['total_revenue'] ?? null,
                'awards'             => $v['awards'] ?? null,
                'company_history'    => $v['company_history'] ?? null,
            ]
        );

        $company->requirements()->updateOrCreate(
            ['company_id'=>$company->id],
            [
                'min_net_worth'        => $v['min_net_worth'],
                'min_liquid_assets'    => $v['min_liquid_assets'],
                'prior_experience'     => $v['prior_experience'] ?? false,
                'experience_type'      => $v['experience_type'] ?? null,
                'other_qualifications' => $v['other_qualifications'] ?? null,
            ]
        );

        $company->marketing()->updateOrCreate(
            ['company_id'=>$company->id],
            [
                'listing_title'            => $v['listing_title'] ?? null,
                'listing_description'      => $v['listing_description'] ?? null,
                'logo_path'                => $logoPath,
                'target_profile'           => $v['target_profile'] ?? null,
                'preferred_contact_method' => $v['preferred_contact_method'] ?? null,
            ]
        );

        $company->documents()->updateOrCreate(
            ['company_id'=>$company->id],
            [
                'dti_sbc_path'          => $dtiSbcPath,
                'bir_2303_path'         => $bir2303Path,
                'ipo_registration_path' => $ipoRegistrationPath,
            ]
        );
    });

    return back()->with('success','Company updated successfully.');
}


    public function edit(Company $company)
{
    $company = Company::where('user_id', Auth::id())->findOrFail($company->id);
    $company->load(['opportunity','background','requirements','marketing','documents']);
    return Inertia::render('Company/CompanyEdit', [
        'company' => $company ,
    ]);
}

public function assignAgents(Request $request, Company $company)
{
    // Only super-admin can assign agents
    abort_unless(Auth::user()->hasRole('super_admin'), 403, 'Only super-admin can assign agents.');

    $request->validate([
        'agent_ids' => 'required|array',
        'agent_ids.*' => 'exists:users,id',
    ]);

    $agentIds = array_filter($request->agent_ids, fn($id) => $id !== $company->user_id);

    if ((is_null($company->user_id) || $company->user_id === 1) && !empty($agentIds)) {
        $company->user_id = reset($agentIds);
        $company->save();
        $agentIds = array_diff($agentIds, [$company->user_id]);
    }

    $company->agents()->sync($agentIds);

    $company->load(['agents.basicInfo', 'user.basicInfo', 'opportunity', 'background', 'requirements', 'marketing', 'documents']);

    // Get all available agents for the dropdown
    $allAgents = User::role('company') 
        ->with('basicInfo')
        ->get()
        ->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->basicInfo
                    ? $user->basicInfo->first_name . ' ' . $user->basicInfo->last_name
                    : $user->email,
                'email' => $user->email,
            ];
        });

    // Return Inertia response with updated company data
    return Inertia::render('Company/CompanyFullDetails', [
        'company' => $company,
        'allAgents' => $allAgents,
    ])->with('success', 'Agents assigned successfully!');
}



}