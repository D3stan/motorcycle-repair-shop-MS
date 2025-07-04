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
        Schema::create('parts', function (Blueprint $table) {
            $table->id();
            $table->string('part_code')->unique(); // CodiceRicambio
            $table->string('brand'); // Marca
            $table->string('name'); // Nome
            $table->text('description')->nullable(); // Descrizione
            $table->decimal('supplier_price', 10, 2); // PrezzoFornitore
            $table->decimal('selling_price', 10, 2)->nullable(); // Markup price for customers
            $table->string('category')->nullable(); // Category for parts organization
            $table->integer('stock_quantity')->default(0);
            $table->integer('minimum_stock')->default(0);
            $table->foreignId('supplier_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            $table->index(['brand', 'name']);
            $table->index('category');
            $table->index('part_code');
            $table->index('supplier_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('parts');
    }
}; 