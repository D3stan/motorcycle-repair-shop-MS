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
        Schema::create('mechanic_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Mechanic (CF)
            $table->foreignId('work_session_id')->constrained()->onDelete('cascade'); // CodiceSessione
            $table->string('role')->default('primary'); // primary, assistant, supervisor
            $table->timestamps();

            $table->unique(['user_id', 'work_session_id']);
            $table->index(['work_session_id', 'role']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mechanic_sessions');
    }
}; 