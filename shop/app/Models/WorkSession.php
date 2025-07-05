<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class WorkSession extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'session_code',
        'motorcycle_id',
        'start_time',
        'end_time',
        'hours_worked',
        'notes',
        'session_type',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'start_time' => 'datetime',
            'end_time' => 'datetime',
            'hours_worked' => 'decimal:2',
        ];
    }

    /**
     * Get the motorcycle for this session.
     */
    public function motorcycle(): BelongsTo
    {
        return $this->belongsTo(Motorcycle::class);
    }

    /**
     * Get the mechanics working on this session.
     */
    public function mechanics(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'mechanic_sessions')
            ->withPivot('role')
            ->withTimestamps()
            ->where('users.type', 'mechanic');
    }

    /**
     * Calculate the duration of the session.
     */
    public function getDurationAttribute(): ?float
    {
        if ($this->start_time && $this->end_time) {
            return $this->start_time->diffInHours($this->end_time, true);
        }
        return null;
    }

    /**
     * Check if the session is currently active.
     */
    public function isActive(): bool
    {
        return $this->start_time && !$this->end_time;
    }
} 