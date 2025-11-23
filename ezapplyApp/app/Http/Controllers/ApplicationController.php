<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Notifications\NewApplicationReceived;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ApplicationController extends Controller
{
    // store applications for the authenticated user
    public function store(Request $request)
    {
        $data = $request->validate([
            'company_id' => 'sometimes|integer|exists:companies,id',
            'companyIds' => 'sometimes|array|min:1',
            'companyIds.*' => 'integer|exists:companies,id',
            'desired_location' => 'nullable|string|max:255',
            'deadline_date' => 'nullable|date',
        ]);

        $userId = auth()->id();

        $companyIds = [];
        if (isset($data['company_id'])) {
            $companyIds = [$data['company_id']];
        } elseif (isset($data['companyIds'])) {
            $companyIds = $data['companyIds'];
        }

        foreach ($companyIds as $companyId) {
            $application = Application::firstOrCreate(
                [
                    'user_id' => $userId,
                    'company_id' => $companyId,
                ],
                [
                    'desired_location' => $data['desired_location'] ?? null,
                    'deadline_date' => $data['deadline_date'] ?? null,
                    'status' => 'pending',
                ]
            );

            // Notify company owner if this is a new application
            if ($application->wasRecentlyCreated) {
                $application->load('company.user');
                if ($application->company && $application->company->user) {
                    $application->company->user->notify(new NewApplicationReceived($application));
                }
            }
        }

        return back();
    }

    // list logged-in user's applications
    public function index()
    {
        $userId = auth()->id();
        $applications = Application::with([
            'company.user',
            'company.opportunity',
            'company.background',
            'company.requirements',
            'company.marketing'
        ])
            ->where('user_id', $userId)
            ->where('is_cancelled', false)
            ->latest()
            ->get();

        return Inertia::render('Applicant/AppliedCompanies', [
            'applications' => $applications,
        ]);
    }

    // get applied company IDs for the authenticated user
    public function getAppliedCompanyIds()
    {
        $userId = auth()->id();
        $appliedCompanyIds = Application::where('user_id', $userId)
            ->where('is_cancelled', false)
            ->pluck('company_id')
            ->toArray();

        return response()->json($appliedCompanyIds);
    }
    public function destroy($companyId)
{
    $userId = auth()->id();

    $application = Application::where('user_id', $userId)
        ->where('company_id', $companyId)
        ->first();

    if (!$application) {
        return response()->json(['error' => 'Application not found'], 404);
    }

    // Use DB query to ensure the update happens
    DB::table('applications')
        ->where('user_id', $userId)
        ->where('company_id', $companyId)
        ->update([
            'is_cancelled' => 1,
            'cancelled_at' => now(),
        ]);

    return response()->json(['message' => 'Application cancelled successfully']);
}
}
