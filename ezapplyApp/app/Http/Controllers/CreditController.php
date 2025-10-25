<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UserCredit;
use App\Models\ApplicantView;
use App\Models\CreditTransaction;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CreditController extends Controller
{
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
            return back()->withErrors([
                'message' => 'Missing application ID or field key.',
            ]);
        }

        $basicProfileFields = ['first_name', 'last_name'];

        $alreadyViewedSpecificField = ApplicantView::where('user_id', $user->id)
            ->where('application_id', $applicationId)
            ->where('field_key', $fieldKey)
            ->exists();

            $allBasicFieldsViewed = false;
        if ($fieldKey === 'basic_profile') {
            $existingBasicViews = ApplicantView::where('user_id', $user->id)
                ->where('application_id', $applicationId)
                ->whereIn('field_key', $basicProfileFields)
                ->pluck('field_key')
                ->toArray();
            $allBasicFieldsViewed = count(array_diff($basicProfileFields, $existingBasicViews)) === 0;
        }

        if ($alreadyViewedSpecificField || ($fieldKey === 'basic_profile' && $allBasicFieldsViewed)) {
            return back()->with('success', 'You already paid to view this field.')
                ->with('already_paid', true);
        }

        $userCredit = UserCredit::firstOrCreate(
            ['user_id' => $user->id],
            ['balance' => 0]
        );

        if ($userCredit->balance < $cost) {
            return back()->withErrors([
                'balance' => 'Insufficient credits. Current balance: ' . $userCredit->balance,
            ]);
        }

        try {
            DB::transaction(function () use ($userCredit, $cost, $user, $applicationId, $fieldKey, $basicProfileFields) {
                $userCredit->balance -= $cost;
                $userCredit->save();

                $description = '';
                if ($fieldKey === 'basic_profile') {
                    foreach ($basicProfileFields as $profileFieldKey) {
                        ApplicantView::firstOrCreate(
                            [
                                'user_id' => $user->id,
                                'application_id' => $applicationId,
                                'field_key' => $profileFieldKey,
                            ],
                            ['paid' => true]
                        );
                    }
                    $description = "Viewed basic profile of applicant ID: {$applicationId}";
                } else {
                    ApplicantView::create([
                        'user_id' => $user->id,
                        'application_id' => $applicationId,
                        'field_key' => $fieldKey,
                        'paid' => true,
                    ]);
                    $description = "Viewed {$fieldKey} of applicant ID: {$applicationId}";
                }

                CreditTransaction::create([
                    'user_id' => $user->id,
                    'amount' => $cost,
                    'type' => 'usage',
                    'description' => $description,
                    'metadata' => [
                        'application_id' => $applicationId,
                        'field_key' => $fieldKey,
                    ],
                ]);
            });

            return back()->with('success', 'Field successfully revealed! ' . $cost . ' credits deducted.')
                ->with('new_balance', $userCredit->balance);

        } catch (\Exception $e) {
            Log::error("Credit transaction failed for user {$user->id}, applicant {$applicationId}, field {$fieldKey}: " . $e->getMessage());
            return back()->withErrors([
                'message' => 'Failed to process payment. Please try again.',
            ]);
        }
    }

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