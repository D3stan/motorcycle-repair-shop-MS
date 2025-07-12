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
        // Remove extra fields from RICAMBI table to match schema exactly
        Schema::table('RICAMBI', function (Blueprint $table) {
            $table->dropColumn(['PrezzoVendita', 'Categoria', 'QuantitaDisponibile', 'ScortaMinima']);
        });

        // Remove extra fields from FORNITORI table to match schema exactly  
        Schema::table('FORNITORI', function (Blueprint $table) {
            $table->dropColumn(['Indirizzo', 'Citta', 'CAP', 'Paese', 'Note']);
        });

        // Remove CF field from INTERVENTI table - not in target schema
        Schema::table('INTERVENTI', function (Blueprint $table) {
            $table->dropForeign(['CF']);
            $table->dropColumn('CF');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('RICAMBI', function (Blueprint $table) {
            $table->decimal('PrezzoVendita', 10, 2)->after('PrezzoFornitore');
            $table->string('Categoria')->after('Descrizione');
            $table->integer('QuantitaDisponibile')->default(0)->after('PrezzoVendita');
            $table->integer('ScortaMinima')->default(0)->after('QuantitaDisponibile');
        });

        Schema::table('FORNITORI', function (Blueprint $table) {
            $table->string('Indirizzo')->nullable()->after('Email');
            $table->string('Citta')->nullable()->after('Indirizzo');
            $table->string('CAP')->nullable()->after('Citta');
            $table->string('Paese')->default('Italia')->after('CAP');
            $table->text('Note')->nullable()->after('Paese');
        });

        Schema::table('INTERVENTI', function (Blueprint $table) {
            $table->string('CF')->after('Nome');
            $table->foreign('CF')->references('CF')->on('users')->onDelete('cascade');
            $table->index('CF');
        });
    }
};
