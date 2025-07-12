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
            'invoice'
        ])
        ->orderBy('created_at', 'desc')
        ->paginate(20);

        $workOrdersData = $workOrders->through(function ($workOrder) {
            return [
                'id' => $workOrder->CodiceIntervento,
                'description' => $workOrder->Note,
                'status' => $workOrder->Stato,
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
                'appointment_id' => null, // Appointments not linked to work orders in simplified schema
                'total_cost' => $workOrder->invoice ? (float) $workOrder->invoice->Importo : 0.0,
                'created_at' => $workOrder->created_at->format('Y-m-d H:i'),
            ];
        });

        // Get statistics using Stato column
        $statistics = [
            'total' => WorkOrder::count(),
            'pending' => WorkOrder::where('Stato', 'pending')->count(),
            'in_progress' => WorkOrder::where('Stato', 'in_progress')->count(),
            'completed' => WorkOrder::where('Stato', 'completed')->count(),
            'cancelled' => WorkOrder::where('Stato', 'cancelled')->count(),
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
                    'id' => $customer->CF,
                    'name' => $customer->first_name . ' ' . $customer->last_name,
                    'email' => $customer->email,
                    'motorcycles' => $customer->motorcycles->map(function ($motorcycle) {
                        return [
                            'id' => $motorcycle->NumTelaio,
                            'name' => $motorcycle->motorcycleModel->Marca . ' ' . $motorcycle->motorcycleModel->Nome,
                            'plate' => $motorcycle->Targa,
                            'year' => $motorcycle->AnnoImmatricolazione,
                        ];
                    }),
                ];
            });

        $mechanics = User::where('type', 'mechanic')
            ->orderBy('first_name')
            ->get()
            ->map(function ($mechanic) {
                return [
                    'id' => $mechanic->CF,
                    'name' => $mechanic->first_name . ' ' . $mechanic->last_name,
                    'email' => $mechanic->email,
                ];
            });

        // Appointments simplified - no direct link to motorcycles in schema
        $appointments = Appointment::with(['user'])
            ->orderBy('DataAppuntamento')
            ->get()
            ->map(function ($appointment) {
                return [
                    'id' => $appointment->CodiceAppuntamento,
                    'customer' => $appointment->user->first_name . ' ' . $appointment->user->last_name,
                    'description' => $appointment->Descrizione,
                    'date' => $appointment->DataAppuntamento->format('Y-m-d'),
                    'type' => $appointment->Tipo,
                ];
            });

        // Pre-fill data if coming from appointment (simplified)
        $prefilledData = null;
        if ($request->has('appointment_id')) {
            $appointment = Appointment::with(['user'])
                ->where('CodiceAppuntamento', $request->appointment_id)
                ->first();
            
            if ($appointment) {
                $prefilledData = [
                    'appointment_id' => $appointment->CodiceAppuntamento,
                    'CF' => $appointment->CF,
                    'description' => 'Work order for ' . ucfirst(str_replace('_', ' ', $appointment->Tipo)) . ' appointment: ' . $appointment->Descrizione,
                    'customer_name' => $appointment->user->first_name . ' ' . $appointment->user->last_name,
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
            'user_id' => 'required|exists:users,CF',
            'motorcycle_id' => 'required|exists:MOTO,NumTelaio',
            'appointment_id' => 'nullable|exists:APPUNTAMENTI,CodiceAppuntamento',
            'description' => 'required|string|max:1000',
            'status' => 'required|in:pending,in_progress,completed,cancelled',
            'hours_worked' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:2000',
            'mechanics' => 'nullable|array',
            'mechanics.*' => 'exists:users,CF',
        ]);

        // Determine status and dates based on request
        $stato = $validated['status'];
        $dataInizio = null;
        $dataFine = null;
        
        if ($stato === 'in_progress') {
            $dataInizio = now();
        }
        
        if ($stato === 'completed') {
            $dataInizio = $dataInizio ?? now();
            $dataFine = now();
        }

        $workOrderData = [
            'CodiceIntervento' => 'WO' . str_pad(WorkOrder::count() + 1, 6, '0', STR_PAD_LEFT),
            'DataInizio' => $dataInizio,
            'DataFine' => $dataFine,
            'KmMoto' => 0,
            'Tipo' => 'manutenzione_ordinaria', // Default type
            'Stato' => $stato,
            'Causa' => null,
            'OreImpiegate' => $validated['hours_worked'] ?? 0,
            'Note' => $validated['description'],
            'NoteAggiuntive' => $validated['notes'],
            'Nome' => $validated['description'], // Using description as name
            'NumTelaio' => $validated['motorcycle_id'],
            'CF' => $validated['user_id'],
            'CodiceAppuntamento' => $validated['appointment_id'],
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
        if (!empty($validated['appointment_id'])) {
            Appointment::where('CodiceAppuntamento', $validated['appointment_id'])
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
            'total_cost' => $workOrder->invoice ? (float) $workOrder->invoice->Importo : 0.0,
            'labor_cost' => 0.0, // Labor cost not tracked separately in simplified schema
            'parts_cost' => $workOrder->parts->sum(fn($part) => $part->pivot->Quantita * $part->pivot->Prezzo),
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

        // Appointment relationship not available in simplified schema
        $appointment = null;

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
                    'id' => $customer->CF,
                    'name' => $customer->first_name . ' ' . $customer->last_name,
                    'email' => $customer->email,
                    'motorcycles' => $customer->motorcycles->map(function ($motorcycle) {
                        return [
                            'id' => $motorcycle->NumTelaio,
                            'name' => $motorcycle->motorcycleModel->Marca . ' ' . $motorcycle->motorcycleModel->Nome,
                            'plate' => $motorcycle->Targa,
                            'year' => $motorcycle->AnnoImmatricolazione,
                        ];
                    }),
                ];
            });

        $mechanics = User::where('type', 'mechanic')
            ->orderBy('first_name')
            ->get()
            ->map(function ($mechanic) {
                return [
                    'id' => $mechanic->CF,
                    'name' => $mechanic->first_name . ' ' . $mechanic->last_name,
                    'email' => $mechanic->email,
                ];
            });

        $workOrderData = [
            'id' => $workOrder->CodiceIntervento,
            'user_id' => $workOrder->CF,
            'motorcycle_id' => $workOrder->NumTelaio,
            'appointment_id' => $workOrder->CodiceAppuntamento,
            'description' => $workOrder->Note,
            'status' => $workOrder->Stato,
            'hours_worked' => $workOrder->OreImpiegate ? (float) $workOrder->OreImpiegate : 0.0,
            'notes' => $workOrder->NoteAggiuntive,
            'assigned_mechanics' => $workOrder->mechanics->pluck('CF')->toArray(),
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
            'user_id' => 'required|exists:users,CF',
            'motorcycle_id' => 'required|exists:MOTO,NumTelaio',
            'appointment_id' => 'nullable|exists:APPUNTAMENTI,CodiceAppuntamento',
            'description' => 'required|string|max:1000',
            'status' => 'required|in:pending,in_progress,completed,cancelled',
            'hours_worked' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:2000',
            'mechanics' => 'nullable|array',
            'mechanics.*' => 'exists:users,CF',
        ]);

        // Determine status and dates based on request
        $stato = $validated['status'];
        $dataInizio = $workOrder->DataInizio;
        $dataFine = $workOrder->DataFine;
        
        if ($stato === 'in_progress' && !$workOrder->DataInizio) {
            $dataInizio = now();
        }
        
        if ($stato === 'completed' && !$workOrder->DataFine) {
            $dataFine = now();
            if (!$workOrder->DataInizio) {
                $dataInizio = now();
            }
        }

        $workOrder->update([
            'DataInizio' => $dataInizio,
            'DataFine' => $dataFine,
            'Stato' => $stato,
            'OreImpiegate' => $validated['hours_worked'] ?? 0,
            'Note' => $validated['description'],
            'NoteAggiuntive' => $validated['notes'],
            'NumTelaio' => $validated['motorcycle_id'],
            'CF' => $validated['user_id'],
            'CodiceAppuntamento' => $validated['appointment_id'],
        ]);

        // Update mechanics assignment
        if (isset($validated['mechanics'])) {
            $mechanicData = [];
            foreach ($validated['mechanics'] as $mechanicCF) {
                $mechanicData[$mechanicCF] = [
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            $workOrder->mechanics()->sync($mechanicData);
        } else {
            $workOrder->mechanics()->detach();
        }

        return redirect()->route('admin.work-orders.show', $workOrder->CodiceIntervento)
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