<?php

namespace App\Http\Controllers;

use App\Models\Financial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class FinancialController extends Controller
{
    /**
     * Display the financial info form.
     */
    public function index()
    {
        $user = Auth::user();
        $financial = $user->financial;
        
        return Inertia::render('Applicant/FinancialInfo', [
            'financial' => $financial
        ]);
    }

    /**
     * Store or update financial info.
     */
    public function store(Request $request)
    {
        $request->validate([
            'annual_income' => 'required|numeric|min:0',
            'salary' => 'required|numeric|min:0',
        ]);

        $user = Auth::user();
        
        $financial = $user->financial()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'annual_income' => $request->annual_income,
                'salary' => $request->salary,
            ]
        );

        return redirect()->back()->with('success', 'Financial information saved successfully!');
    }
}
