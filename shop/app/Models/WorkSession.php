<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class WorkSession extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     */
    protected $table = 'SESSIONI';

    /**
     * The primary key for the model.
     */
    protected $primaryKey = 'CodiceSessione';

    /**
     * The "type" of the primary key ID.
     */
    protected $keyType = 'string';

    /**
     * Indicates if the IDs are auto-incrementing.
     */
    public $incrementing = false;

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'CodiceSessione';
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'CodiceSessione',
        'Data',
        'Stato',
        'OreImpiegate',
        'Note',
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
            'Data' => 'date',
            'OreImpiegate' => 'decimal:2',
        ];
    }

    /**
     * Get the motorcycle for this session.
     */
    public function motorcycle(): BelongsTo
    {
        return $this->belongsTo(Motorcycle::class, 'NumTelaio', 'NumTelaio');
    }

    /**
     * Get the mechanics working on this session (AFFIANCAMENTI relationship).
     */
    public function mechanics(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'AFFIANCAMENTI', 'CodiceSessione', 'CF')
            ->withTimestamps();
    }

    /**
     * Get the invoice associated with this session.
     */
    public function invoice(): HasOne
    {
        return $this->hasOne(Invoice::class, 'CodiceSessione', 'CodiceSessione');
    }
} 