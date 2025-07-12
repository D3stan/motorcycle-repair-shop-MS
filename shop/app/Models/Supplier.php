<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Supplier extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     */
    protected $table = 'FORNITORI';

    /**
     * The primary key for the model.
     */
    protected $primaryKey = 'CodiceFornitore';

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
        'CodiceFornitore',
        'Nome',
        'Telefono',
        'Email',
    ];

    /**
     * Get the parts supplied by this supplier (FORNITURA relationship).
     */
    public function parts(): HasMany
    {
        return $this->hasMany(Part::class, 'CodiceFornitore', 'CodiceFornitore');
    }
} 