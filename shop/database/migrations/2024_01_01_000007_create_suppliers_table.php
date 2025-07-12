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
        Schema::create('FORNITORI', function (Blueprint $table) {
            $table->string('CodiceFornitore')->primary();
            $table->string('Nome');
            $table->string('Telefono');
            $table->string('Email');
            $table->timestamps();

            $table->index('Nome');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('FORNITORI');
    }
}; 