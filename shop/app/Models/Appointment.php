<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Appointment extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     */
    protected $table = 'APPUNTAMENTI';

    /**
     * The primary key for the model.
     */
    protected $primaryKey = 'CodiceAppuntamento';

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
        'CodiceAppuntamento',
        'DataAppuntamento',
        'Ora',
        'Tipo',
        'Stato',
        'Note',
        'CF',
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
            'DataAppuntamento' => 'date',
            'Ora' => 'datetime',
        ];
    }

    /**
     * Get the user that owns the appointment (CREAZIONE relationship).
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'CF', 'CF');
    }

    /**
     * Get the motorcycle for this appointment (RELATIVO relationship).
     */
    public function motorcycle(): BelongsTo
    {
        return $this->belongsTo(Motorcycle::class, 'NumTelaio', 'NumTelaio');
    }

    /**
     * Get the work orders created from this appointment's motorcycle.
     */
    public function workOrders(): HasMany
    {
        return $this->hasMany(WorkOrder::class, 'NumTelaio', 'NumTelaio');
    }

    /**
     * LEGACY: keep method for compatibility with ScheduleController exists() checks.
     * Returns true if the motorcycle already has at least one work order.
     */
    public function hasWorkOrder(): bool
    {
        return $this->workOrders()->exists();
    }
} 