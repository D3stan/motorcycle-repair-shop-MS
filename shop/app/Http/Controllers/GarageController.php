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
                    'motorcycle_model_id' => $motorcycle->CodiceModello,
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
            'motorcycle_model_id' => 'required|exists:MODELLI,CodiceModello',
            'license_plate' => 'required|string|max:20|unique:MOTO,Targa',
            'registration_year' => 'required|integer|min:1900|max:' . (date('Y') + 1),
            'vin' => 'required|string|max:17|unique:MOTO,NumTelaio',
            'notes' => 'nullable|string|max:1000',
        ], [
            'motorcycle_model_id.required' => 'Please select a motorcycle model.',
            'motorcycle_model_id.exists' => 'The selected motorcycle model is invalid.',
            'license_plate.required' => 'License plate is required.',
            'license_plate.unique' => 'This license plate is already registered.',
            'registration_year.required' => 'Registration year is required.',
            'registration_year.min' => 'Registration year must be 1900 or later.',
            'registration_year.max' => 'Registration year cannot be in the future.',
            'vin.required' => 'VIN is required.',
            'vin.max' => 'VIN must be 17 characters or less.',
            'vin.unique' => 'This VIN is already registered.',
            'notes.max' => 'Notes must be 1000 characters or less.',
        ]);

        // Map frontend field names to database column names
        $motorcycleData = [
            'CodiceModello' => $validated['motorcycle_model_id'],
            'Targa' => $validated['license_plate'],
            'AnnoImmatricolazione' => $validated['registration_year'],
            'NumTelaio' => $validated['vin'],
            'Note' => $validated['notes'],
        ];

        $motorcycle = $request->user()->motorcycles()->create($motorcycleData);

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
            'motorcycle_model_id' => 'required|exists:MODELLI,CodiceModello',
            'license_plate' => 'required|string|max:20|unique:MOTO,Targa,' . $motorcycle->NumTelaio . ',NumTelaio',
            'registration_year' => 'required|integer|min:1900|max:' . (date('Y') + 1),
            'vin' => 'required|string|max:17|unique:MOTO,NumTelaio,' . $motorcycle->NumTelaio . ',NumTelaio',
            'notes' => 'nullable|string|max:1000',
        ], [
            'motorcycle_model_id.required' => 'Please select a motorcycle model.',
            'motorcycle_model_id.exists' => 'The selected motorcycle model is invalid.',
            'license_plate.required' => 'License plate is required.',
            'license_plate.unique' => 'This license plate is already registered.',
            'registration_year.required' => 'Registration year is required.',
            'registration_year.min' => 'Registration year must be 1900 or later.',
            'registration_year.max' => 'Registration year cannot be in the future.',
            'vin.required' => 'VIN is required.',
            'vin.max' => 'VIN must be 17 characters or less.',
            'vin.unique' => 'This VIN is already registered.',
            'notes.max' => 'Notes must be 1000 characters or less.',
        ]);

        // Map frontend field names to database column names
        $motorcycleData = [
            'CodiceModello' => $validated['motorcycle_model_id'],
            'Targa' => $validated['license_plate'],
            'AnnoImmatricolazione' => $validated['registration_year'],
            'NumTelaio' => $validated['vin'],
            'Note' => $validated['notes'],
        ];

        $motorcycle->update($motorcycleData);

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