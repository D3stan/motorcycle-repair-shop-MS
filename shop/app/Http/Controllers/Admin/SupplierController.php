<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SupplierController extends Controller
{
    /**
     * Display a listing of suppliers.
     */
    public function index(): Response
    {
        $suppliers = Supplier::withCount('parts')
            ->orderBy('name')
            ->paginate(20);

        $suppliersData = $suppliers->through(function ($supplier) {
            return [
                'id' => $supplier->id,
                'supplier_code' => $supplier->supplier_code,
                'name' => $supplier->name,
                'phone' => $supplier->phone,
                'email' => $supplier->email,
                'address' => $supplier->address,
                'city' => $supplier->city,
                'postal_code' => $supplier->postal_code,
                'country' => $supplier->country,
                'notes' => $supplier->notes,
                'parts_count' => $supplier->parts_count,
                'created_at' => $supplier->created_at->format('Y-m-d'),
            ];
        });

        return Inertia::render('admin/suppliers/index', [
            'suppliers' => $suppliersData,
        ]);
    }

    /**
     * Show the form for creating a new supplier.
     */
    public function create(): Response
    {
        return Inertia::render('admin/suppliers/create');
    }

    /**
     * Store a newly created supplier.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'supplier_code' => 'required|string|max:255|unique:suppliers,supplier_code',
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'required|string|email|max:255',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'postal_code' => 'nullable|string|max:10',
            'country' => 'required|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $supplier = Supplier::create($validated);

        return redirect()->route('admin.suppliers.show', $supplier)
            ->with('success', 'Supplier created successfully!');
    }

    /**
     * Display the specified supplier.
     */
    public function show(Supplier $supplier): Response
    {
        $supplier->load(['parts']);

        $supplierData = [
            'id' => $supplier->id,
            'supplier_code' => $supplier->supplier_code,
            'name' => $supplier->name,
            'phone' => $supplier->phone,
            'email' => $supplier->email,
            'address' => $supplier->address,
            'city' => $supplier->city,
            'postal_code' => $supplier->postal_code,
            'country' => $supplier->country,
            'notes' => $supplier->notes,
            'created_at' => $supplier->created_at->format('Y-m-d H:i'),
        ];

        // Format supplied parts
        $suppliedParts = $supplier->parts->map(function ($part) {
            return [
                'id' => $part->id,
                'part_code' => $part->part_code,
                'brand' => $part->brand,
                'name' => $part->name,
                'category' => $part->category,
                'supplier_price' => (float) $part->supplier_price,
                'selling_price' => (float) $part->selling_price,
                'stock_quantity' => $part->stock_quantity,
                'minimum_stock' => $part->minimum_stock,
                'is_low_stock' => $part->isLowStock(),
            ];
        });

        return Inertia::render('admin/suppliers/show', [
            'supplier' => $supplierData,
            'suppliedParts' => $suppliedParts,
        ]);
    }

    /**
     * Show the form for editing the specified supplier.
     */
    public function edit(Supplier $supplier): Response
    {
        return Inertia::render('admin/suppliers/edit', [
            'supplier' => [
                'id' => $supplier->id,
                'supplier_code' => $supplier->supplier_code,
                'name' => $supplier->name,
                'phone' => $supplier->phone,
                'email' => $supplier->email,
                'address' => $supplier->address,
                'city' => $supplier->city,
                'postal_code' => $supplier->postal_code,
                'country' => $supplier->country,
                'notes' => $supplier->notes,
            ],
        ]);
    }

    /**
     * Update the specified supplier.
     */
    public function update(Request $request, Supplier $supplier): RedirectResponse
    {
        $validated = $request->validate([
            'supplier_code' => 'required|string|max:255|unique:suppliers,supplier_code,' . $supplier->id,
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'required|string|email|max:255',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'postal_code' => 'nullable|string|max:10',
            'country' => 'required|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $supplier->update($validated);

        return redirect()->route('admin.suppliers.show', $supplier)
            ->with('success', 'Supplier updated successfully!');
    }

    /**
     * Remove the specified supplier.
     */
    public function destroy(Supplier $supplier): RedirectResponse
    {
        // Check if supplier has any parts
        $partsCount = $supplier->parts()->count();

        if ($partsCount > 0) {
            return redirect()->route('admin.suppliers.index')
                ->with('error', 'Cannot delete supplier that has parts assigned.');
        }

        $supplier->delete();

        return redirect()->route('admin.suppliers.index')
            ->with('success', 'Supplier deleted successfully!');
    }
} 