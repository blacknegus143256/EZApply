<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\ArchiveUser;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ProcessAccountDeactivations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'accounts:process-deactivations';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process account deactivations that are scheduled for today and archive user data';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Processing account deactivations...');

        // Get users scheduled for deactivation today
        $usersToDeactivate = User::pendingDeactivation()->get();

        if ($usersToDeactivate->isEmpty()) {
            $this->info('No accounts scheduled for deactivation today.');
            return Command::SUCCESS;
        }

        $this->info("Found {$usersToDeactivate->count()} account(s) to deactivate.");

        $archivedCount = 0;
        $errorCount = 0;

        foreach ($usersToDeactivate as $user) {
            try {
                DB::beginTransaction();

                // Archive user data
                $this->archiveUserData($user);

                // Mark user as deactivated
                $user->is_deactivated = true;
                $user->save();

                // Logout user if they're currently logged in
                // This is handled by middleware checking is_deactivated

                DB::commit();
                $archivedCount++;
                $this->info("✓ Archived and deactivated user: {$user->email}");
            } catch (\Exception $e) {
                DB::rollBack();
                $errorCount++;
                $this->error("✗ Failed to deactivate user {$user->email}: {$e->getMessage()}");
            }
        }

        $this->info("\nDeactivation process completed:");
        $this->info("  - Successfully archived: {$archivedCount}");
        $this->info("  - Errors: {$errorCount}");

        return Command::SUCCESS;
    }

    /**
     * Archive all user data
     */
    private function archiveUserData(User $user)
    {
        // Load all relationships
        $user->load([
            'basicInfo',
            'address',
            'financial',
            'affiliations',
            'attachments',
            'applications',
            'company',
        ]);

        // Create archive record
        ArchiveUser::create([
            'original_user_id' => $user->id,
            'email' => $user->email,
            'user_data' => $user->toArray(),
            'basic_info_data' => $user->basicInfo ? $user->basicInfo->toArray() : null,
            'address_data' => $user->address ? $user->address->toArray() : null,
            'financial_data' => $user->financial ? $user->financial->toArray() : null,
            'affiliations_data' => $user->affiliations ? $user->affiliations->toArray() : null,
            'attachments_data' => $user->attachments ? $user->attachments->toArray() : null,
            'applications_data' => $user->applications ? $user->applications->toArray() : null,
            'company_data' => $user->company ? $user->company->toArray() : null,
            'archived_at' => now(),
        ]);
    }
}
