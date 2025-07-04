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
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'brand',
        'name',
        'model_code',
        'engine_size',
        'segment',
        'power',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'engine_size' => 'integer',
            'power' => 'integer',
        ];
    }

    /**
     * Get the motorcycles for this model.
     */
    public function motorcycles(): HasMany
    {
        return $this->hasMany(Motorcycle::class);
    }

    /**
     * Get the parts compatible with this motorcycle model.
     */
    public function parts(): BelongsToMany
    {
        return $this->belongsToMany(Part::class, 'model_parts')
            ->withPivot('is_compatible', 'compatibility_notes')
            ->withTimestamps();
    }
} 