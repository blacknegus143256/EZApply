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
        Schema::create('archived_users', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('original_user_id')->unique();
            $table->string('email');
            $table->text('user_data'); // JSON data of user
            $table->text('basic_info_data')->nullable(); // JSON data of basic info
            $table->text('address_data')->nullable(); // JSON data of address
            $table->text('financial_data')->nullable(); // JSON data of financial
            $table->text('affiliations_data')->nullable(); // JSON data of affiliations
            $table->text('attachments_data')->nullable(); // JSON data of attachments
            $table->text('applications_data')->nullable(); // JSON data of applications
            $table->text('company_data')->nullable(); // JSON data of company
            $table->timestamp('archived_at');
            $table->unsignedBigInteger('archived_by')->nullable(); // Admin who archived
            $table->timestamp('restored_at')->nullable();
            $table->unsignedBigInteger('restored_by')->nullable(); // Admin who restored
            $table->timestamps();

            $table->index('original_user_id');
            $table->index('archived_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('archived_users');
    }
};
