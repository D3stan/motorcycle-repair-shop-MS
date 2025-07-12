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
            ->where('DataAppuntamento', '>=', now()->toDateString())
            ->where('Stato', '!=', 'cancelled')
            ->orderBy('DataAppuntamento')
            ->orderBy('Ora')
            ->get()
            ->map(function ($appointment) {
                return [
                    'id' => $appointment->CodiceAppuntamento,
                    'date' => $appointment->DataAppuntamento->format('Y-m-d'),
                    'time' => $appointment->Ora instanceof \DateTime ? $appointment->Ora->format('H:i') : substr($appointment->Ora, 0, 5),
                    'type' => ucfirst(str_replace('_', ' ', $appointment->Tipo)),
                    'motorcycle' => $appointment->motorcycle->motorcycleModel->Marca . ' ' . $appointment->motorcycle->motorcycleModel->Nome,
                    'status' => $appointment->Stato,
                ];
            });

        // Get active work orders count (DataInizio not null, DataFine null)
        $activeWorkOrdersCount = $user->workOrders()
            ->whereNotNull('DataInizio')
            ->whereNull('DataFine')
            ->count();

        // Get outstanding balance
        $outstandingBalance = $user->invoices()
            ->where('Stato', '!=', 'paid')
            ->sum('Importo');

        // Get pending invoices count
        $pendingInvoicesCount = $user->invoices()
            ->where('Stato', '!=', 'paid')
            ->count();

        // Get recent activity
        $recentActivity = collect();

        // Add recent completed work orders
        $recentWorkOrders = $user->workOrders()
            ->with(['motorcycle.motorcycleModel'])
            ->whereNotNull('DataFine')
            ->orderBy('DataFine', 'desc')
            ->limit(3)
            ->get();

        foreach ($recentWorkOrders as $workOrder) {
            $recentActivity->push([
                'id' => $workOrder->CodiceIntervento,
                'action' => 'Work order completed',
                'description' => $workOrder->Note . ' for ' . $workOrder->motorcycle->motorcycleModel->Marca . ' ' . $workOrder->motorcycle->motorcycleModel->Nome,
                'date' => $workOrder->DataFine->format('Y-m-d'),
                'amount' => null, // Cost calculation removed from work orders
            ]);
        }

        // Add recent invoices
        $recentInvoices = $user->invoices()
            ->orderBy('created_at', 'desc')
            ->limit(2)
            ->get();

        foreach ($recentInvoices as $invoice) {
            $recentActivity->push([
                'id' => $invoice->CodiceFattura,
                'action' => 'Invoice generated',
                'description' => 'Invoice #' . $invoice->CodiceFattura,
                'date' => $invoice->DataEmissione->format('Y-m-d'),
                'amount' => '€' . number_format($invoice->Importo, 2),
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
                'id' => $appointment->CodiceAppuntamento,
                'action' => 'Appointment booked',
                'description' => ucfirst(str_replace('_', ' ', $appointment->Tipo)) . ' for ' . $appointment->motorcycle->motorcycleModel->Marca . ' ' . $appointment->motorcycle->motorcycleModel->Nome,
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
        $currentMonthRevenue = Invoice::where('Stato', 'paid')
            ->whereMonth('DataPagamento', now()->month)
            ->whereYear('DataPagamento', now()->year)
            ->sum('Importo');

        // Active work orders count (DataInizio not null, DataFine null)
        $activeWorkOrdersCount = WorkOrder::whereNotNull('DataInizio')
            ->whereNull('DataFine')
            ->count();

        // Pending appointments count
        $pendingAppointmentsCount = Appointment::where('Stato', 'pending')->count();

        // Total customers count
        $totalCustomersCount = User::where('type', 'customer')->count();

        // Recent work orders
        $recentWorkOrders = WorkOrder::with(['user', 'motorcycle.motorcycleModel', 'mechanics'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($workOrder) {
                return [
                    'id' => $workOrder->CodiceIntervento,
                    'customer' => $workOrder->user->full_name,
                    'motorcycle' => $workOrder->motorcycle->motorcycleModel->Marca . ' ' . $workOrder->motorcycle->motorcycleModel->Nome,
                    'description' => $workOrder->Note,
                    'status' => $workOrder->DataFine ? 'completed' : ($workOrder->DataInizio ? 'in_progress' : 'pending'),
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
                    'id' => $appointment->CodiceAppuntamento,
                    'customer' => $appointment->user->full_name,
                    'motorcycle' => $appointment->motorcycle->motorcycleModel->Marca . ' ' . $appointment->motorcycle->motorcycleModel->Nome,
                    'type' => ucfirst(str_replace('_', ' ', $appointment->Tipo)),
                    'appointment_date' => $appointment->DataAppuntamento->format('Y-m-d'),
                    'appointment_time' => $appointment->Ora instanceof \DateTime ? $appointment->Ora->format('H:i') : $appointment->Ora,
                    'status' => $appointment->Stato,
                ];
            });

        // Work orders by status (derive status from DataInizio/DataFine)
        $totalWorkOrders = WorkOrder::count();
        $pendingWorkOrders = WorkOrder::whereNull('DataInizio')->count();
        $inProgressWorkOrders = WorkOrder::whereNotNull('DataInizio')->whereNull('DataFine')->count();
        $completedWorkOrders = WorkOrder::whereNotNull('DataFine')->count();

        $workOrdersByStatus = [
            'pending' => $pendingWorkOrders,
            'in_progress' => $inProgressWorkOrders,
            'completed' => $completedWorkOrders,
        ];

        // Monthly revenue data (last 6 months)
        $monthlyRevenue = collect();
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $revenue = Invoice::where('Stato', 'paid')
                ->whereMonth('DataPagamento', $date->month)
                ->whereYear('DataPagamento', $date->year)
                ->sum('Importo');
            
            $monthlyRevenue->push([
                'month' => $date->format('M Y'),
                'revenue' => $revenue,
            ]);
        }

        // Note: Low stock parts feature removed as we simplified the parts schema
        $lowStockParts = collect();

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
            ->whereNotNull('DataInizio')
            ->whereNull('DataFine')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($workOrder) {
                return [
                    'id' => $workOrder->CodiceIntervento,
                    'customer' => $workOrder->user->full_name,
                    'motorcycle' => $workOrder->motorcycle->motorcycleModel->Marca . ' ' . $workOrder->motorcycle->motorcycleModel->Nome,
                    'description' => $workOrder->Note,
                    'status' => $workOrder->DataFine ? 'completed' : ($workOrder->DataInizio ? 'in_progress' : 'pending'),
                    'created_at' => $workOrder->created_at->format('Y-m-d'),
                ];
            });

        // Get completed work orders count (this month)
        $completedThisMonth = $user->assignedWorkOrders()
            ->whereNotNull('DataFine')
            ->whereMonth('DataFine', now()->month)
            ->whereYear('DataFine', now()->year)
            ->count();

        // Get active work sessions
        $activeWorkSessions = $user->workSessions()
            ->with(['motorcycle.motorcycleModel'])
            ->get()
            ->map(function ($session) {
                return [
                    'id' => $session->CodiceSessione,
                    'motorcycle' => $session->motorcycle->motorcycleModel->Marca . ' ' . $session->motorcycle->motorcycleModel->Nome,
                    'start_time' => $session->DataInizio->format('Y-m-d H:i'),
                    'hours_worked' => $session->OreImpiegate,
                ];
            });

        // Get recent completed work orders
        $recentCompletedOrders = $user->assignedWorkOrders()
            ->with(['motorcycle.motorcycleModel', 'user'])
            ->whereNotNull('DataFine')
            ->orderBy('DataFine', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($workOrder) {
                return [
                    'id' => $workOrder->CodiceIntervento,
                    'customer' => $workOrder->user->full_name,
                    'motorcycle' => $workOrder->motorcycle->motorcycleModel->Marca . ' ' . $workOrder->motorcycle->motorcycleModel->Nome,
                    'description' => $workOrder->Note,
                    'completed_at' => $workOrder->DataFine->format('Y-m-d'),
                    'hours_worked' => $workOrder->OreImpiegate,
                ];
            });

        // Calculate hours worked this week
        $hoursWorkedThisWeek = $user->workSessions()
            ->whereBetween('DataInizio', [now()->startOfWeek(), now()->endOfWeek()])
            ->sum('OreImpiegate');

        // Today's appointments where mechanic is assigned to related work orders
        $todaySchedule = $user->assignedWorkOrders()
            ->with(['appointment.motorcycle.motorcycleModel', 'appointment.user'])
            ->whereHas('appointment', function ($query) {
                $query->where('DataAppuntamento', now()->toDateString());
            })
            ->get()
            ->filter(function ($workOrder) {
                return $workOrder->appointment !== null;
            })
            ->map(function ($workOrder) {
                return [
                    'id' => $workOrder->appointment->CodiceAppuntamento,
                    'customer' => $workOrder->appointment->user->full_name,
                    'motorcycle' => $workOrder->appointment->motorcycle->motorcycleModel->Marca . ' ' . $workOrder->appointment->motorcycle->motorcycleModel->Nome,
                    'type' => ucfirst(str_replace('_', ' ', $workOrder->appointment->Tipo)),
                    'time' => $workOrder->appointment->Ora instanceof \DateTime ? $workOrder->appointment->Ora->format('H:i') : $workOrder->appointment->Ora,
                    'status' => $workOrder->appointment->Stato,
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