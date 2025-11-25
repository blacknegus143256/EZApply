<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->renameColumn('deadline_date', 'preferred_date');
        });
    }

    public function down()
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->renameColumn('preferred_date', 'deadline_date');
        });
    }
};
