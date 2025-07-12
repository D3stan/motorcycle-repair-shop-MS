<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Warehouse extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     */
    protected $table = 'MAGAZZINI';

    /**
     * The primary key for the model.
     */
    protected $primaryKey = 'CodiceMagazzino';

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
        'CodiceMagazzino',
    ];

    /**
     * Get the parts stored in this warehouse (STOCCAGGI relationship).
     */
    public function parts(): BelongsToMany
    {
        return $this->belongsToMany(Part::class, 'STOCCAGGI', 'CodiceMagazzino', 'CodiceRicambio')
            ->withTimestamps();
    }
} 