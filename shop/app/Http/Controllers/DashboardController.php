<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Invoice;
use App\Models\WorkOrder;
use App\Models\User;
use App\Models\Motorcycle;
use App\Models\Part;
use App\Models\Status;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Show the dashboard page with role-based data.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Determine dashboard content based on user role
        if ($user->isAdmin()) {
            return $this->adminDashboard($user);
        } elseif ($user->isMechanic()) {
            return $this->mechanicDashboard($user);
        } else {
            return $this->customerDashboard($user);
        }
    }

    /**
     * Generate customer dashboard data.
     */
    private function customerDashboard(User $user): Response
    {
        // Get upcoming appointments
        $upcomingAppointments = $user->appointments()
            ->with(['motorcycle.motorcycleModel'])
            ->where('appointment_date', '>=', now()->toDateString())
            ->where('status', '!=', 'cancelled')
            ->orderBy('appointment_date')
            ->orderBy('appointment_time')
            ->get()
            ->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'date' => $appointment->appointment_date->format('Y-m-d'),
                    'time' => $appointment->appointment_time,
                    'type' => ucfirst(str_replace('_', ' ', $appointment->type)),
                    'motorcycle' => $appointment->motorcycle->motorcycleModel->brand . ' ' . $appointment->motorcycle->motorcycleModel->name,
                    'status' => $appointment->status,
                ];
            });

        // Get active work orders count
        $activeWorkOrdersCount = $user->workOrders()
            ->whereIn('status', ['pending', 'in_progress'])
            ->count();

        // Get outstanding balance
        $outstandingBalance = $user->invoices()
            ->where('status', '!=', 'paid')
            ->sum('total_amount');

        // Get pending invoices count
        $pendingInvoicesCount = $user->invoices()
            ->where('status', '!=', 'paid')
            ->count();

        // Get recent activity
        $recentActivity = collect();

        // Add recent completed work orders
        $recentWorkOrders = $user->workOrders()
            ->with(['motorcycle.motorcycleModel'])
            ->where('status', 'completed')
            ->orderBy('completed_at', 'desc')
            ->limit(3)
            ->get();

        foreach ($recentWorkOrders as $workOrder) {
            $recentActivity->push([
                'id' => $workOrder->id,
                'action' => 'Work order completed',
                'description' => $workOrder->description . ' for ' . $workOrder->motorcycle->motorcycleModel->brand . ' ' . $workOrder->motorcycle->motorcycleModel->name,
                'date' => $workOrder->completed_at->format('Y-m-d'),
                'amount' => '€' . number_format($workOrder->total_cost, 2),
            ]);
        }

        // Add recent invoices
        $recentInvoices = $user->invoices()
            ->orderBy('created_at', 'desc')
            ->limit(2)
            ->get();

        foreach ($recentInvoices as $invoice) {
            $recentActivity->push([
                'id' => $invoice->id,
                'action' => 'Invoice generated',
                'description' => 'Invoice #' . $invoice->invoice_number,
                'date' => $invoice->issue_date->format('Y-m-d'),
                'amount' => '€' . number_format($invoice->total_amount, 2),
            ]);
        }

        // Add recent appointments
        $recentAppointments = $user->appointments()
            ->with(['motorcycle.motorcycleModel'])
            ->where('created_at', '>=', now()->subDays(7))
            ->orderBy('created_at', 'desc')
            ->limit(2)
            ->get();

        foreach ($recentAppointments as $appointment) {
            $recentActivity->push([
                'id' => $appointment->id,
                'action' => 'Appointment booked',
                'description' => ucfirst(str_replace('_', ' ', $appointment->type)) . ' for ' . $appointment->motorcycle->motorcycleModel->brand . ' ' . $appointment->motorcycle->motorcycleModel->name,
                'date' => $appointment->created_at->format('Y-m-d'),
                'amount' => null,
            ]);
        }

        // Sort by date descending and limit to 5 items
        $recentActivity = $recentActivity->sortByDesc('date')->take(5)->values();

        // Get motorcycles count for quick stats
        $motorcyclesCount = $user->motorcycles()->count();

        return Inertia::render('dashboard', [
            'userType' => 'customer',
            'upcomingAppointments' => $upcomingAppointments,
            'activeWorkOrdersCount' => $activeWorkOrdersCount,
            'outstandingBalance' => $outstandingBalance,
            'pendingInvoicesCount' => $pendingInvoicesCount,
            'recentActivity' => $recentActivity,
            'motorcyclesCount' => $motorcyclesCount,
        ]);
    }

    /**
     * Generate admin dashboard data.
     */
    private function adminDashboard(User $user): Response
    {
        // Current revenue (this month)
        $currentMonthRevenue = Invoice::where('status', 'paid')
            ->whereMonth('paid_at', now()->month)
            ->whereYear('paid_at', now()->year)
            ->sum('total_amount');

        // Active work orders count
        $activeWorkOrdersCount = WorkOrder::whereIn('status', ['pending', 'in_progress'])->count();

        // Pending appointments count
        $pendingAppointmentsCount = Appointment::where('status', 'pending')->count();

        // Total customers count
        $totalCustomersCount = User::where('type', 'customer')->count();

        // Recent work orders
        $recentWorkOrders = WorkOrder::with(['user', 'motorcycle.motorcycleModel', 'mechanics'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($workOrder) {
                return [
                    'id' => $workOrder->id,
                    'customer' => $workOrder->user->full_name,
                    'motorcycle' => $workOrder->motorcycle->motorcycleModel->brand . ' ' . $workOrder->motorcycle->motorcycleModel->name,
                    'description' => $workOrder->description,
                    'status' => $workOrder->status,
                    'created_at' => $workOrder->created_at->format('Y-m-d H:i'),
                    'mechanics' => $workOrder->mechanics->pluck('first_name')->implode(', '),
                ];
            });

        // Recent appointments
        $recentAppointments = Appointment::with(['user', 'motorcycle.motorcycleModel'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'customer' => $appointment->user->full_name,
                    'motorcycle' => $appointment->motorcycle->motorcycleModel->brand . ' ' . $appointment->motorcycle->motorcycleModel->name,
                    'type' => ucfirst(str_replace('_', ' ', $appointment->type)),
                    'appointment_date' => $appointment->appointment_date->format('Y-m-d'),
                    'appointment_time' => $appointment->appointment_time,
                    'status' => $appointment->status,
                ];
            });

        // Work orders by status
        $workOrdersByStatus = WorkOrder::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->status => $item->count];
            });

        // Monthly revenue data (last 6 months)
        $monthlyRevenue = collect();
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $revenue = Invoice::where('status', 'paid')
                ->whereMonth('paid_at', $date->month)
                ->whereYear('paid_at', $date->year)
                ->sum('total_amount');
            
            $monthlyRevenue->push([
                'month' => $date->format('M Y'),
                'revenue' => $revenue,
            ]);
        }

        // Low stock parts alert
        $lowStockParts = Part::whereColumn('stock_quantity', '<=', 'minimum_stock')
            ->with('supplier')
            ->limit(5)
            ->get()
            ->map(function ($part) {
                return [
                    'id' => $part->id,
                    'name' => $part->name,
                    'current_stock' => $part->stock_quantity,
                    'minimum_stock' => $part->minimum_stock,
                    'supplier' => $part->supplier->name,
                ];
            });

        return Inertia::render('admin/dashboard', [
            'userType' => 'admin',
            'currentMonthRevenue' => $currentMonthRevenue,
            'activeWorkOrdersCount' => $activeWorkOrdersCount,
            'pendingAppointmentsCount' => $pendingAppointmentsCount,
            'totalCustomersCount' => $totalCustomersCount,
            'recentWorkOrders' => $recentWorkOrders,
            'recentAppointments' => $recentAppointments,
            'workOrdersByStatus' => $workOrdersByStatus,
            'monthlyRevenue' => $monthlyRevenue,
            'lowStockParts' => $lowStockParts,
        ]);
    }

    /**
     * Generate mechanic dashboard data.
     */
    private function mechanicDashboard(User $user): Response
    {
        // Get assigned work orders
        $assignedWorkOrders = $user->assignedWorkOrders()
            ->with(['motorcycle.motorcycleModel', 'user'])
            ->whereIn('status', ['pending', 'in_progress'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($workOrder) {
                                 return [
                     'id' => $workOrder->id,
                     'customer' => $workOrder->user->full_name,
                     'motorcycle' => $workOrder->motorcycle->motorcycleModel->brand . ' ' . $workOrder->motorcycle->motorcycleModel->name,
                     'description' => $workOrder->description,
                     'status' => $workOrder->status,
                     'created_at' => $workOrder->created_at->format('Y-m-d'),
                 ];
            });

        // Get completed work orders count (this month)
        $completedThisMonth = $user->assignedWorkOrders()
            ->where('status', 'completed')
            ->whereMonth('completed_at', now()->month)
            ->whereYear('completed_at', now()->year)
            ->count();

        // Get active work sessions
        $activeWorkSessions = $user->workSessions()
            ->with(['motorcycle.motorcycleModel'])
            ->whereNull('end_time')
            ->get()
            ->map(function ($session) {
                return [
                    'id' => $session->id,
                    'motorcycle' => $session->motorcycle->motorcycleModel->brand . ' ' . $session->motorcycle->motorcycleModel->name,
                    'start_time' => $session->start_time->format('Y-m-d H:i'),
                    'session_type' => $session->session_type,
                ];
            });

        // Get recent completed work orders
        $recentCompletedOrders = $user->assignedWorkOrders()
            ->with(['motorcycle.motorcycleModel', 'user'])
            ->where('status', 'completed')
            ->orderBy('completed_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($workOrder) {
                return [
                    'id' => $workOrder->id,
                    'customer' => $workOrder->user->full_name,
                    'motorcycle' => $workOrder->motorcycle->motorcycleModel->brand . ' ' . $workOrder->motorcycle->motorcycleModel->name,
                    'description' => $workOrder->description,
                    'completed_at' => $workOrder->completed_at->format('Y-m-d'),
                    'labor_cost' => $workOrder->labor_cost,
                ];
            });

        // Calculate hours worked this week
        $hoursWorkedThisWeek = $user->workSessions()
            ->whereBetween('start_time', [now()->startOfWeek(), now()->endOfWeek()])
            ->whereNotNull('end_time')
            ->sum('hours_worked');

        // Today's appointments where mechanic is assigned to related work orders
        $todaySchedule = $user->assignedWorkOrders()
            ->with(['appointment.motorcycle.motorcycleModel', 'appointment.user'])
            ->whereHas('appointment', function ($query) {
                $query->where('appointment_date', now()->toDateString());
            })
            ->get()
            ->filter(function ($workOrder) {
                return $workOrder->appointment !== null;
            })
            ->map(function ($workOrder) {
                return [
                    'id' => $workOrder->appointment->id,
                    'customer' => $workOrder->appointment->user->full_name,
                    'motorcycle' => $workOrder->appointment->motorcycle->motorcycleModel->brand . ' ' . $workOrder->appointment->motorcycle->motorcycleModel->name,
                    'type' => ucfirst(str_replace('_', ' ', $workOrder->appointment->type)),
                    'time' => $workOrder->appointment->appointment_time,
                    'status' => $workOrder->appointment->status,
                ];
            });

        return Inertia::render('mechanic/dashboard', [
            'userType' => 'mechanic',
            'assignedWorkOrders' => $assignedWorkOrders,
            'completedThisMonth' => $completedThisMonth,
            'activeWorkSessions' => $activeWorkSessions,
            'recentCompletedOrders' => $recentCompletedOrders,
            'hoursWorkedThisWeek' => $hoursWorkedThisWeek,
            'todaySchedule' => $todaySchedule,
        ]);
    }
} 