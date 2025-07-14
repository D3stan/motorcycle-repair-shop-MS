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
            ->orderBy('Categoria')
            ->orderBy('Nome')
            ->paginate(20);

        $partsData = $parts->through(function ($part) {
            return [
                'id' => $part->CodiceRicambio,
                'part_code' => $part->CodiceRicambio,
                'brand' => $part->Marca,
                'name' => $part->Nome,
                'description' => $part->Descrizione,
                'supplier_price' => (float) $part->PrezzoFornitore,
                'category' => $part->Categoria,
                'supplier_id' => $part->CodiceFornitore,
                'supplier_name' => $part->supplier->Nome,
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
        $suppliers = Supplier::orderBy('Nome')->get()->map(function ($supplier) {
            return [
                'id' => $supplier->CodiceFornitore,
                'name' => $supplier->Nome,
                'supplier_code' => $supplier->CodiceFornitore,
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
            'part_code' => 'required|string|max:255|unique:RICAMBI,CodiceRicambio',
            'brand' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'supplier_price' => 'required|numeric|min:0',
            'category' => 'required|string|max:255',
            'supplier_id' => 'required|exists:FORNITORI,CodiceFornitore',
        ]);

        $part = Part::create([
            'CodiceRicambio' => $validated['part_code'],
            'Marca' => $validated['brand'],
            'Nome' => $validated['name'],
            'Descrizione' => $validated['description'],
            'PrezzoFornitore' => $validated['supplier_price'],
            'Categoria' => $validated['category'],
            'CodiceFornitore' => $validated['supplier_id'],
        ]);

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
            'id' => $inventory->CodiceRicambio,
            'part_code' => $inventory->CodiceRicambio,
            'brand' => $inventory->Marca,
            'name' => $inventory->Nome,
            'description' => $inventory->Descrizione,
            'supplier_price' => (float) $inventory->PrezzoFornitore,
            'category' => $inventory->Categoria,
            'supplier_id' => $inventory->CodiceFornitore,
            'supplier_name' => $inventory->supplier->Nome,
            'created_at' => $inventory->created_at->format('Y-m-d H:i'),
        ];

        // Format compatible motorcycle models
        $compatibleModels = $inventory->motorcycleModels->map(function ($model) {
            return [
                'id' => $model->CodiceModello,
                'brand' => $model->Marca,
                'name' => $model->Nome,
                'model_code' => $model->CodiceModello,
                'engine_size' => $model->Cilindrata,
                'segment' => $model->Segmento,
            ];
        });

        // Format usage in work orders
        $workOrdersUsage = $inventory->workOrders->map(function ($workOrder) {
            return [
                'id' => $workOrder->CodiceIntervento,
                'description' => $workOrder->Note,
                'status' => $workOrder->Stato,
                'customer' => $workOrder->user->first_name . ' ' . $workOrder->user->last_name,
                'created_at' => $workOrder->created_at->format('Y-m-d'),
            ];
        });

        return Inertia::render('admin/inventory/show', [
            'part' => $partData,
            'compatibleModels' => $compatibleModels,
            'workOrdersUsage' => $workOrdersUsage,
        ]);
    }

    /**
     * Show the form for editing the specified part.
     */
    public function edit(Part $inventory): Response
    {
        $suppliers = Supplier::orderBy('Nome')->get()->map(function ($supplier) {
            return [
                'id' => $supplier->CodiceFornitore,
                'name' => $supplier->Nome,
                'supplier_code' => $supplier->CodiceFornitore,
            ];
        });

        return Inertia::render('admin/inventory/edit', [
            'part' => [
                'id' => $inventory->CodiceRicambio,
                'part_code' => $inventory->CodiceRicambio,
                'brand' => $inventory->Marca,
                'name' => $inventory->Nome,
                'description' => $inventory->Descrizione,
                'supplier_price' => (float) $inventory->PrezzoFornitore,
                'category' => $inventory->Categoria,
                'supplier_id' => $inventory->CodiceFornitore,
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
            'part_code' => 'required|string|max:255|unique:RICAMBI,CodiceRicambio,' . $inventory->CodiceRicambio . ',CodiceRicambio',
            'brand' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'supplier_price' => 'required|numeric|min:0',
            'category' => 'required|string|max:255',
            'supplier_id' => 'required|exists:FORNITORI,CodiceFornitore',
        ]);

        $inventory->update([
            'CodiceRicambio' => $validated['part_code'],
            'Marca' => $validated['brand'],
            'Nome' => $validated['name'],
            'Descrizione' => $validated['description'],
            'PrezzoFornitore' => $validated['supplier_price'],
            'Categoria' => $validated['category'],
            'CodiceFornitore' => $validated['supplier_id'],
        ]);

        return redirect()->route('admin.inventory.show', $inventory)
            ->with('success', 'Part updated successfully!');
    }

    /**
     * Remove the specified part.
     */
    public function destroy(Part $inventory): RedirectResponse
    {
        // Check if part is used in any work orders
        if ($inventory->workOrders()->count() > 0) {
            return redirect()->route('admin.inventory.index')
                ->with('error', 'Cannot delete part that is used in work orders.');
        }

        $inventory->delete();

        return redirect()->route('admin.inventory.index')
            ->with('success', 'Part deleted successfully!');
    }
} 