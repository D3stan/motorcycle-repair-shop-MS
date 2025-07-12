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
            $table->time('Ora');
            $table->enum('Tipo', ['maintenance', 'dyno_testing']);
            $table->enum('Stato', ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'])->default('pending');
            $table->text('Note')->nullable();
            $table->string('CF');
            $table->string('NumTelaio');
            $table->timestamps();

            $table->foreign('CF')->references('CF')->on('users')->onDelete('cascade');
            $table->foreign('NumTelaio')->references('NumTelaio')->on('MOTO')->onDelete('cascade');
            $table->index(['CF', 'DataAppuntamento']);
            $table->index('DataAppuntamento');
            $table->index('Stato');
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