<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class CreditController extends Controller
{
    //
    public function creditDisplay()
    {
        // For demonstration, we'll use a static balance.
        // In a real application, you would fetch this from the database.
        $balance = 1500; // Example balance amount

        return inertia('Credits/balancePage', ['balance' => $balance]);
    }
}
