<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
// Removed HasMany import as work order linkage is no longer persisted

class Appointment extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'motorcycle_id',
        'appointment_date',
        'appointment_time',
        'type',
        'status',
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
            'appointment_date' => 'date',
        ];
    }

    /**
     * Get the user that owns the appointment.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the motorcycle for this appointment.
     */
    public function motorcycle(): BelongsTo
    {
        return $this->belongsTo(Motorcycle::class);
    }

    /**
     * Get the work orders created from this appointment's motorcycle.
     */
    public function workOrders(): HasMany
    {
        return $this->hasMany(WorkOrder::class, 'motorcycle_id', 'motorcycle_id');
    }

    /**
     * LEGACY: keep method for compatibility with ScheduleController exists() checks.
     * Returns true if the motorcycle already has at least one work order.
     */
    public function hasWorkOrder(): bool
    {
        return $this->workOrders()->exists();
    }

    // workOrders relation removed: appointments no longer persistently linked to work orders
} 