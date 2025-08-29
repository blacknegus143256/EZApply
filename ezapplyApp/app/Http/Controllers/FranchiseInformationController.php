<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\FranchiseInformation;

class FranchiseInformationController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'net_worth' => 'nullable|numeric',
            'liquid_assets' => 'nullable|numeric',
            'source_of_funds' => 'nullable|string|max:255',
            'annual_income' => 'nullable|numeric',
            'investment_budget' => 'nullable|numeric',
            'location' => 'nullable|string|max:255',
            'franchise_type' => 'nullable|string|max:255',
            'timeline' => 'nullable|date',
        ]);

        $record = FranchiseInformation::updateOrCreate(
            ['user_id' => Auth::id()],
            array_merge($data, ['user_id' => Auth::id()])
        );

        return response()->json(['message' => 'Saved', 'data' => $record]);
    }
}