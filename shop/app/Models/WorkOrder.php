<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;
use App\Models\User;
use App\Models\Motorcycle;

class WorkOrder extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     */
    protected $table = 'INTERVENTI';

    /**
     * The primary key for the model.
     */
    protected $primaryKey = 'CodiceIntervento';

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
        'CodiceIntervento',
        'DataInizio',
        'DataFine',
        'KmMoto',
        'Tipo',
        'Stato',
        'Causa',
        'OreImpiegate',
        'Note',
        'Nome',
        'NumTelaio',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'DataInizio' => 'datetime',
            'DataFine' => 'datetime',
            'OreImpiegate' => 'decimal:2',
            'KmMoto' => 'integer',
        ];
    }

    /**
     * Get the motorcycle for this work order.
     */
    public function motorcycle(): BelongsTo
    {
        return $this->belongsTo(Motorcycle::class, 'NumTelaio', 'NumTelaio');
    }

    /**
     * Get the invoice for this work order.
     */
    public function invoice(): HasOne
    {
        return $this->hasOne(Invoice::class, 'CodiceIntervento', 'CodiceIntervento');
    }

    /**
     * Get the parts used in this work order (UTILIZZI relationship).
     */
    public function parts(): BelongsToMany
    {
        return $this->belongsToMany(Part::class, 'UTILIZZI', 'CodiceIntervento', 'CodiceRicambio')
            ->withPivot('Quantita', 'Prezzo')
            ->withTimestamps();
    }

    /**
     * Get the mechanics directly assigned to this work order (SVOLGIMENTI relationship).
     */
    public function mechanics(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'SVOLGIMENTI', 'CodiceIntervento', 'CF')
            ->withTimestamps();
    }

    /**
     * Customer owning this work order via the motorcycle.
     */
    public function user(): HasOneThrough
    {
        return $this->hasOneThrough(
            User::class,        // Final model
            Motorcycle::class,  // Intermediate model
            'NumTelaio',        // Foreign key on MOTO table
            'CF',               // Foreign key on users table  
            'NumTelaio',        // Local key on INTERVENTI table
            'CF'                // Local key on MOTO table
        );
    }
} 