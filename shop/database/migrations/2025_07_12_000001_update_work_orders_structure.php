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
        // Add CF column to INTERVENTI table
        Schema::table('INTERVENTI', function (Blueprint $table) {
            $table->string('CF')->after('Nome');
            $table->foreign('CF')->references('CF')->on('users')->onDelete('cascade');
            $table->index('CF');
        });

        // Add missing fields to RICAMBI table  
        Schema::table('RICAMBI', function (Blueprint $table) {
            $table->decimal('PrezzoVendita', 10, 2)->after('PrezzoFornitore');
            $table->string('Categoria')->after('Descrizione');
            $table->integer('QuantitaDisponibile')->default(0)->after('PrezzoVendita');
            $table->integer('ScortaMinima')->default(0)->after('QuantitaDisponibile');
        });

        // Add missing fields to FORNITORI table
        Schema::table('FORNITORI', function (Blueprint $table) {
            $table->string('Indirizzo')->nullable()->after('Email');
            $table->string('Citta')->nullable()->after('Indirizzo');
            $table->string('CAP')->nullable()->after('Citta');
            $table->string('Paese')->default('Italia')->after('CAP');
            $table->text('Note')->nullable()->after('Paese');
        });

        // Add Quantita field to STOCCAGGI table
        Schema::table('STOCCAGGI', function (Blueprint $table) {
            $table->integer('Quantita')->default(0)->after('CodiceRicambio');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('INTERVENTI', function (Blueprint $table) {
            $table->dropForeign(['CF']);
            $table->dropColumn('CF');
        });

        Schema::table('RICAMBI', function (Blueprint $table) {
            $table->dropColumn(['PrezzoVendita', 'Categoria', 'QuantitaDisponibile', 'ScortaMinima']);
        });

        Schema::table('FORNITORI', function (Blueprint $table) {
            $table->dropColumn(['Indirizzo', 'Citta', 'CAP', 'Paese', 'Note']);
        });

        Schema::table('STOCCAGGI', function (Blueprint $table) {
            $table->dropColumn('Quantita');
        });
    }
}; 