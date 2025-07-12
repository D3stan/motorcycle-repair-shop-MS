<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Invoice extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     */
    protected $table = 'FATTURE';

    /**
     * The primary key for the model.
     */
    protected $primaryKey = 'CodiceFattura';

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
        'CodiceFattura',
        'Importo',
        'Data',
        'Note',
        'CF',
        'CodiceIntervento',
        'CodiceSessione',
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
            'Importo' => 'decimal:2',
        ];
    }

    /**
     * Get the user that owns the invoice (INTESTAZIONE relationship).
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'CF', 'CF');
    }

    /**
     * Get the work order for this invoice (RELATIVO relationship).
     */
    public function workOrder(): BelongsTo
    {
        return $this->belongsTo(WorkOrder::class, 'CodiceIntervento', 'CodiceIntervento');
    }

    /**
     * Get the work session (if any) for this invoice (RELATIVO relationship).
     */
    public function workSession(): BelongsTo
    {
        return $this->belongsTo(WorkSession::class, 'CodiceSessione', 'CodiceSessione');
    }
} 