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
        Schema::create('FATTURE', function (Blueprint $table) {
            $table->string('CodiceFattura')->primary();
            $table->decimal('Importo', 10, 2);
            $table->date('Data');
            $table->text('Note')->nullable();
            $table->string('CF');
            $table->string('CodiceIntervento')->nullable();
            $table->string('CodiceSessione')->nullable();
            $table->timestamps();

            $table->foreign('CF')->references('CF')->on('users')->onDelete('cascade');
            $table->foreign('CodiceIntervento')->references('CodiceIntervento')->on('INTERVENTI')->onDelete('cascade');
            $table->foreign('CodiceSessione')->references('CodiceSessione')->on('SESSIONI')->onDelete('cascade');
            $table->index(['CF', 'Data']);
            $table->index('Data');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('FATTURE');
    }
}; 