<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Invoice;
use App\Models\WorkOrder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Show the dashboard page.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // TODO: Uncomment when database tables are created
        
        // Get upcoming appointments
        // $upcomingAppointments = $user->appointments()
        //     ->with('motorcycle')
        //     ->where('appointment_date', '>=', now()->toDateString())
        //     ->where('status', '!=', 'cancelled')
        //     ->orderBy('appointment_date')
        //     ->orderBy('appointment_time')
        //     ->get()
        //     ->map(function ($appointment) {
        //         return [
        //             'id' => $appointment->id,
        //             'date' => $appointment->appointment_date->format('Y-m-d'),
        //             'time' => $appointment->appointment_time->format('H:i'),
        //             'type' => ucfirst(str_replace('_', ' ', $appointment->type)),
        //             'motorcycle' => $appointment->motorcycle->brand . ' ' . $appointment->motorcycle->model,
        //             'status' => $appointment->status,
        //         ];
        //     });

        // Placeholder data for demo
        $upcomingAppointments = collect([
            [
                'id' => 1,
                'date' => '2024-01-15',
                'time' => '10:00',
                'type' => 'Maintenance',
                'motorcycle' => 'Ducati Monster 821',
                'status' => 'confirmed',
            ],
            [
                'id' => 2,
                'date' => '2024-01-20',
                'time' => '14:30',
                'type' => 'Dyno Testing',
                'motorcycle' => 'Yamaha MT-07',
                'status' => 'pending',
            ],
        ]);

        // Get active work orders count
        // $activeWorkOrdersCount = $user->workOrders()
        //     ->whereIn('status', ['pending', 'in_progress'])
        //     ->count();
        $activeWorkOrdersCount = 1;

        // Get outstanding balance
        // $outstandingBalance = $user->invoices()
        //     ->where('status', '!=', 'paid')
        //     ->sum('total_amount');
        $outstandingBalance = 250.00;

        // $pendingInvoicesCount = $user->invoices()
        //     ->where('status', '!=', 'paid')
        //     ->count();
        $pendingInvoicesCount = 2;

        // Get recent activity
        // $recentActivity = collect();

        // Add recent completed work orders
        // $recentWorkOrders = $user->workOrders()
        //     ->with('motorcycle')
        //     ->where('status', 'completed')
        //     ->orderBy('completed_at', 'desc')
        //     ->limit(3)
        //     ->get();

        // foreach ($recentWorkOrders as $workOrder) {
        //     $recentActivity->push([
        //         'id' => $workOrder->id,
        //         'action' => 'Work order completed',
        //         'description' => $workOrder->description . ' for ' . $workOrder->motorcycle->brand . ' ' . $workOrder->motorcycle->model,
        //         'date' => $workOrder->completed_at->format('Y-m-d'),
        //         'amount' => '€' . number_format($workOrder->total_cost, 2),
        //     ]);
        // }

        // Add recent invoices
        // $recentInvoices = $user->invoices()
        //     ->orderBy('created_at', 'desc')
        //     ->limit(2)
        //     ->get();

        // foreach ($recentInvoices as $invoice) {
        //     $recentActivity->push([
        //         'id' => $invoice->id,
        //         'action' => 'Invoice generated',
        //         'description' => 'Invoice #' . $invoice->invoice_number,
        //         'date' => $invoice->issue_date->format('Y-m-d'),
        //         'amount' => '€' . number_format($invoice->total_amount, 2),
        //     ]);
        // }

        // Add recent appointments
        // $recentAppointments = $user->appointments()
        //     ->with('motorcycle')
        //     ->where('created_at', '>=', now()->subDays(7))
        //     ->orderBy('created_at', 'desc')
        //     ->limit(2)
        //     ->get();

        // foreach ($recentAppointments as $appointment) {
        //     $recentActivity->push([
        //         'id' => $appointment->id,
        //         'action' => 'Appointment booked',
        //         'description' => ucfirst(str_replace('_', ' ', $appointment->type)) . ' for ' . $appointment->motorcycle->brand . ' ' . $appointment->motorcycle->model,
        //         'date' => $appointment->created_at->format('Y-m-d'),
        //         'amount' => null,
        //     ]);
        // }

        // Sort by date descending and limit to 5 items
        // $recentActivity = $recentActivity->sortByDesc('date')->take(5)->values();

        // Placeholder data for demo
        $recentActivity = collect([
            [
                'id' => 1,
                'action' => 'Work order completed',
                'description' => 'Oil change for Ducati Monster 821',
                'date' => '2024-01-10',
                'amount' => '€85.00',
            ],
            [
                'id' => 2,
                'action' => 'Invoice generated',
                'description' => 'Invoice #INV-2024-001',
                'date' => '2024-01-10',
                'amount' => '€85.00',
            ],
            [
                'id' => 3,
                'action' => 'Appointment booked',
                'description' => 'Maintenance for Yamaha MT-07',
                'date' => '2024-01-08',
                'amount' => null,
            ],
        ]);

        return Inertia::render('dashboard', [
            'upcomingAppointments' => $upcomingAppointments,
            'activeWorkOrdersCount' => $activeWorkOrdersCount,
            'outstandingBalance' => $outstandingBalance,
            'pendingInvoicesCount' => $pendingInvoicesCount,
            'recentActivity' => $recentActivity,
        ]);
    }
} 