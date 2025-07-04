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
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'motorcycle_model_id',
        'license_plate',
        'registration_year',
        'vin',
        'notes',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'registration_year' => 'integer',
        ];
    }

    /**
     * Get the user that owns the motorcycle.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the motorcycle model.
     */
    public function motorcycleModel(): BelongsTo
    {
        return $this->belongsTo(MotorcycleModel::class);
    }

    /**
     * Get the work orders for this motorcycle.
     */
    public function workOrders(): HasMany
    {
        return $this->hasMany(WorkOrder::class);
    }

    /**
     * Get the appointments for this motorcycle.
     */
    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }
} 