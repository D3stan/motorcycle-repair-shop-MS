<?php

namespace App\Http\Controllers;

use App\Models\WorkOrder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WorkOrderController extends Controller
{
    /**
     * Show the work orders page.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Get user's work orders with related data
        $workOrders = $user->workOrders()
            ->with(['motorcycle.motorcycleModel', 'appointment', 'invoice'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($workOrder) {
                return [
                    'id' => $workOrder->CodiceIntervento,
                    'description' => $workOrder->Note,
                    'status' => $workOrder->DataFine ? 'completed' : ($workOrder->DataInizio ? 'in_progress' : 'pending'),
                    'started_at' => $workOrder->DataInizio?->format('Y-m-d H:i'),
                    'completed_at' => $workOrder->DataFine?->format('Y-m-d H:i'),
                    'hours_worked' => $workOrder->OreImpiegate ? (float) $workOrder->OreImpiegate : 0.0,
                    'motorcycle' => [
                        'id' => $workOrder->motorcycle->NumTelaio,
                        'brand' => $workOrder->motorcycle->motorcycleModel->Marca,
                        'model' => $workOrder->motorcycle->motorcycleModel->Nome,
                        'plate' => $workOrder->motorcycle->Targa,
                    ],
                    'appointment' => $workOrder->appointment ? [
                        'id' => $workOrder->appointment->CodiceAppuntamento,
                        'appointment_date' => $workOrder->appointment->DataAppuntamento->format('Y-m-d'),
                        'type' => ucfirst(str_replace('_', ' ', $workOrder->appointment->Tipo)),
                    ] : null,
                    'invoice' => $workOrder->invoice ? [
                        'id' => $workOrder->invoice->CodiceFattura,
                        'invoice_number' => $workOrder->invoice->CodiceFattura,
                        'status' => $workOrder->invoice->Stato,
                    ] : null,
                    'notes' => $workOrder->Note,
                ];
            });

        // Separate active and completed work orders
        $activeWorkOrders = $workOrders->filter(function ($workOrder) {
            return in_array($workOrder['status'], ['pending', 'in_progress']);
        });

        $completedWorkOrders = $workOrders->filter(function ($workOrder) {
            return $workOrder['status'] === 'completed';
        });

        return Inertia::render('work-orders', [
            'activeWorkOrders' => $activeWorkOrders->values()->all(),
            'completedWorkOrders' => $completedWorkOrders->values()->all(),
        ]);
    }

    /**
     * Show the specified work order details.
     */
    public function show(Request $request, WorkOrder $workOrder): Response
    {
        // Ensure the work order belongs to the authenticated user via motorcycle ownership
        if ($workOrder->motorcycle->CF !== $request->user()->CF) {
            abort(403, 'Unauthorized action.');
        }

        // Load relationships
        $workOrder->load(['motorcycle.motorcycleModel', 'appointment', 'invoice', 'parts']);

        $workOrderDetails = [
            'id' => $workOrder->CodiceIntervento,
            'description' => $workOrder->Note,
            'status' => $workOrder->DataFine ? 'completed' : ($workOrder->DataInizio ? 'in_progress' : 'pending'),
            'started_at' => $workOrder->DataInizio?->format('Y-m-d H:i'),
            'completed_at' => $workOrder->DataFine?->format('Y-m-d H:i'),
            'hours_worked' => $workOrder->OreImpiegate ? (float) $workOrder->OreImpiegate : 0.0,
            'km_motorcycle' => $workOrder->KmMoto,
            'work_type' => $workOrder->Tipo,
            'cause' => $workOrder->Causa,
            'motorcycle' => [
                'id' => $workOrder->motorcycle->NumTelaio,
                'brand' => $workOrder->motorcycle->motorcycleModel->Marca,
                'model' => $workOrder->motorcycle->motorcycleModel->Nome,
                'year' => $workOrder->motorcycle->AnnoImmatricolazione,
                'plate' => $workOrder->motorcycle->Targa,
                'vin' => $workOrder->motorcycle->NumTelaio,
            ],
            'appointment' => $workOrder->appointment ? [
                'id' => $workOrder->appointment->CodiceAppuntamento,
                'appointment_date' => $workOrder->appointment->DataAppuntamento->format('Y-m-d'),
                'appointment_time' => $workOrder->appointment->Ora instanceof \DateTime ? $workOrder->appointment->Ora->format('H:i') : substr($workOrder->appointment->Ora, 0, 5),
                'type' => ucfirst(str_replace('_', ' ', $workOrder->appointment->Tipo)),
            ] : null,
            'invoice' => $workOrder->invoice ? [
                'id' => $workOrder->invoice->CodiceFattura,
                'invoice_number' => $workOrder->invoice->CodiceFattura,
                'issue_date' => $workOrder->invoice->DataEmissione->format('Y-m-d'),
                'due_date' => $workOrder->invoice->DataScadenza->format('Y-m-d'),
                'status' => $workOrder->invoice->Stato,
                'total_amount' => $workOrder->invoice->Importo ? (float) $workOrder->invoice->Importo : 0.0,
            ] : null,
            'notes' => $workOrder->Note,
        ];

        // Get parts breakdown from the actual relationship
        $partsBreakdown = $workOrder->parts->map(function ($part) {
            return [
                'name' => $part->Nome,
                'quantity' => (int) $part->pivot->Quantita,
                'unit_price' => (float) $part->pivot->Prezzo,
                'total_price' => (float) ($part->pivot->Quantita * $part->pivot->Prezzo),
            ];
        });

        return Inertia::render('work-orders/show', [
            'workOrder' => $workOrderDetails,
            'partsBreakdown' => $partsBreakdown->values()->all(),
        ]);
    }
} 