<?php

namespace App\Http\Controllers;

use App\Models\Affiliation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AffiliationController extends Controller
{
    /**
     * Display the affiliations form.
     */
    public function index()
    {
        $user = Auth::user();
        $affiliations = $user->affiliations ?? collect();
        
        return Inertia::render('Applicant/Affiliations', [
            'affiliations' => $affiliations
        ]);
    }

    /**
     * Store or update affiliations.
     */
    public function store(Request $request)
    {
        $request->validate([
            'affiliations' => 'required|array|min:1',
            'affiliations.*.institution' => 'required|string|max:255',
            'affiliations.*.position' => 'required|string|max:255',
        ]);

        $user = Auth::user();
        
        // Delete existing affiliations
        $user->affiliations()->delete();
        
        // Create new affiliations
        foreach ($request->affiliations as $affiliationData) {
            $user->affiliations()->create([
                'institution' => $affiliationData['institution'],
                'position' => $affiliationData['position'],
            ]);
        }

        return redirect()->back()->with('success', 'Affiliations saved successfully!');
    }
}
