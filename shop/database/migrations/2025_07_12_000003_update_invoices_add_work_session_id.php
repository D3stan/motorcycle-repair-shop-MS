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
        // Fix SESSIONI table structure according to report
        Schema::table('SESSIONI', function (Blueprint $table) {
            $table->dropColumn(['DataInizio', 'DataFine']);
        });

        Schema::table('SESSIONI', function (Blueprint $table) {
            $table->date('Data')->after('CodiceSessione');
            $table->index('Data');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('SESSIONI', function (Blueprint $table) {
            $table->dropColumn('Data');
        });

        Schema::table('SESSIONI', function (Blueprint $table) {
            $table->datetime('DataInizio')->after('CodiceSessione');
            $table->datetime('DataFine')->nullable()->after('DataInizio');
            $table->index('DataInizio');
        });
    }
}; 