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
        Schema::create('APPARTENENZE', function (Blueprint $table) {
            $table->string('CodiceRicambio');
            $table->string('CodiceModello');
            $table->timestamps();

            $table->foreign('CodiceRicambio')->references('CodiceRicambio')->on('RICAMBI')->onDelete('cascade');
            $table->foreign('CodiceModello')->references('CodiceModello')->on('MODELLI')->onDelete('cascade');
            $table->primary(['CodiceRicambio', 'CodiceModello']);
            $table->index('CodiceModello');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('APPARTENENZE');
    }
}; 