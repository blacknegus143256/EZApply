<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ArchiveUser;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ArchiveController extends Controller
{
    /**
     * Display a listing of archived users.
     */
    public function index(Request $request): Response
    {
        $archivedUsers = ArchiveUser::with(['archivedBy', 'restoredBy'])
            ->orderBy('archived_at', 'desc')
            ->paginate(15);

        return Inertia::render('Admin/ArchivedUsers', [
            'archivedUsers' => $archivedUsers,
        ]);
    }

    /**
     * Show details of an archived user
     */
    public function show($id)
    {
        $archivedUser = ArchiveUser::with(['archivedBy', 'restoredBy'])->findOrFail($id);

        return Inertia::render('Admin/ArchivedUserDetail', [
            'archivedUser' => $archivedUser,
        ]);
    }

    /**
     * Restore an archived user account
     */
    public function restore(Request $request, $id)
    {
        $archivedUser = ArchiveUser::findOrFail($id);

        if ($archivedUser->restored_at) {
            return redirect()->back()->withErrors([
                'message' => 'This account has already been restored.'
            ]);
        }

        try {
            DB::beginTransaction();

            // Check if original user still exists
            $existingUser = User::find($archivedUser->original_user_id);

            if ($existingUser && !$existingUser->isDeactivated()) {
                return redirect()->back()->withErrors([
                    'message' => 'A user with this ID already exists and is active.'
                ]);
            }

            // If user exists but is deactivated, restore it
            if ($existingUser) {
                $existingUser->is_deactivated = false;
                $existingUser->deactivation_requested_at = null;
                $existingUser->deactivation_scheduled_at = null;
                $existingUser->save();
            } else {
                // Recreate user from archived data
                $userData = $archivedUser->user_data;
                $user = User::create([
                    'id' => $archivedUser->original_user_id,
                    'email' => $archivedUser->email,
                    'password' => $userData['password'] ?? bcrypt('temp_password'),
                    'credits' => $userData['credits'] ?? 0,
                    'email_verified_at' => $userData['email_verified_at'] ?? null,
                    'is_deactivated' => false,
                    'deactivation_requested_at' => null,
                    'deactivation_scheduled_at' => null,
                ]);

                // Restore relationships if data exists
                if ($archivedUser->basic_info_data) {
                    $user->basicInfo()->create($archivedUser->basic_info_data);
                }
                if ($archivedUser->address_data) {
                    $user->address()->create($archivedUser->address_data);
                }
                if ($archivedUser->financial_data) {
                    $user->financial()->create($archivedUser->financial_data);
                }
            }

            // Mark archive as restored
            $archivedUser->restored_at = now();
            $archivedUser->restored_by = $request->user()->id;
            $archivedUser->save();

            DB::commit();

            return redirect()->back()->with('success', 'Account restored successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors([
                'message' => 'Failed to restore account: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Cancel a pending deactivation request
     */
    public function cancelDeactivation(Request $request, $userId)
    {
        $user = User::findOrFail($userId);

        if (!$user->hasRequestedDeactivation() || $user->isDeactivated()) {
            return redirect()->back()->withErrors([
                'message' => 'This account does not have a pending deactivation request.'
            ]);
        }

        $user->deactivation_requested_at = null;
        $user->deactivation_scheduled_at = null;
        $user->save();

        return redirect()->back()->with('success', 'Deactivation request cancelled successfully.');
    }
}
