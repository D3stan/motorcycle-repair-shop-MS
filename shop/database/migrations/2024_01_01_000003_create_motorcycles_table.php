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
        Schema::create('motorcycles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('motorcycle_model_id')->constrained()->onDelete('cascade');
            $table->string('license_plate')->unique(); // Targa
            $table->integer('registration_year'); // AnnoImmatricolazione
            $table->string('vin')->unique(); // NumTelaio (VIN/chassis number)
            $table->text('notes')->nullable(); // Note
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index('motorcycle_model_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('motorcycles');
    }
}; 