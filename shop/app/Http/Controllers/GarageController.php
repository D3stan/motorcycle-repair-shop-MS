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

        // TODO: Uncomment when database tables are created

        // Get user's motorcycles
        // $motorcycles = $user->motorcycles()
        //     ->orderBy('created_at', 'desc')
        //     ->get()
        //     ->map(function ($motorcycle) {
        //         return [
        //             'id' => $motorcycle->id,
        //             'brand' => $motorcycle->brand,
        //             'model' => $motorcycle->model,
        //             'year' => $motorcycle->year,
        //             'plate' => $motorcycle->plate,
        //             'vin' => $motorcycle->vin,
        //             'color' => $motorcycle->color,
        //             'engine_size' => $motorcycle->engine_size,
        //         ];
        //     });

        // Placeholder data for demo
        $motorcycles = collect([
            [
                'id' => 1,
                'brand' => 'Ducati',
                'model' => 'Monster 821',
                'year' => 2020,
                'plate' => 'AB123CD',
                'vin' => 'ZDMH5BR00LB123456',
                'color' => 'Red',
                'engine_size' => 821,
            ],
            [
                'id' => 2,
                'brand' => 'Yamaha',
                'model' => 'MT-07',
                'year' => 2021,
                'plate' => 'EF456GH',
                'vin' => 'JYARN23E0LA123456',
                'color' => 'Blue',
                'engine_size' => 689,
            ],
        ]);

        // Get pending services count for all user's motorcycles
        // $pendingServicesCount = $user->workOrders()
        //     ->whereIn('status', ['pending', 'in_progress'])
        //     ->count();
        $pendingServicesCount = 2;

        // Get last service date
        // $lastService = $user->workOrders()
        //     ->where('status', 'completed')
        //     ->orderBy('completed_at', 'desc')
        //     ->first();

        // $lastServiceDate = $lastService ? 
        //     now()->diffInDays($lastService->completed_at) . ' days ago' : 
        //     'No services yet';
        $lastServiceDate = '15 days ago';

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
        // TODO: Uncomment when database tables are created
        
        // $validated = $request->validate([
        //     'brand' => 'required|string|max:255',
        //     'model' => 'required|string|max:255',
        //     'year' => 'required|integer|min:1900|max:' . (date('Y') + 1),
        //     'plate' => 'required|string|max:20|unique:motorcycles,plate',
        //     'vin' => 'required|string|max:17|unique:motorcycles,vin',
        //     'color' => 'nullable|string|max:50',
        //     'engine_size' => 'nullable|integer|min:50|max:3000',
        // ]);

        // $motorcycle = $request->user()->motorcycles()->create($validated);

        return redirect()->route('garage')->with('success', 'Motorcycle functionality disabled - database tables not created yet.');
    }

    /**
     * Update the specified motorcycle.
     */
    public function update(Request $request, Motorcycle $motorcycle)
    {
        // TODO: Uncomment when database tables are created
        
        // Ensure the motorcycle belongs to the authenticated user
        // if ($motorcycle->user_id !== $request->user()->id) {
        //     abort(403, 'Unauthorized action.');
        // }

        // $validated = $request->validate([
        //     'brand' => 'required|string|max:255',
        //     'model' => 'required|string|max:255',
        //     'year' => 'required|integer|min:1900|max:' . (date('Y') + 1),
        //     'plate' => 'required|string|max:20|unique:motorcycles,plate,' . $motorcycle->id,
        //     'vin' => 'required|string|max:17|unique:motorcycles,vin,' . $motorcycle->id,
        //     'color' => 'nullable|string|max:50',
        //     'engine_size' => 'nullable|integer|min:50|max:3000',
        // ]);

        // $motorcycle->update($validated);

        return redirect()->route('garage')->with('success', 'Motorcycle functionality disabled - database tables not created yet.');
    }

    /**
     * Remove the specified motorcycle.
     */
    public function destroy(Request $request, Motorcycle $motorcycle)
    {
        // TODO: Uncomment when database tables are created
        
        // Ensure the motorcycle belongs to the authenticated user
        // if ($motorcycle->user_id !== $request->user()->id) {
        //     abort(403, 'Unauthorized action.');
        // }

        // Check if motorcycle has active work orders
        // $activeWorkOrders = $motorcycle->workOrders()
        //     ->whereIn('status', ['pending', 'in_progress'])
        //     ->count();

        // if ($activeWorkOrders > 0) {
        //     return redirect()->route('garage')->with('error', 'Cannot delete motorcycle with active work orders.');
        // }

        // $motorcycle->delete();

        return redirect()->route('garage')->with('success', 'Motorcycle functionality disabled - database tables not created yet.');
    }

    /**
     * Show the service history for a specific motorcycle.
     */
    public function history(Request $request, Motorcycle $motorcycle)
    {
        // TODO: Uncomment when database tables are created
        
        // Ensure the motorcycle belongs to the authenticated user
        // if ($motorcycle->user_id !== $request->user()->id) {
        //     abort(403, 'Unauthorized action.');
        // }

        // $serviceHistory = $motorcycle->workOrders()
        //     ->with('invoice')
        //     ->orderBy('completed_at', 'desc')
        //     ->get()
        //     ->map(function ($workOrder) {
        //         return [
        //             'id' => $workOrder->id,
        //             'description' => $workOrder->description,
        //             'status' => $workOrder->status,
        //             'started_at' => $workOrder->started_at?->format('Y-m-d'),
        //             'completed_at' => $workOrder->completed_at?->format('Y-m-d'),
        //             'total_cost' => $workOrder->total_cost,
        //             'invoice_number' => $workOrder->invoice?->invoice_number,
        //         ];
        //     });

        // Placeholder data for demo
        $serviceHistory = collect([
            [
                'id' => 1,
                'description' => 'Oil change and filter replacement',
                'status' => 'completed',
                'started_at' => '2024-01-05',
                'completed_at' => '2024-01-05',
                'total_cost' => 85.00,
                'invoice_number' => 'INV-2024-001',
            ],
            [
                'id' => 2,
                'description' => 'Brake pad replacement',
                'status' => 'completed',
                'started_at' => '2023-12-15',
                'completed_at' => '2023-12-15',
                'total_cost' => 150.00,
                'invoice_number' => 'INV-2023-089',
            ],
        ]);

        return Inertia::render('garage/history', [
            'motorcycle' => [
                'id' => 1,
                'brand' => 'Ducati',
                'model' => 'Monster 821',
                'year' => 2020,
                'plate' => 'AB123CD',
            ],
            'serviceHistory' => $serviceHistory,
        ]);
    }
} 