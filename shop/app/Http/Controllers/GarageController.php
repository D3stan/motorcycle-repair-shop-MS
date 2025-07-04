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

        // Get user's motorcycles
        $motorcycles = $user->motorcycles()
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($motorcycle) {
                return [
                    'id' => $motorcycle->id,
                    'brand' => $motorcycle->brand,
                    'model' => $motorcycle->model,
                    'year' => $motorcycle->year,
                    'plate' => $motorcycle->plate,
                    'vin' => $motorcycle->vin,
                    'color' => $motorcycle->color,
                    'engine_size' => $motorcycle->engine_size,
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
            now()->diffInDays($lastService->completed_at) . ' days ago' : 
            'No services yet';

        return Inertia::render('garage', [
            'motorcycles' => $motorcycles,
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
            'brand' => 'required|string|max:255',
            'model' => 'required|string|max:255',
            'year' => 'required|integer|min:1900|max:' . (date('Y') + 1),
            'plate' => 'required|string|max:20|unique:motorcycles,plate',
            'vin' => 'required|string|max:17|unique:motorcycles,vin',
            'color' => 'nullable|string|max:50',
            'engine_size' => 'nullable|integer|min:50|max:3000',
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
            'brand' => 'required|string|max:255',
            'model' => 'required|string|max:255',
            'year' => 'required|integer|min:1900|max:' . (date('Y') + 1),
            'plate' => 'required|string|max:20|unique:motorcycles,plate,' . $motorcycle->id,
            'vin' => 'required|string|max:17|unique:motorcycles,vin,' . $motorcycle->id,
            'color' => 'nullable|string|max:50',
            'engine_size' => 'nullable|integer|min:50|max:3000',
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

        return redirect()->route('garage')->with('success', 'Motorcycle removed successfully!');
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
                    'total_cost' => $workOrder->total_cost,
                    'invoice_number' => $workOrder->invoice?->invoice_number,
                ];
            });

        return Inertia::render('garage/history', [
            'motorcycle' => [
                'id' => $motorcycle->id,
                'brand' => $motorcycle->brand,
                'model' => $motorcycle->model,
                'year' => $motorcycle->year,
                'plate' => $motorcycle->plate,
            ],
            'serviceHistory' => $serviceHistory,
        ]);
    }
} 