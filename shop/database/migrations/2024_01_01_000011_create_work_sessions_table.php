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
        Schema::create('work_sessions', function (Blueprint $table) {
            $table->id();
            $table->string('session_code')->unique(); // CodiceSessione
            $table->foreignId('motorcycle_id')->constrained()->onDelete('cascade'); // NumTelaio reference
            $table->datetime('start_time'); // DataInizio
            $table->datetime('end_time')->nullable();
            $table->decimal('hours_worked', 5, 2); // OreImpiegate
            $table->text('notes')->nullable(); // Note
            $table->string('session_type')->default('maintenance'); // maintenance, dyno, diagnosis, etc.
            $table->timestamps();

            $table->index(['motorcycle_id', 'start_time']);
            $table->index('session_code');
            $table->index('session_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_sessions');
    }
}; 