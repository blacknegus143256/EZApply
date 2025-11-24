<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('deactivation_requested_at')->nullable()->after('email_verified_at');
            $table->timestamp('deactivation_scheduled_at')->nullable()->after('deactivation_requested_at');
            $table->boolean('is_deactivated')->default(false)->after('deactivation_scheduled_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['deactivation_requested_at', 'deactivation_scheduled_at', 'is_deactivated']);
        });
    }
};
