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
        Schema::table('APPUNTAMENTI', function (Blueprint $table) {
            $table->enum('Stato', ['pending', 'accepted', 'rejected'])->default('pending')->after('Tipo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('APPUNTAMENTI', function (Blueprint $table) {
            $table->dropColumn('Stato');
        });
    }
};