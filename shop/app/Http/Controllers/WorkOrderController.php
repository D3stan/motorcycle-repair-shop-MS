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
                    'id' => $workOrder->id,
                    'description' => $workOrder->description,
                    'status' => $workOrder->status,
                    'started_at' => $workOrder->started_at?->format('Y-m-d H:i'),
                    'completed_at' => $workOrder->completed_at?->format('Y-m-d H:i'),
                    'labor_cost' => $workOrder->labor_cost ? (float) $workOrder->labor_cost : 0.0,
                    'parts_cost' => $workOrder->parts_cost ? (float) $workOrder->parts_cost : 0.0,
                    'total_cost' => $workOrder->total_cost ? (float) $workOrder->total_cost : 0.0,
                    'motorcycle' => [
                        'id' => $workOrder->motorcycle->id,
                        'brand' => $workOrder->motorcycle->motorcycleModel->brand,
                        'model' => $workOrder->motorcycle->motorcycleModel->name,
                        'plate' => $workOrder->motorcycle->license_plate,
                    ],
                    'appointment' => $workOrder->appointment ? [
                        'id' => $workOrder->appointment->id,
                        'appointment_date' => $workOrder->appointment->appointment_date->format('Y-m-d'),
                        'type' => ucfirst(str_replace('_', ' ', $workOrder->appointment->type)),
                    ] : null,
                    'invoice' => $workOrder->invoice ? [
                        'id' => $workOrder->invoice->id,
                        'invoice_number' => $workOrder->invoice->invoice_number,
                        'status' => $workOrder->invoice->status,
                    ] : null,
                    'notes' => $workOrder->notes,
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
        // Ensure the work order belongs to the authenticated user
        if ($workOrder->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized action.');
        }

        // Load relationships
        $workOrder->load(['motorcycle.motorcycleModel', 'appointment', 'invoice', 'parts']);

        $workOrderDetails = [
            'id' => $workOrder->id,
            'description' => $workOrder->description,
            'status' => $workOrder->status,
            'started_at' => $workOrder->started_at?->format('Y-m-d H:i'),
            'completed_at' => $workOrder->completed_at?->format('Y-m-d H:i'),
                         'labor_cost' => $workOrder->labor_cost ? (float) $workOrder->labor_cost : 0.0,
             'parts_cost' => $workOrder->parts_cost ? (float) $workOrder->parts_cost : 0.0,
             'total_cost' => $workOrder->total_cost ? (float) $workOrder->total_cost : 0.0,
            'motorcycle' => [
                'id' => $workOrder->motorcycle->id,
                'brand' => $workOrder->motorcycle->motorcycleModel->brand,
                'model' => $workOrder->motorcycle->motorcycleModel->name,
                'year' => $workOrder->motorcycle->registration_year,
                'plate' => $workOrder->motorcycle->license_plate,
                'vin' => $workOrder->motorcycle->vin,
            ],
                         'appointment' => $workOrder->appointment ? [
                 'id' => $workOrder->appointment->id,
                 'appointment_date' => $workOrder->appointment->appointment_date->format('Y-m-d'),
                 'appointment_time' => substr($workOrder->appointment->appointment_time, 0, 5),
                 'type' => ucfirst(str_replace('_', ' ', $workOrder->appointment->type)),
             ] : null,
                         'invoice' => $workOrder->invoice ? [
                 'id' => $workOrder->invoice->id,
                 'invoice_number' => $workOrder->invoice->invoice_number,
                 'issue_date' => $workOrder->invoice->issue_date->format('Y-m-d'),
                 'due_date' => $workOrder->invoice->due_date->format('Y-m-d'),
                 'status' => $workOrder->invoice->status,
                 'subtotal' => $workOrder->invoice->subtotal ? (float) $workOrder->invoice->subtotal : 0.0,
                 'tax_amount' => $workOrder->invoice->tax_amount ? (float) $workOrder->invoice->tax_amount : 0.0,
                 'total_amount' => $workOrder->invoice->total_amount ? (float) $workOrder->invoice->total_amount : 0.0,
             ] : null,
            'notes' => $workOrder->notes,
        ];

                 // Get parts breakdown from the actual relationship
         $partsBreakdown = $workOrder->parts->map(function ($part) {
             return [
                 'name' => $part->name,
                 'quantity' => (int) $part->pivot->quantity,
                 'unit_price' => (float) $part->pivot->unit_price,
                 'total_price' => (float) $part->pivot->total_price,
             ];
         });

        return Inertia::render('work-orders/show', [
            'workOrder' => $workOrderDetails,
            'partsBreakdown' => $partsBreakdown->values()->all(),
        ]);
    }
} 