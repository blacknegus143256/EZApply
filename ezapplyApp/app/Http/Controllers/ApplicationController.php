<?php

namespace App\Http\Controllers;

use App\Models\Application;
use Illuminate\Http\Request;
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
            Application::firstOrCreate(
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
        }

        return response()->noContent();
    }

    // list logged-in user's applications
    public function index()
    {
        $userId = auth()->id();
        $applications = Application::with(['company.user'])
            ->where('user_id', $userId)
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
            ->pluck('company_id')
            ->toArray();

        return response()->json($appliedCompanyIds);
    }
}
