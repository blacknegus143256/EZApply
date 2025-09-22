<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

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

    
}
