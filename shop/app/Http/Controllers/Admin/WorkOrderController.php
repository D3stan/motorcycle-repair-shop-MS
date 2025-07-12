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
                'id' => $workOrder->CodiceIntervento,
                'description' => $workOrder->Note,
                'status' => $workOrder->DataFine ? 'completed' : ($workOrder->DataInizio ? 'in_progress' : 'pending'),
                'started_at' => $workOrder->DataInizio?->format('Y-m-d'),
                'completed_at' => $workOrder->DataFine?->format('Y-m-d'),
                'hours_worked' => $workOrder->OreImpiegate ? (float) $workOrder->OreImpiegate : 0.0,
                'customer' => $workOrder->user->first_name . ' ' . $workOrder->user->last_name,
                'customer_email' => $workOrder->user->email,
                'motorcycle' => $workOrder->motorcycle->motorcycleModel->Marca . ' ' . $workOrder->motorcycle->motorcycleModel->Nome,
                'motorcycle_plate' => $workOrder->motorcycle->Targa,
                'mechanics' => $workOrder->mechanics->map(function ($mechanic) {
                    return [
                        'id' => $mechanic->id,
                        'name' => $mechanic->first_name . ' ' . $mechanic->last_name,
                        'assigned_at' => $mechanic->pivot->created_at ? Carbon::parse($mechanic->pivot->created_at)->format('Y-m-d H:i') : null,
                    ];
                }),
                'appointment_id' => $workOrder->appointment?->CodiceAppuntamento,
                'created_at' => $workOrder->created_at->format('Y-m-d H:i'),
            ];
        });

        // Get statistics (derive from DataInizio/DataFine)
        $statistics = [
            'total' => WorkOrder::count(),
            'pending' => WorkOrder::whereNull('DataInizio')->count(),
            'in_progress' => WorkOrder::whereNotNull('DataInizio')->whereNull('DataFine')->count(),
            'completed' => WorkOrder::whereNotNull('DataFine')->count(),
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
            'CF' => 'required|exists:users,CF',
            'NumTelaio' => 'required|exists:motorcycles,NumTelaio',
            'CodiceAppuntamento' => 'nullable|exists:appointments,CodiceAppuntamento',
            'Nome' => 'required|string|max:1000',
            'Tipo' => 'required|string|max:255',
            'Causa' => 'nullable|string|max:1000',
            'KmMoto' => 'nullable|integer|min:0',
            'OreImpiegate' => 'nullable|numeric|min:0',
            'Note' => 'nullable|string|max:2000',
            'mechanics' => 'nullable|array',
            'mechanics.*' => 'exists:users,CF',
        ]);

        // Determine dates based on status
        $dataInizio = null;
        $dataFine = null;
        
        if ($request->has('start_immediately') && $request->start_immediately) {
            $dataInizio = now();
        }
        
        if ($request->has('mark_completed') && $request->mark_completed) {
            $dataInizio = $dataInizio ?? now();
            $dataFine = now();
        }

        $workOrderData = [
            'CodiceIntervento' => 'WO' . str_pad(WorkOrder::count() + 1, 6, '0', STR_PAD_LEFT),
            'DataInizio' => $dataInizio,
            'DataFine' => $dataFine,
            'KmMoto' => $validated['KmMoto'] ?? null,
            'Tipo' => $validated['Tipo'],
            'Causa' => $validated['Causa'] ?? null,
            'OreImpiegate' => $validated['OreImpiegate'] ?? 0,
            'Note' => $validated['Note'] ?? null,
            'Nome' => $validated['Nome'],
            'NumTelaio' => $validated['NumTelaio'],
        ];

        $workOrder = WorkOrder::create($workOrderData);

        // Assign mechanics if provided
        if (!empty($validated['mechanics'])) {
            $mechanicData = [];
            foreach ($validated['mechanics'] as $mechanicCF) {
                $mechanicData[$mechanicCF] = [
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            $workOrder->mechanics()->attach($mechanicData);
        }

        // Update appointment status if linked
        if (!empty($validated['CodiceAppuntamento'])) {
            Appointment::where('CodiceAppuntamento', $validated['CodiceAppuntamento'])
                ->update(['Stato' => 'in_progress']);
        }

        return redirect()->route('admin.work-orders.show', $workOrder->CodiceIntervento)
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
            'id' => $workOrder->CodiceIntervento,
            'description' => $workOrder->Note,
            'status' => $workOrder->DataFine ? 'completed' : ($workOrder->DataInizio ? 'in_progress' : 'pending'),
            'started_at' => $workOrder->DataInizio?->format('Y-m-d H:i'),
            'completed_at' => $workOrder->DataFine?->format('Y-m-d H:i'),
            'hours_worked' => $workOrder->OreImpiegate ? (float) $workOrder->OreImpiegate : 0.0,
            'km_motorcycle' => $workOrder->KmMoto,
            'work_type' => $workOrder->Tipo,
            'cause' => $workOrder->Causa,
            'name' => $workOrder->Nome,
            'notes' => $workOrder->Note,
            'created_at' => $workOrder->created_at->format('Y-m-d H:i'),
        ];

        $customer = [
            'id' => $workOrder->user->id,
            'name' => $workOrder->user->first_name . ' ' . $workOrder->user->last_name,
            'email' => $workOrder->user->email,
            'phone' => $workOrder->user->phone,
            'CF' => $workOrder->user->CF,
        ];

        $motorcycle = [
            'id' => $workOrder->motorcycle->NumTelaio,
            'brand' => $workOrder->motorcycle->motorcycleModel->Marca,
            'model' => $workOrder->motorcycle->motorcycleModel->Nome,
            'year' => $workOrder->motorcycle->AnnoImmatricolazione,
            'plate' => $workOrder->motorcycle->Targa,
            'vin' => $workOrder->motorcycle->NumTelaio,
        ];

        $mechanics = $workOrder->mechanics->map(function ($mechanic) {
            return [
                'id' => $mechanic->id,
                'name' => $mechanic->first_name . ' ' . $mechanic->last_name,
                'email' => $mechanic->email,
                'CF' => $mechanic->CF,
                'assigned_at' => $mechanic->pivot->created_at ? Carbon::parse($mechanic->pivot->created_at)->format('Y-m-d H:i') : null,
            ];
        });

        $parts = $workOrder->parts->map(function ($part) {
            return [
                'id' => $part->CodiceRicambio,
                'name' => $part->Nome,
                'brand' => $part->Marca,
                'quantity' => $part->pivot->Quantita,
                'unit_price' => (float) $part->pivot->Prezzo,
                'total_price' => (float) ($part->pivot->Quantita * $part->pivot->Prezzo),
            ];
        });

        $appointment = $workOrder->appointment ? [
            'id' => $workOrder->appointment->CodiceAppuntamento,
            'date' => $workOrder->appointment->DataAppuntamento->format('Y-m-d'),
            'time' => $workOrder->appointment->Ora instanceof \DateTime ? $workOrder->appointment->Ora->format('H:i') : $workOrder->appointment->Ora,
            'type' => $workOrder->appointment->Tipo,
        ] : null;

        $invoice = $workOrder->invoice ? [
            'id' => $workOrder->invoice->CodiceFattura,
            'invoice_number' => $workOrder->invoice->CodiceFattura,
            'status' => $workOrder->invoice->Stato,
            'total_amount' => (float) $workOrder->invoice->Importo,
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
            'id' => $workOrder->CodiceIntervento,
            'user_id' => $workOrder->user_id,
            'motorcycle_id' => $workOrder->motorcycle_id,
            'appointment_id' => $workOrder->appointment_id,
            'description' => $workOrder->Note,
            'status' => $workOrder->DataFine ? 'completed' : ($workOrder->DataInizio ? 'in_progress' : 'pending'),
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