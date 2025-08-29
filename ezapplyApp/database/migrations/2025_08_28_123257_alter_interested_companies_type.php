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
    Schema::table('franchise_information', function (Blueprint $table) {
        $table->json('interested_companies')->nullable()->change();
    });
}

public function down(): void
{
    Schema::table('franchise_information', function (Blueprint $table) {
        $table->longText('interested_companies')->nullable()->change();
    });
}
};
