<?php

namespace App\Http\Controllers;

use App\Models\Application;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CompanyApplicantController extends Controller
{
    public function show($id)
    {
        $application = Application::with([
            'user.basicinfo',
            'user.basicInfo',
            'user.affiliations',
            'user.financial',
            'user.attachments',
            'user.address'
        ])
    ->where('is_cancelled', false)
    ->findOrFail($id);
        $applications = Application::with('user.basicinfo')
        ->where('is_cancelled', false)
        ->latest()
        ->get();
        return Inertia::render('Company/Applicants/ApplicantDetails', [
            'application' => $application,
        ]);
    }
}
