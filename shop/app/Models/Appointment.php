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
     * Get work orders that could be related to this appointment.
     * Since appointments don't directly link to motorcycles in the simplified schema,
     * we can get work orders through the user's motorcycles.
     */
    public function workOrders(): HasMany  
    {
        // Note: This is an indirect relationship - appointments don't directly link to work orders in schema
        // This is kept for backward compatibility but may return empty results
        return $this->hasMany(WorkOrder::class, 'NonExistentField', 'NonExistentField')->whereRaw('1=0');
    }
} 