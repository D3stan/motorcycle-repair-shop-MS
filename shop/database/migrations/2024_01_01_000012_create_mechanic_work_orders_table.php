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
        Schema::create('SVOLGIMENTI', function (Blueprint $table) {
            $table->string('CodiceIntervento');
            $table->string('CF');
            $table->timestamps();

            $table->foreign('CodiceIntervento')->references('CodiceIntervento')->on('INTERVENTI')->onDelete('cascade');
            $table->foreign('CF')->references('CF')->on('users')->onDelete('cascade');
            $table->primary(['CodiceIntervento', 'CF']);
            $table->index('CF');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('SVOLGIMENTI');
    }
}; 