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
        Schema::create('INTERVENTI', function (Blueprint $table) {
            $table->string('CodiceIntervento')->primary();
            $table->datetime('DataInizio');
            $table->datetime('DataFine')->nullable();
            $table->integer('KmMoto');
            $table->enum('Tipo', ['manutenzione_ordinaria', 'manutenzione_straordinaria']);
            $table->string('Causa')->nullable();
            $table->decimal('OreImpiegate', 5, 2)->default(0);
            $table->text('Note')->nullable();
            $table->string('Nome');
            $table->string('NumTelaio');
            $table->timestamps();

            $table->foreign('NumTelaio')->references('NumTelaio')->on('MOTO')->onDelete('cascade');
            $table->index(['NumTelaio', 'DataInizio']);
            $table->index('DataInizio');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('INTERVENTI');
    }
}; 