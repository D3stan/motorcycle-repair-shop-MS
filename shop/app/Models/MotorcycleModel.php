<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class MotorcycleModel extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     */
    protected $table = 'MODELLI';

    /**
     * The primary key for the model.
     */
    protected $primaryKey = 'CodiceModello';

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
        'CodiceModello',
        'Marca',
        'Nome',
        'Cilindrata',
        'Segmento',
        'Potenza',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'Cilindrata' => 'integer',
            'Potenza' => 'decimal:2',
        ];
    }

    /**
     * Get the motorcycles for this model.
     */
    public function motorcycles(): HasMany
    {
        return $this->hasMany(Motorcycle::class, 'CodiceModello', 'CodiceModello');
    }

    /**
     * Get the parts compatible with this motorcycle model (APPARTENENZE relationship).
     */
    public function parts(): BelongsToMany
    {
        return $this->belongsToMany(Part::class, 'APPARTENENZE', 'CodiceModello', 'CodiceRicambio')
            ->withTimestamps();
    }
} 