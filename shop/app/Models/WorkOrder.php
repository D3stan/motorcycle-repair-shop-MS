<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\User;
use App\Models\Motorcycle;
use App\Models\WorkSession;

class WorkOrder extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'motorcycle_id',
        'title',
        'work_type',
        'km_start',
        'hours_worked',
        'cause',
        'description',
        'status',
        'started_at',
        'completed_at',
        'labor_cost',
        'parts_cost',
        'total_cost',
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
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
            'labor_cost' => 'decimal:2',
            'parts_cost' => 'decimal:2',
            'total_cost' => 'decimal:2',
            'hours_worked' => 'decimal:2',
            'km_start' => 'integer',
        ];
    }

    /**
     * Get the motorcycle for this work order.
     */
    public function motorcycle(): BelongsTo
    {
        return $this->belongsTo(Motorcycle::class);
    }

    /**
     * Get the invoice for this work order.
     */
    public function invoice(): HasOne
    {
        return $this->hasOne(Invoice::class);
    }

    /**
     * Get the parts used in this work order.
     */
    public function parts(): BelongsToMany
    {
        return $this->belongsToMany(Part::class, 'work_order_parts')
            ->withPivot('quantity', 'unit_price', 'total_price')
            ->withTimestamps();
    }

    /**
     * Convenience relation: latest appointment on the same motorcycle.
     */
    public function appointment(): HasOne
    {
        return $this->hasOne(Appointment::class, 'motorcycle_id', 'motorcycle_id')->latestOfMany('appointment_date');
    }

    /**
     * Customer owning this work order via the motorcycle.
     */
    public function user(): HasOneThrough
    {
        return $this->hasOneThrough(
            User::class,     // Final model
            Motorcycle::class, // Intermediate model
            'id',            // Foreign key on motorcycles table...
            'id',            // Foreign key on users table...
            'motorcycle_id', // Local key on work_orders table...
            'user_id'        // Local key on motorcycles table...
        );
    }

    /**
     * Get the mechanics directly assigned to this work order (SVOLGIMENTI relationship).
     */
    public function mechanics(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'mechanic_work_orders', 'work_order_id', 'user_id')
            ->withPivot('assigned_at', 'started_at', 'completed_at', 'notes')
            ->withTimestamps()
            ->where('users.type', 'mechanic');
    }
} 