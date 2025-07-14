<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Motorcycle extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     */
    protected $table = 'MOTO';

    /**
     * The primary key for the model.
     */
    protected $primaryKey = 'NumTelaio';

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
        'NumTelaio',
        'Targa',
        'AnnoImmatricolazione',
        'Note',
        'CodiceModello',
        'CF',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'AnnoImmatricolazione' => 'integer',
        ];
    }

    /**
     * Get the user that owns the motorcycle.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'CF', 'CF');
    }

    /**
     * Get the motorcycle model.
     */
    public function motorcycleModel(): BelongsTo
    {
        return $this->belongsTo(MotorcycleModel::class, 'CodiceModello', 'CodiceModello');
    }

    /**
     * Get the work orders for this motorcycle.
     */
    public function workOrders(): HasMany
    {
        return $this->hasMany(WorkOrder::class, 'NumTelaio', 'NumTelaio');
    }

    /**
     * Get the appointments for this motorcycle.
     */
    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class, 'NumTelaio', 'NumTelaio');
    }

    /**
     * Get the work sessions for this motorcycle.
     */
    public function workSessions(): HasMany
    {
        return $this->hasMany(WorkSession::class, 'NumTelaio', 'NumTelaio');
    }
} 