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
        Schema::create('SESSIONI', function (Blueprint $table) {
            $table->string('CodiceSessione')->primary();
            $table->datetime('DataInizio');
            $table->decimal('OreImpiegate', 5, 2);
            $table->text('Note')->nullable();
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
        Schema::dropIfExists('SESSIONI');
    }
}; 