<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Part;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    /**
     * Display a listing of parts.
     */
    public function index(): Response
    {
        $parts = Part::with('supplier')
            ->orderBy('category')
            ->orderBy('name')
            ->paginate(20);

        $partsData = $parts->through(function ($part) {
            return [
                'id' => $part->id,
                'part_code' => $part->part_code,
                'brand' => $part->brand,
                'name' => $part->name,
                'description' => $part->description,
                'supplier_price' => (float) $part->supplier_price,
                'selling_price' => (float) $part->selling_price,
                'category' => $part->category,
                'stock_quantity' => $part->stock_quantity,
                'minimum_stock' => $part->minimum_stock,
                'supplier_id' => $part->supplier_id,
                'supplier_name' => $part->supplier->name,
                'is_low_stock' => $part->isLowStock(),
                'created_at' => $part->created_at->format('Y-m-d'),
            ];
        });

        return Inertia::render('admin/inventory/index', [
            'parts' => $partsData,
        ]);
    }

    /**
     * Show the form for creating a new part.
     */
    public function create(): Response
    {
        $suppliers = Supplier::orderBy('name')->get()->map(function ($supplier) {
            return [
                'id' => $supplier->id,
                'name' => $supplier->name,
                'supplier_code' => $supplier->supplier_code,
            ];
        });

        return Inertia::render('admin/inventory/create', [
            'suppliers' => $suppliers,
        ]);
    }

    /**
     * Store a newly created part.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'part_code' => 'required|string|max:255|unique:parts,part_code',
            'brand' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'supplier_price' => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'category' => 'required|string|max:255',
            'stock_quantity' => 'required|integer|min:0',
            'minimum_stock' => 'required|integer|min:0',
            'supplier_id' => 'required|exists:suppliers,id',
        ]);

        $part = Part::create($validated);

        return redirect()->route('admin.inventory.show', $part)
            ->with('success', 'Part created successfully!');
    }

    /**
     * Display the specified part.
     */
    public function show(Part $inventory): Response
    {
        $inventory->load(['supplier', 'motorcycleModels', 'workOrders.user']);

        $partData = [
            'id' => $inventory->id,
            'part_code' => $inventory->part_code,
            'brand' => $inventory->brand,
            'name' => $inventory->name,
            'description' => $inventory->description,
            'supplier_price' => (float) $inventory->supplier_price,
            'selling_price' => (float) $inventory->selling_price,
            'category' => $inventory->category,
            'stock_quantity' => $inventory->stock_quantity,
            'minimum_stock' => $inventory->minimum_stock,
            'supplier_id' => $inventory->supplier_id,
            'supplier_name' => $inventory->supplier->name,
            'is_low_stock' => $inventory->isLowStock(),
            'created_at' => $inventory->created_at->format('Y-m-d H:i'),
        ];

        // Format compatible motorcycle models
        $compatibleModels = $inventory->motorcycleModels->map(function ($model) {
            return [
                'id' => $model->id,
                'brand' => $model->brand,
                'name' => $model->name,
                'model_code' => $model->model_code,
                'engine_size' => $model->engine_size,
                'segment' => $model->segment,
            ];
        });

        // Format usage in work orders
        $workOrderUsage = $inventory->workOrders->map(function ($workOrder) {
            return [
                'id' => $workOrder->id,
                'description' => $workOrder->description,
                'status' => $workOrder->status,
                'customer' => $workOrder->user->first_name . ' ' . $workOrder->user->last_name,
                'quantity' => $workOrder->pivot->quantity,
                'unit_price' => (float) $workOrder->pivot->unit_price,
                'total_price' => (float) $workOrder->pivot->total_price,
                'created_at' => $workOrder->created_at->format('Y-m-d'),
            ];
        });

        return Inertia::render('admin/inventory/show', [
            'part' => $partData,
            'compatibleModels' => $compatibleModels,
            'workOrderUsage' => $workOrderUsage,
        ]);
    }

    /**
     * Show the form for editing the specified part.
     */
    public function edit(Part $inventory): Response
    {
        $suppliers = Supplier::orderBy('name')->get()->map(function ($supplier) {
            return [
                'id' => $supplier->id,
                'name' => $supplier->name,
                'supplier_code' => $supplier->supplier_code,
            ];
        });

        return Inertia::render('admin/inventory/edit', [
            'part' => [
                'id' => $inventory->id,
                'part_code' => $inventory->part_code,
                'brand' => $inventory->brand,
                'name' => $inventory->name,
                'description' => $inventory->description,
                'supplier_price' => (float) $inventory->supplier_price,
                'selling_price' => (float) $inventory->selling_price,
                'category' => $inventory->category,
                'stock_quantity' => $inventory->stock_quantity,
                'minimum_stock' => $inventory->minimum_stock,
                'supplier_id' => $inventory->supplier_id,
            ],
            'suppliers' => $suppliers,
        ]);
    }

    /**
     * Update the specified part.
     */
    public function update(Request $request, Part $inventory): RedirectResponse
    {
        $validated = $request->validate([
            'part_code' => 'required|string|max:255|unique:parts,part_code,' . $inventory->id,
            'brand' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'supplier_price' => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'category' => 'required|string|max:255',
            'stock_quantity' => 'required|integer|min:0',
            'minimum_stock' => 'required|integer|min:0',
            'supplier_id' => 'required|exists:suppliers,id',
        ]);

        $inventory->update($validated);

        return redirect()->route('admin.inventory.show', $inventory)
            ->with('success', 'Part updated successfully!');
    }

    /**
     * Remove the specified part.
     */
    public function destroy(Part $inventory): RedirectResponse
    {
        // Check if part is used in any work orders
        $workOrdersCount = $inventory->workOrders()->count();

        if ($workOrdersCount > 0) {
            return redirect()->route('admin.inventory.index')
                ->with('error', 'Cannot delete part that is used in work orders.');
        }

        $inventory->delete();

        return redirect()->route('admin.inventory.index')
            ->with('success', 'Part deleted successfully!');
    }
} 