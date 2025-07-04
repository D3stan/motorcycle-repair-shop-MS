<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Supplier extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'supplier_code',
        'name',
        'phone',
        'email',
        'address',
        'city',
        'postal_code',
        'country',
        'notes',
    ];

    /**
     * Get the parts supplied by this supplier.
     */
    public function parts(): HasMany
    {
        return $this->hasMany(Part::class);
    }
} 