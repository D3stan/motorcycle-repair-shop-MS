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
        Schema::create('model_parts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('part_id')->constrained()->onDelete('cascade'); // CodiceRicambio
            $table->foreignId('motorcycle_model_id')->constrained()->onDelete('cascade'); // CodiceModello
            $table->boolean('is_compatible')->default(true);
            $table->string('compatibility_notes')->nullable();
            $table->timestamps();

            $table->unique(['part_id', 'motorcycle_model_id']);
            $table->index(['motorcycle_model_id', 'is_compatible']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('model_parts');
    }
}; 