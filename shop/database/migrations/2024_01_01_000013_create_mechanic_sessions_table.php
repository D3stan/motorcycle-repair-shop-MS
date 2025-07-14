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
        Schema::create('AFFIANCAMENTI', function (Blueprint $table) {
            $table->string('CodiceSessione');
            $table->string('CF');
            $table->timestamps();

            $table->foreign('CodiceSessione')->references('CodiceSessione')->on('SESSIONI')->onDelete('cascade');
            $table->foreign('CF')->references('CF')->on('users')->onDelete('cascade');
            $table->primary(['CodiceSessione', 'CF']);
            $table->index('CF');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('AFFIANCAMENTI');
    }
}; 