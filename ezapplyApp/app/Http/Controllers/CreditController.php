<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UserCredit;
use App\Models\ApplicantView;
use App\Models\CreditTransaction;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB; // CRITICAL ADDITION: Import DB facade

class CreditController extends Controller
{
    /**
     * Display user credit balance
     */
     public function creditDisplay(Request $request) 
    {
        $user = auth()->user();

        if (!$user) {
            return redirect()->route('login');
        }

        $credits = $user?->credit?->balance ?? 0;

        $credit_transactions = CreditTransaction::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get(); 

        return Inertia::render('Credits/balancePage', [
            'balance' => $credits,
            'credit_transactions' => $credit_transactions, 
        ]);
    }

    public function viewApplicant(Request $request)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not authenticated.',
            ], 401);
        }

        $applicationId = $request->input('application_id');
        $fieldKey = $request->input('field_key'); 
        $cost = 5; 

        if (!$applicationId || !$fieldKey) {
            return response()->json([
                'status' => 'error',
                'message' => 'Missing application ID or field key.',
            ], 400);
        }

        
        $alreadyViewed = ApplicantView::where('user_id', $user->id)
            ->where('application_id', $applicationId)
            ->where('field_key', $fieldKey)
            ->exists();

        if ($alreadyViewed) {
            return response()->json([
                'status' => 'success',
                'already_paid' => true,
                'message' => 'You already paid to view this field.',
                'new_balance' => $user->credit?->balance ?? 0, 
            ]);
        }

        $userCredit = UserCredit::firstOrCreate(
            ['user_id' => $user->id],
            ['balance' => 0]
        );

        if ($userCredit->balance < $cost) {
            return response()->json([
                'status' => 'error',
                'message' => 'Insufficient credits.',
                'balance' => 'Insufficient credits.', 
            ], 400);
        }

        try {
            DB::transaction(function () use ($userCredit, $cost, $user, $applicationId, $fieldKey) {

                $userCredit->balance -= $cost;
                $userCredit->save();

                // Log per-field payment
                ApplicantView::create([
                    'user_id' => $user->id,
                    'application_id' => $applicationId,
                    'field_key' => $fieldKey,
                    'paid' => true,
                ]);

                CreditTransaction::create([
                    'user_id' => $user->id,
                    'amount' => $cost,
                    'type' => 'usage',
                    'description' => "Viewed {$fieldKey} of applicant ID: {$applicationId}",
                    'metadata' => [
                        'application_id' => $applicationId,
                        'field_key' => $fieldKey,
                    ],
                ]);
            });
        } catch (\Exception $e) {
            \Log::error("Credit transaction failed for user {$user->id}, applicant {$applicationId}, field {$fieldKey}: " . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to process payment. Please try again.',
            ], 500);
        }


       return back()->with('success', 'Payment successful.')->with('new_balance', $userCredit->balance);
    }

    /**
     * Check if user has already viewed fields for an applicant
     */
    public function checkApplicantView($applicationId)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not authenticated.',
            ], 401);
        }

        $views = ApplicantView::where('user_id', $user->id)
            ->where('application_id', $applicationId)
            ->pluck('field_key')
            ->toArray();

        return response()->json([
            'paid_fields' => $views,
        ]);
    }

    
}