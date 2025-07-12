<?php

namespace App\Http\Controllers;

use App\Models\Motorcycle;
use App\Models\WorkOrder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GarageController extends Controller
{
    /**
     * Show the garage page.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Get user's motorcycles with their model information
        $motorcycles = $user->motorcycles()
            ->with('motorcycleModel')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($motorcycle) {
                return [
                    'id' => $motorcycle->NumTelaio,
                    'CodiceModello' => $motorcycle->CodiceModello,
                    'brand' => $motorcycle->motorcycleModel->Marca,
                    'model' => $motorcycle->motorcycleModel->Nome,
                    'year' => $motorcycle->AnnoImmatricolazione,
                    'plate' => $motorcycle->Targa,
                    'vin' => $motorcycle->NumTelaio,
                    'engine_size' => $motorcycle->motorcycleModel->Cilindrata,
                    'notes' => $motorcycle->Note,
                ];
            });

        // Get all motorcycle models for the forms
        $motorcycleModels = \App\Models\MotorcycleModel::orderBy('Marca')
            ->orderBy('Nome')
            ->get()
            ->map(function ($model) {
                return [
                    'id' => $model->CodiceModello,
                    'brand' => $model->Marca,
                    'name' => $model->Nome,
                    'engine_size' => $model->Cilindrata,
                    'display_name' => $model->Marca . ' ' . $model->Nome . ' (' . $model->Cilindrata . 'cc)',
                ];
            });

        // Get pending services count for all user's motorcycles
        $pendingServicesCount = $user->workOrders()
            ->where(function ($query) {
                $query->whereNull('DataInizio')
                    ->orWhere(function ($q) {
                        $q->whereNotNull('DataInizio')
                          ->whereNull('DataFine');
                    });
            })
            ->count();

        // Get last service date
        $lastService = $user->workOrders()
            ->whereNotNull('DataFine')
            ->orderBy('DataFine', 'desc')
            ->first();

        $lastServiceDate = $lastService ? 
            floor($lastService->DataFine->diffInDays(now())) . ' days ago' : 
            'No services yet';

        return Inertia::render('garage', [
            'motorcycles' => $motorcycles,
            'motorcycleModels' => $motorcycleModels,
            'pendingServicesCount' => $pendingServicesCount,
            'lastServiceDate' => $lastServiceDate,
        ]);
    }

    /**
     * Store a newly created motorcycle.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'CodiceModello' => 'required|exists:MODELLI,CodiceModello',
            'Targa' => 'required|string|max:20|unique:MOTO,Targa',
            'AnnoImmatricolazione' => 'required|integer|min:1900|max:' . (date('Y') + 1),
            'NumTelaio' => 'required|string|max:17|unique:MOTO,NumTelaio',
            'Note' => 'nullable|string|max:1000',
        ]);

        $motorcycle = $request->user()->motorcycles()->create($validated);

        return redirect()->route('garage')->with('success', 'Motorcycle added successfully!');
    }

    /**
     * Update the specified motorcycle.
     */
    public function update(Request $request, Motorcycle $motorcycle)
    {
        // Ensure the motorcycle belongs to the authenticated user
        if ($motorcycle->CF !== $request->user()->CF) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'CodiceModello' => 'required|exists:MODELLI,CodiceModello',
            'Targa' => 'required|string|max:20|unique:MOTO,Targa,' . $motorcycle->NumTelaio . ',NumTelaio',
            'AnnoImmatricolazione' => 'required|integer|min:1900|max:' . (date('Y') + 1),
            'NumTelaio' => 'required|string|max:17|unique:MOTO,NumTelaio,' . $motorcycle->NumTelaio . ',NumTelaio',
            'Note' => 'nullable|string|max:1000',
        ]);

        $motorcycle->update($validated);

        return redirect()->route('garage')->with('success', 'Motorcycle updated successfully!');
    }

    /**
     * Remove the specified motorcycle.
     */
    public function destroy(Request $request, Motorcycle $motorcycle)
    {
        // Ensure the motorcycle belongs to the authenticated user
        if ($motorcycle->CF !== $request->user()->CF) {
            abort(403, 'Unauthorized action.');
        }

        // Check if motorcycle has active work orders
        $activeWorkOrders = $motorcycle->workOrders()
            ->where(function ($query) {
                $query->whereNull('DataInizio')
                    ->orWhere(function ($q) {
                        $q->whereNotNull('DataInizio')
                          ->whereNull('DataFine');
                    });
            })
            ->count();

        if ($activeWorkOrders > 0) {
            return redirect()->route('garage')->with('error', 'Cannot delete motorcycle with active work orders.');
        }

        $motorcycle->delete();

        return redirect()->route('garage')->with('success', 'Motorcycle deleted successfully!');
    }

    /**
     * Show the service history for a specific motorcycle.
     */
    public function history(Request $request, Motorcycle $motorcycle)
    {
        // Ensure the motorcycle belongs to the authenticated user
        if ($motorcycle->CF !== $request->user()->CF) {
            abort(403, 'Unauthorized action.');
        }

        // Load the motorcycle model relationship
        $motorcycle->load('motorcycleModel');

        $serviceHistory = $motorcycle->workOrders()
            ->with('invoice')
            ->orderBy('DataFine', 'desc')
            ->get()
            ->map(function ($workOrder) {
                // Determine status based on dates
                $status = 'pending';
                if ($workOrder->DataInizio && $workOrder->DataFine) {
                    $status = 'completed';
                } elseif ($workOrder->DataInizio) {
                    $status = 'in_progress';
                }

                return [
                    'id' => $workOrder->CodiceIntervento,
                    'description' => $workOrder->Note,
                    'status' => $status,
                    'started_at' => $workOrder->DataInizio?->format('Y-m-d'),
                    'completed_at' => $workOrder->DataFine?->format('Y-m-d'),
                    'total_cost' => $workOrder->invoice?->Importo ? (float) $workOrder->invoice->Importo : 0.0,
                    'invoice_number' => $workOrder->invoice?->CodiceFattura,
                ];
            });

        return Inertia::render('garage/history', [
            'motorcycle' => [
                'id' => $motorcycle->NumTelaio,
                'brand' => $motorcycle->motorcycleModel->Marca,
                'model' => $motorcycle->motorcycleModel->Nome,
                'year' => $motorcycle->AnnoImmatricolazione,
                'plate' => $motorcycle->Targa,
            ],
            'serviceHistory' => $serviceHistory,
        ]);
    }
} 