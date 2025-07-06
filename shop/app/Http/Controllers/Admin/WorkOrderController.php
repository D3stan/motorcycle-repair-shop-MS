<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\WorkOrder;
use App\Models\User;
use App\Models\Motorcycle;
use App\Models\Appointment;
use App\Models\Part;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class WorkOrderController extends Controller
{
    /**
     * Display a listing of work orders.
     */
    public function index(): Response
    {
        $workOrders = WorkOrder::with([
            'user',
            'motorcycle.motorcycleModel',
            'mechanics',
            'appointment'
        ])
        ->orderBy('created_at', 'desc')
        ->paginate(20);

        $workOrdersData = $workOrders->through(function ($workOrder) {
            return [
                'id' => $workOrder->id,
                'description' => $workOrder->description,
                'status' => $workOrder->status,
                'started_at' => $workOrder->started_at?->format('Y-m-d'),
                'completed_at' => $workOrder->completed_at?->format('Y-m-d'),
                'total_cost' => $workOrder->total_cost ? (float) $workOrder->total_cost : 0.0,
                'labor_cost' => $workOrder->labor_cost ? (float) $workOrder->labor_cost : 0.0,
                'parts_cost' => $workOrder->parts_cost ? (float) $workOrder->parts_cost : 0.0,
                'customer' => $workOrder->user->first_name . ' ' . $workOrder->user->last_name,
                'customer_email' => $workOrder->user->email,
                'motorcycle' => $workOrder->motorcycle->motorcycleModel->brand . ' ' . $workOrder->motorcycle->motorcycleModel->name,
                'motorcycle_plate' => $workOrder->motorcycle->license_plate,
                'mechanics' => $workOrder->mechanics->map(function ($mechanic) {
                    return [
                        'id' => $mechanic->id,
                        'name' => $mechanic->first_name . ' ' . $mechanic->last_name,
                        'assigned_at' => $mechanic->pivot->assigned_at ? Carbon::parse($mechanic->pivot->assigned_at)->format('Y-m-d H:i') : null,
                        'started_at' => $mechanic->pivot->started_at ? Carbon::parse($mechanic->pivot->started_at)->format('Y-m-d H:i') : null,
                        'completed_at' => $mechanic->pivot->completed_at ? Carbon::parse($mechanic->pivot->completed_at)->format('Y-m-d H:i') : null,
                    ];
                }),
                'appointment_id' => $workOrder->appointment_id,
                'created_at' => $workOrder->created_at->format('Y-m-d H:i'),
            ];
        });

        // Get statistics
        $statistics = [
            'total' => WorkOrder::count(),
            'pending' => WorkOrder::where('status', 'pending')->count(),
            'in_progress' => WorkOrder::where('status', 'in_progress')->count(),
            'completed' => WorkOrder::where('status', 'completed')->count(),
            'cancelled' => WorkOrder::where('status', 'cancelled')->count(),
        ];

        return Inertia::render('admin/work-orders/index', [
            'workOrders' => $workOrdersData,
            'statistics' => $statistics,
        ]);
    }

    /**
     * Show the form for creating a new work order.
     */
    public function create(Request $request): Response
    {
        $customers = User::where('type', 'customer')
            ->with('motorcycles.motorcycleModel')
            ->orderBy('first_name')
            ->get()
            ->map(function ($customer) {
                return [
                    'id' => $customer->id,
                    'name' => $customer->first_name . ' ' . $customer->last_name,
                    'email' => $customer->email,
                    'motorcycles' => $customer->motorcycles->map(function ($motorcycle) {
                        return [
                            'id' => $motorcycle->id,
                            'name' => $motorcycle->motorcycleModel->brand . ' ' . $motorcycle->motorcycleModel->name,
                            'plate' => $motorcycle->license_plate,
                            'year' => $motorcycle->registration_year,
                        ];
                    }),
                ];
            });

        $mechanics = User::where('type', 'mechanic')
            ->orderBy('first_name')
            ->get()
            ->map(function ($mechanic) {
                return [
                    'id' => $mechanic->id,
                    'name' => $mechanic->first_name . ' ' . $mechanic->last_name,
                    'email' => $mechanic->email,
                ];
            });

        $appointments = Appointment::where('status', 'scheduled')
            ->with(['user', 'motorcycle.motorcycleModel'])
            ->orderBy('appointment_date')
            ->get()
            ->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'customer' => $appointment->user->first_name . ' ' . $appointment->user->last_name,
                    'motorcycle' => $appointment->motorcycle->motorcycleModel->brand . ' ' . $appointment->motorcycle->motorcycleModel->name,
                    'date' => $appointment->appointment_date->format('Y-m-d'),
                    'time' => $appointment->appointment_time,
                    'type' => $appointment->type,
                ];
            });

        // Pre-fill data if coming from appointment
        $prefilledData = null;
        if ($request->has('appointment_id')) {
            $appointment = Appointment::with(['user', 'motorcycle.motorcycleModel'])
                ->find($request->appointment_id);
            
            if ($appointment) {
                $prefilledData = [
                    'appointment_id' => $appointment->id,
                    'user_id' => $appointment->user_id,
                    'motorcycle_id' => $appointment->motorcycle_id,
                    'description' => 'Work order for ' . ucfirst(str_replace('_', ' ', $appointment->type)) . ' appointment scheduled on ' . $appointment->appointment_date->format('M j, Y'),
                    'customer_name' => $appointment->user->first_name . ' ' . $appointment->user->last_name,
                    'motorcycle_name' => $appointment->motorcycle->motorcycleModel->brand . ' ' . $appointment->motorcycle->motorcycleModel->name . ' (' . $appointment->motorcycle->license_plate . ')',
                ];
            }
        }

        return Inertia::render('admin/work-orders/create', [
            'customers' => $customers,
            'mechanics' => $mechanics,
            'appointments' => $appointments,
            'prefilledData' => $prefilledData,
        ]);
    }

    /**
     * Store a newly created work order.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'motorcycle_id' => 'required|exists:motorcycles,id',
            'appointment_id' => 'nullable|exists:appointments,id',
            'description' => 'required|string|max:1000',
            'status' => 'required|in:pending,in_progress,completed,cancelled',
            'labor_cost' => 'nullable|numeric|min:0',
            'parts_cost' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:2000',
            'mechanics' => 'nullable|array',
            'mechanics.*' => 'exists:users,id',
        ]);

        // Calculate total cost
        $laborCost = $validated['labor_cost'] ?? 0;
        $partsCost = $validated['parts_cost'] ?? 0;
        $validated['total_cost'] = $laborCost + $partsCost;

        // Set started_at if status is in_progress
        if ($validated['status'] === 'in_progress') {
            $validated['started_at'] = now();
        }

        // Set completed_at if status is completed
        if ($validated['status'] === 'completed') {
            $validated['completed_at'] = now();
            if (!isset($validated['started_at'])) {
                $validated['started_at'] = now();
            }
        }

        $workOrder = WorkOrder::create($validated);

        // Assign mechanics if provided
        if (!empty($validated['mechanics'])) {
            $mechanicData = [];
            foreach ($validated['mechanics'] as $mechanicId) {
                $mechanicData[$mechanicId] = [
                    'assigned_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            $workOrder->mechanics()->attach($mechanicData);
        }

        // Update appointment status if linked
        if ($workOrder->appointment_id) {
            $workOrder->appointment()->update(['status' => 'in_progress']);
        }

        return redirect()->route('admin.work-orders.show', $workOrder)
            ->with('success', 'Work order created successfully!');
    }

    /**
     * Display the specified work order.
     */
    public function show(WorkOrder $workOrder): Response
    {
        $workOrder->load([
            'user',
            'motorcycle.motorcycleModel',
            'mechanics',
            'appointment',
            'parts',
            'invoice'
        ]);

        $workOrderData = [
            'id' => $workOrder->id,
            'description' => $workOrder->description,
            'status' => $workOrder->status,
            'started_at' => $workOrder->started_at?->format('Y-m-d H:i'),
            'completed_at' => $workOrder->completed_at?->format('Y-m-d H:i'),
            'total_cost' => $workOrder->total_cost ? (float) $workOrder->total_cost : 0.0,
            'labor_cost' => $workOrder->labor_cost ? (float) $workOrder->labor_cost : 0.0,
            'parts_cost' => $workOrder->parts_cost ? (float) $workOrder->parts_cost : 0.0,
            'notes' => $workOrder->notes,
            'created_at' => $workOrder->created_at->format('Y-m-d H:i'),
        ];

        $customer = [
            'id' => $workOrder->user->id,
            'name' => $workOrder->user->first_name . ' ' . $workOrder->user->last_name,
            'email' => $workOrder->user->email,
            'phone' => $workOrder->user->phone,
        ];

        $motorcycle = [
            'id' => $workOrder->motorcycle->id,
            'brand' => $workOrder->motorcycle->motorcycleModel->brand,
            'model' => $workOrder->motorcycle->motorcycleModel->name,
            'year' => $workOrder->motorcycle->registration_year,
            'plate' => $workOrder->motorcycle->license_plate,
            'vin' => $workOrder->motorcycle->vin,
        ];

        $mechanics = $workOrder->mechanics->map(function ($mechanic) {
            return [
                'id' => $mechanic->id,
                'name' => $mechanic->first_name . ' ' . $mechanic->last_name,
                'email' => $mechanic->email,
                'assigned_at' => $mechanic->pivot->assigned_at ? Carbon::parse($mechanic->pivot->assigned_at)->format('Y-m-d H:i') : null,
                'started_at' => $mechanic->pivot->started_at ? Carbon::parse($mechanic->pivot->started_at)->format('Y-m-d H:i') : null,
                'completed_at' => $mechanic->pivot->completed_at ? Carbon::parse($mechanic->pivot->completed_at)->format('Y-m-d H:i') : null,
                'notes' => $mechanic->pivot->notes,
            ];
        });

        $parts = $workOrder->parts->map(function ($part) {
            return [
                'id' => $part->id,
                'name' => $part->name,
                'quantity' => $part->pivot->quantity,
                'unit_price' => (float) $part->pivot->unit_price,
                'total_price' => (float) $part->pivot->total_price,
            ];
        });

        $appointment = $workOrder->appointment ? [
            'id' => $workOrder->appointment->id,
            'date' => $workOrder->appointment->appointment_date->format('Y-m-d'),
            'time' => $workOrder->appointment->appointment_time,
            'type' => $workOrder->appointment->type,
        ] : null;

        $invoice = $workOrder->invoice ? [
            'id' => $workOrder->invoice->id,
            'invoice_number' => $workOrder->invoice->invoice_number,
            'status' => $workOrder->invoice->status,
            'total_amount' => (float) $workOrder->invoice->total_amount,
        ] : null;

        return Inertia::render('admin/work-orders/show', [
            'workOrder' => $workOrderData,
            'customer' => $customer,
            'motorcycle' => $motorcycle,
            'mechanics' => $mechanics,
            'parts' => $parts,
            'appointment' => $appointment,
            'invoice' => $invoice,
        ]);
    }

    /**
     * Show the form for editing the specified work order.
     */
    public function edit(WorkOrder $workOrder): Response
    {
        $workOrder->load(['user', 'motorcycle.motorcycleModel', 'mechanics']);

        $customers = User::where('type', 'customer')
            ->with('motorcycles.motorcycleModel')
            ->orderBy('first_name')
            ->get()
            ->map(function ($customer) {
                return [
                    'id' => $customer->id,
                    'name' => $customer->first_name . ' ' . $customer->last_name,
                    'email' => $customer->email,
                    'motorcycles' => $customer->motorcycles->map(function ($motorcycle) {
                        return [
                            'id' => $motorcycle->id,
                            'name' => $motorcycle->motorcycleModel->brand . ' ' . $motorcycle->motorcycleModel->name,
                            'plate' => $motorcycle->license_plate,
                            'year' => $motorcycle->registration_year,
                        ];
                    }),
                ];
            });

        $mechanics = User::where('type', 'mechanic')
            ->orderBy('first_name')
            ->get()
            ->map(function ($mechanic) {
                return [
                    'id' => $mechanic->id,
                    'name' => $mechanic->first_name . ' ' . $mechanic->last_name,
                    'email' => $mechanic->email,
                ];
            });

        $workOrderData = [
            'id' => $workOrder->id,
            'user_id' => $workOrder->user_id,
            'motorcycle_id' => $workOrder->motorcycle_id,
            'appointment_id' => $workOrder->appointment_id,
            'description' => $workOrder->description,
            'status' => $workOrder->status,
            'labor_cost' => $workOrder->labor_cost ? (float) $workOrder->labor_cost : 0.0,
            'parts_cost' => $workOrder->parts_cost ? (float) $workOrder->parts_cost : 0.0,
            'notes' => $workOrder->notes,
            'assigned_mechanics' => $workOrder->mechanics->pluck('id')->toArray(),
        ];

        return Inertia::render('admin/work-orders/edit', [
            'workOrder' => $workOrderData,
            'customers' => $customers,
            'mechanics' => $mechanics,
        ]);
    }

    /**
     * Update the specified work order.
     */
    public function update(Request $request, WorkOrder $workOrder): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'motorcycle_id' => 'required|exists:motorcycles,id',
            'appointment_id' => 'nullable|exists:appointments,id',
            'description' => 'required|string|max:1000',
            'status' => 'required|in:pending,in_progress,completed,cancelled',
            'labor_cost' => 'nullable|numeric|min:0',
            'parts_cost' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:2000',
            'mechanics' => 'nullable|array',
            'mechanics.*' => 'exists:users,id',
        ]);

        // Calculate total cost
        $laborCost = $validated['labor_cost'] ?? 0;
        $partsCost = $validated['parts_cost'] ?? 0;
        $validated['total_cost'] = $laborCost + $partsCost;

        // Set started_at if status changed to in_progress and not already set
        if ($validated['status'] === 'in_progress' && !$workOrder->started_at) {
            $validated['started_at'] = now();
        }

        // Set completed_at if status changed to completed and not already set
        if ($validated['status'] === 'completed' && !$workOrder->completed_at) {
            $validated['completed_at'] = now();
            if (!$workOrder->started_at) {
                $validated['started_at'] = now();
            }
        }

        $workOrder->update($validated);

        // Update mechanics assignment
        if (isset($validated['mechanics'])) {
            $mechanicData = [];
            foreach ($validated['mechanics'] as $mechanicId) {
                $mechanicData[$mechanicId] = [
                    'assigned_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            $workOrder->mechanics()->sync($mechanicData);
        } else {
            $workOrder->mechanics()->detach();
        }

        return redirect()->route('admin.work-orders.show', $workOrder)
            ->with('success', 'Work order updated successfully!');
    }

    /**
     * Remove the specified work order.
     */
    public function destroy(WorkOrder $workOrder): RedirectResponse
    {
        // Check if work order has an invoice
        if ($workOrder->invoice) {
            return redirect()->route('admin.work-orders.index')
                ->with('error', 'Cannot delete work order with an associated invoice.');
        }

        // Detach mechanics
        $workOrder->mechanics()->detach();

        // Detach parts
        $workOrder->parts()->detach();

        $workOrder->delete();

        return redirect()->route('admin.work-orders.index')
            ->with('success', 'Work order deleted successfully!');
    }

    /**
     * Assign mechanics to a work order.
     */
    public function assignMechanics(Request $request, WorkOrder $workOrder): RedirectResponse
    {
        $validated = $request->validate([
            'mechanics' => 'required|array',
            'mechanics.*' => 'exists:users,id',
        ]);

        $mechanicData = [];
        foreach ($validated['mechanics'] as $mechanicId) {
            $mechanicData[$mechanicId] = [
                'assigned_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        $workOrder->mechanics()->sync($mechanicData);

        return redirect()->route('admin.work-orders.show', $workOrder)
            ->with('success', 'Mechanics assigned successfully!');
    }

    /**
     * Update work order status.
     */
    public function updateStatus(Request $request, WorkOrder $workOrder): RedirectResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,in_progress,completed,cancelled',
        ]);

        $updateData = ['status' => $validated['status']];

        // Set started_at if status changed to in_progress and not already set
        if ($validated['status'] === 'in_progress' && !$workOrder->started_at) {
            $updateData['started_at'] = now();
        }

        // Set completed_at if status changed to completed and not already set
        if ($validated['status'] === 'completed' && !$workOrder->completed_at) {
            $updateData['completed_at'] = now();
            if (!$workOrder->started_at) {
                $updateData['started_at'] = now();
            }
        }

        $workOrder->update($updateData);

        return redirect()->route('admin.work-orders.show', $workOrder)
            ->with('success', 'Work order status updated successfully!');
    }
} 