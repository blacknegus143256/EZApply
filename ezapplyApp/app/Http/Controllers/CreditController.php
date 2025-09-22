<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\UserCredit;

class CreditController extends Controller
{
    //
    public function creditDisplay()
{
    $user = auth()->user();
    $credits = $user?->credit?->balance ?? 0;

    return inertia('Credits/balancePage', [
        'balance' => $credits,
    ]);
}

public function deductBalance(Request $request)
{
    $user = auth()->user();
    $newBalance = $request->input('new_balance');

    if ($newBalance === null) {
        return response()->json(['error' => 'No balance provided'], 400);
    }

    $userCredit = UserCredit::firstOrCreate(
        ['user_id' => $user->id],
        ['balance' => 0]
    );

    
    $userCredit->balance = $newBalance;

    if ($userCredit->save()) {
        return response()->json([
            'status' => 'success',
            'new_balance' => $userCredit->balance,
            'message' => 'Balance updated successfully'
        ]);
    } else {
        return response()->json([
            'status' => 'error',
            'message' => 'Failed to update balance'
        ], 500);
    }
}






    
}
