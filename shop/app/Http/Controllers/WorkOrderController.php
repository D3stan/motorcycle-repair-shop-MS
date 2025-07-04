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

        // TODO: Uncomment when database tables are created

        // Get user's work orders
        // $workOrders = $user->workOrders()
        //     ->with(['motorcycle', 'appointment', 'invoice'])
        //     ->orderBy('created_at', 'desc')
        //     ->get()
        //     ->map(function ($workOrder) {
        //         return [
        //             'id' => $workOrder->id,
        //             'description' => $workOrder->description,
        //             'status' => $workOrder->status,
        //             'started_at' => $workOrder->started_at?->format('Y-m-d H:i'),
        //             'completed_at' => $workOrder->completed_at?->format('Y-m-d H:i'),
        //             'labor_cost' => $workOrder->labor_cost,
        //             'parts_cost' => $workOrder->parts_cost,
        //             'total_cost' => $workOrder->total_cost,
        //             'motorcycle' => [
        //                 'id' => $workOrder->motorcycle->id,
        //                 'brand' => $workOrder->motorcycle->brand,
        //                 'model' => $workOrder->motorcycle->model,
        //                 'plate' => $workOrder->motorcycle->plate,
        //             ],
        //             'appointment' => $workOrder->appointment ? [
        //                 'id' => $workOrder->appointment->id,
        //                 'appointment_date' => $workOrder->appointment->appointment_date->format('Y-m-d'),
        //                 'type' => ucfirst(str_replace('_', ' ', $workOrder->appointment->type)),
        //             ] : null,
        //             'invoice' => $workOrder->invoice ? [
        //                 'id' => $workOrder->invoice->id,
        //                 'invoice_number' => $workOrder->invoice->invoice_number,
        //                 'status' => $workOrder->invoice->status,
        //             ] : null,
        //             'notes' => $workOrder->notes,
        //         ];
        //     });

        // Placeholder data for demo
        $workOrders = collect([
            [
                'id' => 1,
                'description' => 'Oil change and filter replacement',
                'status' => 'completed',
                'started_at' => '2024-01-05 09:00',
                'completed_at' => '2024-01-05 11:30',
                'labor_cost' => 50.00,
                'parts_cost' => 35.00,
                'total_cost' => 85.00,
                'motorcycle' => [
                    'id' => 1,
                    'brand' => 'Ducati',
                    'model' => 'Monster 821',
                    'plate' => 'AB123CD',
                ],
                'appointment' => [
                    'id' => 3,
                    'appointment_date' => '2024-01-05',
                    'type' => 'Maintenance',
                ],
                'invoice' => [
                    'id' => 1,
                    'invoice_number' => 'INV-2024-001',
                    'status' => 'paid',
                ],
                'notes' => 'Routine maintenance completed successfully',
            ],
            [
                'id' => 2,
                'description' => 'Brake system inspection and pad replacement',
                'status' => 'in_progress',
                'started_at' => '2024-01-12 10:00',
                'completed_at' => null,
                'labor_cost' => 120.00,
                'parts_cost' => 80.00,
                'total_cost' => 200.00,
                'motorcycle' => [
                    'id' => 2,
                    'brand' => 'Yamaha',
                    'model' => 'MT-07',
                    'plate' => 'EF456GH',
                ],
                'appointment' => [
                    'id' => 1,
                    'appointment_date' => '2024-01-12',
                    'type' => 'Maintenance',
                ],
                'invoice' => null,
                'notes' => 'Front brake pads worn, rear brakes in good condition',
            ],
            [
                'id' => 3,
                'description' => 'Performance tuning and ECU mapping',
                'status' => 'pending',
                'started_at' => null,
                'completed_at' => null,
                'labor_cost' => 200.00,
                'parts_cost' => 0.00,
                'total_cost' => 200.00,
                'motorcycle' => [
                    'id' => 2,
                    'brand' => 'Yamaha',
                    'model' => 'MT-07',
                    'plate' => 'EF456GH',
                ],
                'appointment' => [
                    'id' => 2,
                    'appointment_date' => '2024-01-20',
                    'type' => 'Dyno Testing',
                ],
                'invoice' => null,
                'notes' => 'Customer requested performance optimization',
            ],
        ]);

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
        // TODO: Uncomment when database tables are created
        
        // Ensure the work order belongs to the authenticated user
        // if ($workOrder->user_id !== $request->user()->id) {
        //     abort(403, 'Unauthorized action.');
        // }

        // $workOrderDetails = [
        //     'id' => $workOrder->id,
        //     'description' => $workOrder->description,
        //     'status' => $workOrder->status,
        //     'started_at' => $workOrder->started_at?->format('Y-m-d H:i'),
        //     'completed_at' => $workOrder->completed_at?->format('Y-m-d H:i'),
        //     'labor_cost' => $workOrder->labor_cost,
        //     'parts_cost' => $workOrder->parts_cost,
        //     'total_cost' => $workOrder->total_cost,
        //     'motorcycle' => [
        //         'id' => $workOrder->motorcycle->id,
        //         'brand' => $workOrder->motorcycle->brand,
        //         'model' => $workOrder->motorcycle->model,
        //         'year' => $workOrder->motorcycle->year,
        //         'plate' => $workOrder->motorcycle->plate,
        //         'vin' => $workOrder->motorcycle->vin,
        //     ],
        //     'appointment' => $workOrder->appointment ? [
        //         'id' => $workOrder->appointment->id,
        //         'appointment_date' => $workOrder->appointment->appointment_date->format('Y-m-d'),
        //         'appointment_time' => $workOrder->appointment->appointment_time->format('H:i'),
        //         'type' => ucfirst(str_replace('_', ' ', $workOrder->appointment->type)),
        //     ] : null,
        //     'invoice' => $workOrder->invoice ? [
        //         'id' => $workOrder->invoice->id,
        //         'invoice_number' => $workOrder->invoice->invoice_number,
        //         'issue_date' => $workOrder->invoice->issue_date->format('Y-m-d'),
        //         'due_date' => $workOrder->invoice->due_date->format('Y-m-d'),
        //         'status' => $workOrder->invoice->status,
        //         'subtotal' => $workOrder->invoice->subtotal,
        //         'tax_amount' => $workOrder->invoice->tax_amount,
        //         'total_amount' => $workOrder->invoice->total_amount,
        //     ] : null,
        //     'notes' => $workOrder->notes,
        // ];

        // Placeholder data for demo
        $workOrderDetails = [
            'id' => 2,
            'description' => 'Brake system inspection and pad replacement',
            'status' => 'in_progress',
            'started_at' => '2024-01-12 10:00',
            'completed_at' => null,
            'labor_cost' => 120.00,
            'parts_cost' => 80.00,
            'total_cost' => 200.00,
            'motorcycle' => [
                'id' => 2,
                'brand' => 'Yamaha',
                'model' => 'MT-07',
                'year' => 2021,
                'plate' => 'EF456GH',
                'vin' => 'JYARN23E0LA123456',
            ],
            'appointment' => [
                'id' => 1,
                'appointment_date' => '2024-01-12',
                'appointment_time' => '10:00',
                'type' => 'Maintenance',
            ],
            'invoice' => null,
            'notes' => 'Front brake pads worn, rear brakes in good condition. Customer reported squeaking noise.',
        ];

        // Get parts breakdown (placeholder)
        $partsBreakdown = collect([
            [
                'name' => 'Front brake pads',
                'quantity' => 1,
                'unit_price' => 60.00,
                'total_price' => 60.00,
            ],
            [
                'name' => 'Brake fluid',
                'quantity' => 1,
                'unit_price' => 20.00,
                'total_price' => 20.00,
            ],
        ]);

        return Inertia::render('work-orders/show', [
            'workOrder' => $workOrderDetails,
            'partsBreakdown' => $partsBreakdown->values()->all(),
        ]);
    }
} 