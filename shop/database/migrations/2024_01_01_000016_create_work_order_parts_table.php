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
        Schema::create('work_order_parts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('part_id')->constrained()->onDelete('cascade'); // CodiceRicambio
            $table->foreignId('work_order_id')->constrained()->onDelete('cascade'); // CodiceIntervento
            $table->integer('quantity'); // Quantita
            $table->decimal('unit_price', 10, 2); // Prezzo per unit
            $table->decimal('total_price', 10, 2); // Calculated: quantity * unit_price
            $table->timestamps();

            $table->unique(['part_id', 'work_order_id']);
            $table->index(['work_order_id', 'total_price']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_order_parts');
    }
}; 