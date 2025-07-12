<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Part extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     */
    protected $table = 'RICAMBI';

    /**
     * The primary key for the model.
     */
    protected $primaryKey = 'CodiceRicambio';

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
        'CodiceRicambio',
        'Marca',
        'Nome',
        'Descrizione',
        'PrezzoFornitore',
        'CodiceFornitore',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'PrezzoFornitore' => 'decimal:2',
        ];
    }

    /**
     * Get the supplier for this part (FORNITURA relationship).
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class, 'CodiceFornitore', 'CodiceFornitore');
    }

    /**
     * Get the motorcycle models that use this part (APPARTENENZE relationship).
     */
    public function motorcycleModels(): BelongsToMany
    {
        return $this->belongsToMany(MotorcycleModel::class, 'APPARTENENZE', 'CodiceRicambio', 'CodiceModello')
            ->withTimestamps();
    }

    /**
     * Get the work orders that use this part (UTILIZZI relationship).
     */
    public function workOrders(): BelongsToMany
    {
        return $this->belongsToMany(WorkOrder::class, 'UTILIZZI', 'CodiceRicambio', 'CodiceIntervento')
            ->withPivot('Quantita', 'Prezzo')
            ->withTimestamps();
    }

    /**
     * Get the warehouses storing this part (STOCCAGGI relationship).
     */
    public function warehouses(): BelongsToMany
    {
        return $this->belongsToMany(Warehouse::class, 'STOCCAGGI', 'CodiceRicambio', 'CodiceMagazzino')
            ->withTimestamps();
    }
} 