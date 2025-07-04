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
        Schema::create('warehouse_parts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('part_id')->constrained()->onDelete('cascade'); // CodiceRicambio
            $table->foreignId('warehouse_id')->constrained()->onDelete('cascade'); // CodiceMagazzino
            $table->integer('quantity')->default(0);
            $table->string('location_in_warehouse')->nullable(); // Shelf, bin, etc.
            $table->timestamps();

            $table->unique(['part_id', 'warehouse_id']);
            $table->index(['warehouse_id', 'quantity']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('warehouse_parts');
    }
}; 