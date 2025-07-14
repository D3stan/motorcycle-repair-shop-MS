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
        Schema::create('UTILIZZI', function (Blueprint $table) {
            $table->string('CodiceRicambio');
            $table->string('CodiceIntervento');
            $table->integer('Quantita');
            $table->decimal('Prezzo', 10, 2);
            $table->timestamps();

            $table->foreign('CodiceRicambio')->references('CodiceRicambio')->on('RICAMBI')->onDelete('cascade');
            $table->foreign('CodiceIntervento')->references('CodiceIntervento')->on('INTERVENTI')->onDelete('cascade');
            $table->primary(['CodiceRicambio', 'CodiceIntervento']);
            $table->index('CodiceIntervento');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('UTILIZZI');
    }
}; 