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
        Schema::create('RICAMBI', function (Blueprint $table) {
            $table->string('CodiceRicambio')->primary();
            $table->string('Marca');
            $table->string('Nome');
            $table->text('Descrizione')->nullable();
            $table->decimal('PrezzoFornitore', 10, 2);
            $table->string('CodiceFornitore');
            $table->timestamps();

            $table->foreign('CodiceFornitore')->references('CodiceFornitore')->on('FORNITORI')->onDelete('cascade');
            $table->index(['Marca', 'Nome']);
            $table->index('CodiceFornitore');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('RICAMBI');
    }
}; 