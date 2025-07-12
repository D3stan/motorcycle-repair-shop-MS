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
        Schema::table('work_orders', function (Blueprint $table) {
            // Remove foreign keys and columns if they exist
            if (Schema::hasColumn('work_orders', 'appointment_id')) {
                $table->dropForeign(['appointment_id']);
                $table->dropColumn('appointment_id');
            }
            if (Schema::hasColumn('work_orders', 'user_id')) {
                $table->dropForeign(['user_id']);
                $table->dropColumn('user_id');
            }

            // Add new descriptive and tracking columns
            $table->string('title')->nullable()->after('motorcycle_id');
            $table->string('work_type')->default('maintenance')->after('title');
            $table->integer('km_start')->nullable()->after('work_type');
            $table->decimal('hours_worked', 5, 2)->default(0)->after('km_start');
            $table->string('cause')->nullable()->after('hours_worked');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('work_orders', function (Blueprint $table) {
            $table->dropColumn(['title', 'work_type', 'km_start', 'hours_worked', 'cause']);

            // Re-add the previously removed columns
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('appointment_id')->nullable()->constrained()->onDelete('set null');
        });
    }
}; 