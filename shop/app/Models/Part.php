<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Part extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'part_code',
        'brand',
        'name',
        'description',
        'supplier_price',
        'selling_price',
        'category',
        'stock_quantity',
        'minimum_stock',
        'supplier_id',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'supplier_price' => 'decimal:2',
            'selling_price' => 'decimal:2',
            'stock_quantity' => 'integer',
            'minimum_stock' => 'integer',
        ];
    }

    /**
     * Get the supplier for this part.
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    /**
     * Get the motorcycle models that use this part.
     */
    public function motorcycleModels(): BelongsToMany
    {
        return $this->belongsToMany(MotorcycleModel::class, 'model_parts');
    }

    /**
     * Get the work orders that use this part.
     */
    public function workOrders(): BelongsToMany
    {
        return $this->belongsToMany(WorkOrder::class, 'work_order_parts')
            ->withPivot('quantity', 'unit_price', 'total_price')
            ->withTimestamps();
    }

    /**
     * Get the warehouses storing this part.
     */
    public function warehouses(): BelongsToMany
    {
        return $this->belongsToMany(Warehouse::class, 'warehouse_parts')
            ->withPivot('quantity', 'location_in_warehouse')
            ->withTimestamps();
    }

    /**
     * Check if the part is low in stock.
     */
    public function isLowStock(): bool
    {
        return $this->stock_quantity <= $this->minimum_stock;
    }
} 