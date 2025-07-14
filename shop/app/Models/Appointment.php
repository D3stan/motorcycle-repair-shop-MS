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
     * Get the route key for the model.
     */
    public function getRouteKeyName()
    {
        return 'CodiceAppuntamento';
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'CodiceAppuntamento',
        'DataAppuntamento',
        'Descrizione',
        'Tipo',
        'Stato',
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
            'DataAppuntamento' => 'date',
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

     * Work orders are linked to motorcycles via NumTelaio, 
     * while appointments are linked to users via CF.
     * 
     */
} 