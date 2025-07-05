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
                    'id' => $motorcycle->id,
                    'motorcycle_model_id' => $motorcycle->motorcycle_model_id,
                    'brand' => $motorcycle->motorcycleModel->brand,
                    'model' => $motorcycle->motorcycleModel->name,
                    'year' => $motorcycle->registration_year,
                    'plate' => $motorcycle->license_plate,
                    'vin' => $motorcycle->vin,
                    'engine_size' => $motorcycle->motorcycleModel->engine_size,
                    'notes' => $motorcycle->notes,
                ];
            });

        // Get all motorcycle models for the forms
        $motorcycleModels = \App\Models\MotorcycleModel::orderBy('brand')
            ->orderBy('name')
            ->get()
            ->map(function ($model) {
                return [
                    'id' => $model->id,
                    'brand' => $model->brand,
                    'name' => $model->name,
                    'engine_size' => $model->engine_size,
                    'display_name' => $model->brand . ' ' . $model->name . ' (' . $model->engine_size . 'cc)',
                ];
            });

        // Get pending services count for all user's motorcycles
        $pendingServicesCount = $user->workOrders()
            ->whereIn('status', ['pending', 'in_progress'])
            ->count();

        // Get last service date
        $lastService = $user->workOrders()
            ->where('status', 'completed')
            ->orderBy('completed_at', 'desc')
            ->first();

        $lastServiceDate = $lastService ? 
            floor($lastService->completed_at->diffInDays(now())) . ' days ago' : 
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
            'motorcycle_model_id' => 'required|exists:motorcycle_models,id',
            'license_plate' => 'required|string|max:20|unique:motorcycles,license_plate',
            'registration_year' => 'required|integer|min:1900|max:' . (date('Y') + 1),
            'vin' => 'required|string|max:17|unique:motorcycles,vin',
            'notes' => 'nullable|string|max:1000',
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
        if ($motorcycle->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'motorcycle_model_id' => 'required|exists:motorcycle_models,id',
            'license_plate' => 'required|string|max:20|unique:motorcycles,license_plate,' . $motorcycle->id,
            'registration_year' => 'required|integer|min:1900|max:' . (date('Y') + 1),
            'vin' => 'required|string|max:17|unique:motorcycles,vin,' . $motorcycle->id,
            'notes' => 'nullable|string|max:1000',
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
        if ($motorcycle->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized action.');
        }

        // Check if motorcycle has active work orders
        $activeWorkOrders = $motorcycle->workOrders()
            ->whereIn('status', ['pending', 'in_progress'])
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
        if ($motorcycle->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized action.');
        }

        // Load the motorcycle model relationship
        $motorcycle->load('motorcycleModel');

        $serviceHistory = $motorcycle->workOrders()
            ->with('invoice')
            ->orderBy('completed_at', 'desc')
            ->get()
            ->map(function ($workOrder) {
                return [
                    'id' => $workOrder->id,
                    'description' => $workOrder->description,
                    'status' => $workOrder->status,
                    'started_at' => $workOrder->started_at?->format('Y-m-d'),
                    'completed_at' => $workOrder->completed_at?->format('Y-m-d'),
                    'total_cost' => $workOrder->total_cost ? (float) $workOrder->total_cost : 0.0,
                    'invoice_number' => $workOrder->invoice?->invoice_number,
                ];
            });

        return Inertia::render('garage/history', [
            'motorcycle' => [
                'id' => $motorcycle->id,
                'brand' => $motorcycle->motorcycleModel->brand,
                'model' => $motorcycle->motorcycleModel->name,
                'year' => $motorcycle->registration_year,
                'plate' => $motorcycle->license_plate,
            ],
            'serviceHistory' => $serviceHistory,
        ]);
    }
} 