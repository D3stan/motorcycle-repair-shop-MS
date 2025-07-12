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
        'CF',  // Codice Fiscale - used for Italian business logic
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
     * Get the motorcycles for this user (POSSESSIONE relationship via CF).
     */
    public function motorcycles(): HasMany
    {
        return $this->hasMany(Motorcycle::class, 'CF', 'CF');
    }

    /**
     * Get the appointments for this user (CREAZIONE relationship via CF).
     */
    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class, 'CF', 'CF');
    }

    /**
     * Get the invoices for this user (INTESTAZIONE relationship via CF).
     */
    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class, 'CF', 'CF');
    }

    /**
     * Get all work orders for this user via their motorcycles.
     */
    public function workOrders(): HasManyThrough
    {
        return $this->hasManyThrough(
            WorkOrder::class,
            Motorcycle::class,
            'CF',             // Foreign key on MOTO table...
            'NumTelaio',      // Foreign key on INTERVENTI table...
            'CF',             // Local key on users table...
            'NumTelaio'       // Local key on MOTO table...
        );
    }

    /**
     * Get work orders assigned to this mechanic (SVOLGIMENTI relationship).
     */
    public function assignedWorkOrders(): BelongsToMany
    {
        return $this->belongsToMany(WorkOrder::class, 'SVOLGIMENTI', 'CF', 'CodiceIntervento')
            ->withTimestamps()
            ->where('users.type', 'mechanic');
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
     * Get the work sessions this mechanic participated in (AFFIANCAMENTI relationship).
     */
    public function workSessions(): BelongsToMany
    {
        return $this->belongsToMany(WorkSession::class, 'AFFIANCAMENTI', 'CF', 'CodiceSessione')
            ->withTimestamps()
            ->where('users.type', 'mechanic');
    }
}
