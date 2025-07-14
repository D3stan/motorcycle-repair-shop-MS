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
            ->orderBy('Nome')
            ->paginate(20);

        $suppliersData = $suppliers->through(function ($supplier) {
            return [
                'id' => $supplier->CodiceFornitore,
                'supplier_code' => $supplier->CodiceFornitore,
                'name' => $supplier->Nome,
                'phone' => $supplier->Telefono,
                'email' => $supplier->Email,
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
            'supplier_code' => 'required|string|max:255|unique:FORNITORI,CodiceFornitore',
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'required|string|email|max:255',
        ]);

        $supplier = Supplier::create([
            'CodiceFornitore' => $validated['supplier_code'],
            'Nome' => $validated['name'],
            'Telefono' => $validated['phone'],
            'Email' => $validated['email'],
        ]);

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
            'id' => $supplier->CodiceFornitore,
            'supplier_code' => $supplier->CodiceFornitore,
            'name' => $supplier->Nome,
            'phone' => $supplier->Telefono,
            'email' => $supplier->Email,
            'created_at' => $supplier->created_at->format('Y-m-d H:i'),
        ];

        // Format supplied parts
        $suppliedParts = $supplier->parts->map(function ($part) {
            return [
                'id' => $part->CodiceRicambio,
                'part_code' => $part->CodiceRicambio,
                'brand' => $part->Marca,
                'name' => $part->Nome,
                'category' => $part->Categoria,
                'supplier_price' => (float) $part->PrezzoFornitore,
                // Fields below removed as they don't exist in RICAMBI schema
                // 'selling_price' => (float) $part->PrezzoVendita,
                // 'stock_quantity' => $part->QuantitaDisponibile,
                // 'minimum_stock' => $part->ScortaMinima,
                // 'is_low_stock' => $part->isLowStock(),
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
                'id' => $supplier->CodiceFornitore,
                'supplier_code' => $supplier->CodiceFornitore,
                'name' => $supplier->Nome,
                'phone' => $supplier->Telefono,
                'email' => $supplier->Email,
            ],
        ]);
    }

    /**
     * Update the specified supplier.
     */
    public function update(Request $request, Supplier $supplier): RedirectResponse
    {
        $validated = $request->validate([
            'supplier_code' => 'required|string|max:255|unique:FORNITORI,CodiceFornitore,' . $supplier->CodiceFornitore . ',CodiceFornitore',
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'required|string|email|max:255',
        ]);

        $supplier->update([
            'CodiceFornitore' => $validated['supplier_code'],
            'Nome' => $validated['name'],
            'Telefono' => $validated['phone'],
            'Email' => $validated['email'],
        ]);

        return redirect()->route('admin.suppliers.show', $supplier)
            ->with('success', 'Supplier updated successfully!');
    }

    /**
     * Remove the specified supplier.
     */
    public function destroy(Supplier $supplier): RedirectResponse
    {
        // Check if supplier has any parts
        if ($supplier->parts()->count() > 0) {
            return redirect()->route('admin.suppliers.index')
                ->with('error', 'Cannot delete supplier that has associated parts.');
        }

        $supplier->delete();

        return redirect()->route('admin.suppliers.index')
            ->with('success', 'Supplier deleted successfully!');
    }
} 