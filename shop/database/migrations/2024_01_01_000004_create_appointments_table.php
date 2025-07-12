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
        Schema::create('APPUNTAMENTI', function (Blueprint $table) {
            $table->string('CodiceAppuntamento')->primary();
            $table->date('DataAppuntamento');
            $table->text('Descrizione');
            $table->enum('Tipo', ['manutenzione', 'prova_banco']);
            $table->string('CF');
            $table->timestamps();

            $table->foreign('CF')->references('CF')->on('users')->onDelete('cascade');
            $table->index(['CF', 'DataAppuntamento']);
            $table->index('DataAppuntamento');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('APPUNTAMENTI');
    }
}; 