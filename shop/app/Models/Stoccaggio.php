<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Stoccaggio extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     */
    protected $table = 'STOCCAGGI';

    /**
     * The primary key for the model.
     */
    protected $primaryKey = ['CodiceMagazzino', 'CodiceRicambio'];

    /**
     * The "type" of the primary key ID.
     */
    protected $keyType = 'string';

    /**
     * Indicates if the IDs are auto-incrementing.
     */
    public $incrementing = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'CodiceMagazzino',
        'CodiceRicambio',
        'Quantita',
        'QuantitaMinima',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'Quantita' => 'integer',
            'QuantitaMinima' => 'integer',
        ];
    }

    /**
     * Get the warehouse for this storage relationship.
     */
    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class, 'CodiceMagazzino', 'CodiceMagazzino');
    }

    /**
     * Get the part for this storage relationship.
     */
    public function part(): BelongsTo
    {
        return $this->belongsTo(Part::class, 'CodiceRicambio', 'CodiceRicambio');
    }
}