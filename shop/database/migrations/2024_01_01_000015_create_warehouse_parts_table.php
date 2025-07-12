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
        Schema::create('STOCCAGGI', function (Blueprint $table) {
            $table->string('CodiceMagazzino');
            $table->string('CodiceRicambio');
            $table->timestamps();

            $table->foreign('CodiceMagazzino')->references('CodiceMagazzino')->on('MAGAZZINI')->onDelete('cascade');
            $table->foreign('CodiceRicambio')->references('CodiceRicambio')->on('RICAMBI')->onDelete('cascade');
            $table->primary(['CodiceMagazzino', 'CodiceRicambio']);
            $table->index('CodiceRicambio');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('STOCCAGGI');
    }
}; 