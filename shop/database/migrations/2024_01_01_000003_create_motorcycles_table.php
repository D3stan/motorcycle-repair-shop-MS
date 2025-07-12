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
        Schema::create('MOTO', function (Blueprint $table) {
            $table->string('NumTelaio')->primary();
            $table->string('Targa')->unique();
            $table->integer('AnnoImmatricolazione');
            $table->text('Note')->nullable();
            $table->string('CodiceModello');
            $table->string('CF');
            $table->timestamps();

            $table->foreign('CodiceModello')->references('CodiceModello')->on('MODELLI')->onDelete('cascade');
            $table->foreign('CF')->references('CF')->on('users')->onDelete('cascade');
            $table->index(['CF', 'created_at']);
            $table->index('CodiceModello');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('MOTO');
    }
}; 