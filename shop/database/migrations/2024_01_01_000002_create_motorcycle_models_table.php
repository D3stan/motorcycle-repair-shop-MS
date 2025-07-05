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
        Schema::create('motorcycle_models', function (Blueprint $table) {
            $table->id();
            $table->string('brand'); // Marca
            $table->string('name'); // Nome
            $table->string('model_code')->unique(); // CodiceModello
            $table->integer('engine_size'); // Cilindrata
            $table->string('segment'); // Segmento (e.g., sport, touring, naked, etc.)
            $table->integer('power'); // Potenza (in HP)
            $table->timestamps();

            $table->index(['brand', 'name']);
            $table->index('segment');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('motorcycle_models');
    }
}; 