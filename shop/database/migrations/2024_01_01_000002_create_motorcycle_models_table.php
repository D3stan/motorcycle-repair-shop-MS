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
        Schema::create('MODELLI', function (Blueprint $table) {
            $table->string('CodiceModello')->primary();
            $table->string('Marca');
            $table->string('Nome');
            $table->integer('Cilindrata');
            $table->string('Segmento');
            $table->decimal('Potenza', 5, 2);
            $table->timestamps();

            $table->index(['Marca', 'Nome']);
            $table->index('Segmento');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('MODELLI');
    }
}; 