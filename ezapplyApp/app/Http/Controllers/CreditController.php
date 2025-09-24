<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UserCredit;
use App\Models\ApplicantView;
use Inertia\Inertia;
use App\Models\CreditTransaction;

class CreditController extends Controller
{

    public function creditDisplay()
    {
        $user = auth()->user();
        $credits = $user?->credit?->balance ?? 0;

        return inertia('Credits/balancePage', [
            'balance' => $credits,
        ]);
    }

    public function viewApplicant(Request $request)
    {
        $user = auth()->user();
        $applicationId = $request->input('application_id');
        $cost = 50;

        $userCredit = UserCredit::firstOrCreate(
            ['user_id' => $user->id],
            ['balance' => 0]
        );

        if ($userCredit->balance < $cost) {
            return back()->withErrors(['balance' => 'Insufficient credits']);
        }
     
        $userCredit->balance -= $cost;
        $userCredit->save();

        ApplicantView::create(attributes: [
            'user_id'       => $user->id,
            'application_id'=> $applicationId,
            'paid'          => true,
        ]);
        $type = 'usage'; 
        $description = 'Viewed applicant profile for application ID: ' . $applicationId;
        $metadata = ['application_id' => $applicationId];

        CreditTransaction::create(attributes: [
            'user_id'       => $user->id,
            'amount'        => $cost,
            'type'          => $type,
            'description'   => $description,
            'metadata'      => $metadata,
            ]);


        return back()->with([
            'message' => 'Payment successful',
            'auth.user.credits' => $userCredit->balance, 
        ]);
    }
    public function checkApplicantView($applicationId)
{
    $user = auth()->user();

    $alreadyViewed = ApplicantView::where('user_id', $user->id)
        ->where('application_id', $applicationId)
        ->exists();

    return response()->json(['already_viewed' => $alreadyViewed]);
}

public function transactionHistory(Request $request){
    $user = auth()->user();
    $credit_transactions = CreditTransaction::where('user_id', $user->id)
        ->orderBy('created_at', 'desc')
        ->get();

    return inertia('Credits/balancePage', [
        'credit_transactions' => $credit_transactions,
    ]);
}
}
