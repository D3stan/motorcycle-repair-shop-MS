<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'tax_code',
        'phone',
        'email',
        'type',
        'password',
        'email_verified_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the motorcycles for this user.
     */
    public function motorcycles(): HasMany
    {
        return $this->hasMany(Motorcycle::class);
    }

    /**
     * Get the appointments for this user.
     */
    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    /**
     * Get the invoices for this user.
     */
    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    /**
     * Get all work orders for this user via their motorcycles.
     */
    public function workOrders(): HasManyThrough
    {
        return $this->hasManyThrough(
            WorkOrder::class,
            Motorcycle::class,
            'user_id',        // Foreign key on motorcycles table...
            'motorcycle_id',  // Foreign key on work_orders table...
            'id',             // Local key on users table...
            'id'              // Local key on motorcycles table...
        );
    }

    /**
     * Temporary shim: mechanics can view work orders related to their sessions.
     * Currently returns the same as workOrders until assignment mechanism is rebuilt.
     */
    public function assignedWorkOrders(): HasManyThrough
    {
        return $this->workOrders();
    }

    /**
     * Get the user's full name.
     */
    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    /**
     * Check if user is an admin.
     */
    public function isAdmin(): bool
    {
        return $this->type === 'admin';
    }

    /**
     * Check if user is a mechanic.
     */
    public function isMechanic(): bool
    {
        return $this->type === 'mechanic';
    }

    /**
     * Check if user is a customer.
     */
    public function isCustomer(): bool
    {
        return $this->type === 'customer';
    }

    /**
     * Get the work sessions this mechanic participated in.
     */
    public function workSessions(): BelongsToMany
    {
        return $this->belongsToMany(WorkSession::class, 'mechanic_sessions')
            ->withPivot('role')
            ->withTimestamps();
    }
}
