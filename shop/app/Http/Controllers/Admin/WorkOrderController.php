<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\WorkOrder;
use App\Models\WorkSession;
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
     * Display a listing of work orders and work sessions.
     */
    public function index(): Response
    {
        // Get work orders (INTERVENTI)
        $workOrders = WorkOrder::with([
            'user',
            'motorcycle.motorcycleModel',
            'mechanics',
            'invoice'
        ])
        ->orderBy('created_at', 'desc')
        ->get();

        // Get work sessions (SESSIONI) - only those with valid relationships
        $workSessions = WorkSession::with([
                'motorcycle.motorcycleModel',
                'motorcycle.user',
                'mechanics',
                'invoice'
            ])
        ->orderBy('created_at', 'desc')
        ->get();

        // Combine and format both types
        $allWork = collect();

        // Add work orders
        $workOrders->each(function ($workOrder) use ($allWork) {
            $allWork->push([
                'id' => $workOrder->CodiceIntervento,
                'type' => 'work_order',
                'type_label' => 'Work Order',
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
                'total_cost' => $workOrder->invoice ? (float) $workOrder->invoice->Importo : 0.0,
                'created_at' => $workOrder->created_at->format('Y-m-d H:i'),
                'work_type' => $workOrder->Tipo,
                'cause' => $workOrder->Causa,
                'name' => $workOrder->Nome,
            ]);
        });

        // Add work sessions
        $workSessions->each(function ($workSession) use ($allWork) {
            $allWork->push([
                'id' => $workSession->CodiceSessione,
                'type' => 'work_session',
                'type_label' => 'Work Session',
                'description' => $workSession->Note ?? 'Work session',
                'status' => $workSession->Stato,
                'started_at' => $workSession->Data->format('Y-m-d'),
                'completed_at' => null, // Sessions use single date field
                'hours_worked' => $workSession->OreImpiegate ? (float) $workSession->OreImpiegate : 0.0,
                'customer' => $workSession->motorcycle->user->first_name . ' ' . $workSession->motorcycle->user->last_name,
                'customer_email' => $workSession->motorcycle->user->email,
                'motorcycle' => $workSession->motorcycle->motorcycleModel->Marca . ' ' . $workSession->motorcycle->motorcycleModel->Nome,
                'motorcycle_plate' => $workSession->motorcycle->Targa,
                'mechanics' => $workSession->mechanics->map(function ($mechanic) {
                    return [
                        'id' => $mechanic->id,
                        'name' => $mechanic->first_name . ' ' . $mechanic->last_name,
                        'assigned_at' => $mechanic->pivot->created_at ? Carbon::parse($mechanic->pivot->created_at)->format('Y-m-d H:i') : null,
                    ];
                }),
                'total_cost' => $workSession->invoice ? (float) $workSession->invoice->Importo : 0.0,
                'created_at' => $workSession->created_at->format('Y-m-d H:i'),
                'work_type' => 'session',
                'cause' => null,
                'name' => 'Work Session',
            ]);
        });

        // Sort by creation date and paginate manually
        $allWorkSorted = $allWork->sortByDesc('created_at')->values();
        $currentPage = request()->get('page', 1);
        $perPage = 20;
        $workItems = $allWorkSorted->slice(($currentPage - 1) * $perPage, $perPage)->values();

        // Create pagination data
        $total = $allWorkSorted->count();
        $lastPage = ceil($total / $perPage);
        
        $paginatedData = [
            'data' => $workItems,
            'meta' => [
                'current_page' => $currentPage,
                'per_page' => $perPage,
                'total' => $total,
                'last_page' => $lastPage,
                'from' => ($currentPage - 1) * $perPage + 1,
                'to' => min($currentPage * $perPage, $total),
            ],
        ];

        // Get combined statistics
        $statistics = [
            'total' => WorkOrder::count() + WorkSession::count(),
            'pending' => WorkOrder::where('Stato', 'pending')->count() + WorkSession::where('Stato', 'pending')->count(),
            'in_progress' => WorkOrder::where('Stato', 'in_progress')->count() + WorkSession::where('Stato', 'in_progress')->count(),
            'completed' => WorkOrder::where('Stato', 'completed')->count() + WorkSession::where('Stato', 'completed')->count(),
            'cancelled' => WorkOrder::where('Stato', 'cancelled')->count() + WorkSession::where('Stato', 'cancelled')->count(),
            'work_orders_count' => WorkOrder::count(),
            'work_sessions_count' => WorkSession::count(),
        ];

        return Inertia::render('admin/work-orders/index', [
            'workOrders' => $paginatedData,
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

        return Inertia::render('admin/work-orders/create', [
            'customers' => $customers,
            'mechanics' => $mechanics,
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
            'type' => 'required|in:session,maintenance',
            'description' => 'required|string|max:1000',
            'status' => 'required|in:pending,in_progress,completed,cancelled',
            'hours_worked' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:2000',
            'mechanics' => 'nullable|array',
            'mechanics.*' => 'exists:users,CF',
        ]);

        if ($validated['type'] === 'session') {
            // Create work session (SESSIONI)
            $stato = $validated['status'];
            
            $workSessionData = [
                'CodiceSessione' => 'WS' . str_pad(WorkSession::count() + 1, 6, '0', STR_PAD_LEFT),
                'Data' => now()->toDateString(),
                'OreImpiegate' => $validated['hours_worked'] ?? 0,
                'Stato' => $stato,
                'Note' => $validated['description'],
                'NumTelaio' => $validated['motorcycle_id'],
            ];

            $workSession = WorkSession::create($workSessionData);

            // Assign mechanics if provided
            if (!empty($validated['mechanics'])) {
                $mechanicData = [];
                foreach ($validated['mechanics'] as $mechanicCF) {
                    $mechanicData[$mechanicCF] = [
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
                $workSession->mechanics()->attach($mechanicData);
            }

            return redirect()->route('admin.work-orders.show', ['id' => $workSession->CodiceSessione, 'type' => 'work_session'])
                ->with('success', 'Work session created successfully!');
                
        } else {
            // Create work order (INTERVENTI)
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
                'Tipo' => 'manutenzione_ordinaria',
                'Stato' => $stato,
                'Causa' => null,
                'OreImpiegate' => $validated['hours_worked'] ?? 0,
                'Note' => $validated['description'],
                'NoteAggiuntive' => $validated['notes'],
                'Nome' => $validated['description'],
                'NumTelaio' => $validated['motorcycle_id'],
                'CF' => $validated['user_id'],
                'CodiceAppuntamento' => null,
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

            return redirect()->route('admin.work-orders.show', $workOrder->CodiceIntervento)
                ->with('success', 'Work order created successfully!');
        }
    }

    /**
     * Display the specified work order or work session.
     */
    public function show(Request $request, $id): Response
    {
        $type = $request->get('type', 'work_order');
        
        if ($type === 'work_session') {
            $workSession = WorkSession::with([
                'motorcycle.motorcycleModel',
                'motorcycle.user',
                'mechanics',
                'invoice'
            ])->where('CodiceSessione', $id)->firstOrFail();

            $workData = [
                'id' => $workSession->CodiceSessione,
                'type' => 'work_session',
                'type_label' => 'Work Session',
                'description' => $workSession->Note ?? 'Work session',
                'status' => $workSession->Stato,
                'started_at' => $workSession->Data->format('Y-m-d'),
                'completed_at' => null,
                'hours_worked' => $workSession->OreImpiegate ? (float) $workSession->OreImpiegate : 0.0,
                'total_cost' => $workSession->invoice ? (float) $workSession->invoice->Importo : 0.0,
                'created_at' => $workSession->created_at->format('Y-m-d H:i'),
                'work_type' => 'session',
                'name' => 'Work Session',
            ];

            $customer = [
                'id' => $workSession->motorcycle->user->id,
                'name' => $workSession->motorcycle->user->first_name . ' ' . $workSession->motorcycle->user->last_name,
                'email' => $workSession->motorcycle->user->email,
                'phone' => $workSession->motorcycle->user->phone,
                'CF' => $workSession->motorcycle->user->CF,
            ];

            $motorcycle = [
                'id' => $workSession->motorcycle->NumTelaio,
                'brand' => $workSession->motorcycle->motorcycleModel->Marca,
                'model' => $workSession->motorcycle->motorcycleModel->Nome,
                'year' => $workSession->motorcycle->AnnoImmatricolazione,
                'plate' => $workSession->motorcycle->Targa,
                'vin' => $workSession->motorcycle->NumTelaio,
            ];

            $mechanics = $workSession->mechanics->map(function ($mechanic) {
                return [
                    'id' => $mechanic->id,
                    'name' => $mechanic->first_name . ' ' . $mechanic->last_name,
                    'email' => $mechanic->email,
                    'CF' => $mechanic->CF,
                    'assigned_at' => $mechanic->pivot->created_at ? Carbon::parse($mechanic->pivot->created_at)->format('Y-m-d H:i') : null,
                ];
            });

            $parts = collect(); // Work sessions don't have parts

            $invoice = $workSession->invoice ? [
                'id' => $workSession->invoice->CodiceFattura,
                'invoice_number' => $workSession->invoice->CodiceFattura,
                'total_amount' => (float) $workSession->invoice->Importo,
            ] : null;

        } else {
            $workOrder = WorkOrder::with([
                'motorcycle.motorcycleModel',
                'motorcycle.user',
                'mechanics',
                'parts',
                'invoice'
            ])->where('CodiceIntervento', $id)->firstOrFail();

            $workData = [
                'id' => $workOrder->CodiceIntervento,
                'type' => 'work_order',
                'type_label' => 'Work Order',
                'description' => $workOrder->Note,
                'status' => $workOrder->Stato,
                'started_at' => $workOrder->DataInizio?->format('Y-m-d H:i'),
                'completed_at' => $workOrder->DataFine?->format('Y-m-d H:i'),
                'hours_worked' => $workOrder->OreImpiegate ? (float) $workOrder->OreImpiegate : 0.0,
                'km_motorcycle' => $workOrder->KmMoto,
                'work_type' => $workOrder->Tipo,
                'cause' => $workOrder->Causa,
                'name' => $workOrder->Nome,
                'total_cost' => $workOrder->invoice ? (float) $workOrder->invoice->Importo : 0.0,
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

            $invoice = $workOrder->invoice ? [
                'id' => $workOrder->invoice->CodiceFattura,
                'invoice_number' => $workOrder->invoice->CodiceFattura,
                'total_amount' => (float) $workOrder->invoice->Importo,
            ] : null;
        }

        return Inertia::render('admin/work-orders/show', [
            'workOrder' => $workData,
            'customer' => $customer,
            'motorcycle' => $motorcycle,
            'mechanics' => $mechanics,
            'parts' => $parts,
            'invoice' => $invoice,
        ]);
    }

    /**
     * Show the form for editing the specified work order or work session.
     */
    public function edit(Request $request, $id): Response
    {
        $type = $request->get('type', 'work_order');
        
        if ($type === 'work_session') {
            $workSession = WorkSession::with(['motorcycle.motorcycleModel', 'motorcycle.user', 'mechanics'])
                ->where('CodiceSessione', $id)
                ->firstOrFail();

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

            $workData = [
                'id' => $workSession->CodiceSessione,
                'type' => 'work_session',
                'user_id' => $workSession->motorcycle->CF,
                'motorcycle_id' => $workSession->NumTelaio,
                'description' => $workSession->Note,
                'status' => $workSession->Stato,
                'hours_worked' => $workSession->OreImpiegate ? (float) $workSession->OreImpiegate : 0.0,
                'notes' => null,
                'assigned_mechanics' => $workSession->mechanics->pluck('CF')->toArray(),
            ];

            return Inertia::render('admin/work-orders/edit', [
                'workOrder' => $workData,
                'customers' => $customers,
                'mechanics' => $mechanics,
                'isSession' => true,
            ]);
        } else {
            $workOrder = WorkOrder::with(['user', 'motorcycle.motorcycleModel', 'mechanics'])
                ->where('CodiceIntervento', $id)
                ->firstOrFail();

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
                'type' => 'work_order',
                'user_id' => $workOrder->motorcycle->CF,
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
                'isSession' => false,
            ]);
        }
    }

    /**
     * Update the specified work order or work session.
     */
    public function update(Request $request, $id): RedirectResponse
    {
        $type = $request->get('type', 'work_order');
        
        $validated = $request->validate([
            'user_id' => 'required|exists:users,CF',
            'motorcycle_id' => 'required|exists:MOTO,NumTelaio',
            'description' => 'required|string|max:1000',
            'status' => 'required|in:pending,in_progress,completed,cancelled',
            'hours_worked' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:2000',
            'mechanics' => 'nullable|array',
            'mechanics.*' => 'exists:users,CF',
        ]);

        if ($type === 'work_session') {
            $workSession = WorkSession::where('CodiceSessione', $id)->firstOrFail();
            
            $workSession->update([
                'Stato' => $validated['status'],
                'OreImpiegate' => $validated['hours_worked'] ?? 0,
                'Note' => $validated['description'],
                'NumTelaio' => $validated['motorcycle_id'],
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
                $workSession->mechanics()->sync($mechanicData);
            } else {
                $workSession->mechanics()->detach();
            }

            return redirect()->route('admin.work-orders.show', ['id' => $workSession->CodiceSessione, 'type' => 'work_session'])
                ->with('success', 'Work session updated successfully!');
        } else {
            $workOrder = WorkOrder::where('CodiceIntervento', $id)->firstOrFail();
            
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
    }

    /**
     * Remove the specified work order or work session.
     */
    public function destroy(Request $request, $id): RedirectResponse
    {
        $type = $request->get('type', 'work_order');
        
        if ($type === 'work_session') {
            $workSession = WorkSession::where('CodiceSessione', $id)->firstOrFail();
            
            // Check if work session has an invoice
            if ($workSession->invoice) {
                return redirect()->route('admin.work-orders.index')
                    ->with('error', 'Cannot delete work session with an associated invoice.');
            }

            // Detach mechanics
            $workSession->mechanics()->detach();

            $workSession->delete();

            return redirect()->route('admin.work-orders.index')
                ->with('success', 'Work session deleted successfully!');
        } else {
            $workOrder = WorkOrder::where('CodiceIntervento', $id)->firstOrFail();
            
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

    /**
     * Mark a work order as completed and set the completion date.
     */
    public function markCompleted(WorkOrder $workOrder): RedirectResponse
    {
        
        // Set status to completed and completion date
        $workOrder->update([
            'Stato' => 'completed',
            'DataFine' => now(),
        ]);

        return back()->with('success', 'Work order marked as completed successfully!');
    }
} 