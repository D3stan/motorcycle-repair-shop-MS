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
        // Get upcoming appointments (simplified schema - no motorcycle link, no status)
        $upcomingAppointments = $user->appointments()
            ->where('DataAppuntamento', '>=', now()->toDateString())
            ->orderBy('DataAppuntamento')
            ->get()
            ->map(function ($appointment) {
                return [
                    'id' => $appointment->CodiceAppuntamento,
                    'date' => $appointment->DataAppuntamento->format('Y-m-d'),
                    'type' => ucfirst(str_replace('_', ' ', $appointment->Tipo)),
                    'description' => $appointment->Descrizione,
                    'status' => 'scheduled', // All appointments considered scheduled in simplified schema
                ];
            });

        // Get active work orders count (DataInizio not null, DataFine null)
        $activeWorkOrdersCount = $user->workOrders()
            ->whereNotNull('DataInizio')
            ->whereNull('DataFine')
            ->count();

        // Outstanding balance and pending invoices not tracked in simplified schema
        $outstandingBalance = 0;
        $pendingInvoicesCount = 0;

        // Get recent activity
        $recentActivity = collect();

        // Add recent completed work orders (via user's motorcycles)
        $user->motorcycles->each(function ($motorcycle) use ($recentActivity) {
            $motorcycle->workOrders
                ->whereNotNull('DataFine')
                ->sortByDesc('DataFine')
                ->take(3)
                ->each(function ($workOrder) use ($recentActivity, $motorcycle) {
                    $recentActivity->push([
                        'id' => $workOrder->CodiceIntervento,
                        'action' => 'Work order completed',
                        'description' => $workOrder->Note . ' for ' . $motorcycle->Targa,
                        'date' => $workOrder->DataFine?->format('Y-m-d') ?? 'N/A',
                        'amount' => null, // Cost calculation removed from work orders
                    ]);
                });
        });

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
                'date' => $invoice->Data->format('Y-m-d'),
                'amount' => '€' . number_format($invoice->Importo, 2),
            ]);
        }

        // Add recent appointments (simplified - no motorcycle link)
        $recentAppointments = $user->appointments()
            ->where('created_at', '>=', now()->subDays(7))
            ->orderBy('created_at', 'desc')
            ->limit(2)
            ->get();

        foreach ($recentAppointments as $appointment) {
            $recentActivity->push([
                'id' => $appointment->CodiceAppuntamento,
                'action' => 'Appointment booked',
                'description' => ucfirst(str_replace('_', ' ', $appointment->Tipo)) . ': ' . $appointment->Descrizione,
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
        // Current revenue (this month) - using Data field
        $currentMonthRevenue = Invoice::whereMonth('Data', now()->month)
            ->whereYear('Data', now()->year)
            ->sum('Importo');

        // Active work orders count (use Stato column)
        $activeWorkOrdersCount = WorkOrder::whereIn('Stato', ['pending', 'in_progress'])->count();

        // Future appointments count (since no status field in schema)
        $pendingAppointmentsCount = Appointment::where('DataAppuntamento', '>=', now()->toDateString())->count();

        // Total customers count
        $totalCustomersCount = User::where('type', 'customer')->count();

        // Recent work orders
        $recentWorkOrders = WorkOrder::with(['motorcycle.user', 'motorcycle.motorcycleModel', 'mechanics'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($workOrder) {
                return [
                    'id' => $workOrder->CodiceIntervento,
                    'customer' => $workOrder->motorcycle->user->first_name . ' ' . $workOrder->motorcycle->user->last_name,
                    'motorcycle' => $workOrder->motorcycle->motorcycleModel->Marca . ' ' . $workOrder->motorcycle->motorcycleModel->Nome,
                    'description' => $workOrder->Note,
                    'status' => $workOrder->Stato,
                    'created_at' => $workOrder->created_at->format('Y-m-d H:i'),
                    'mechanics' => $workOrder->mechanics->pluck('first_name')->implode(', '),
                ];
            });

        // Recent appointments (simplified schema)
        $recentAppointments = Appointment::with(['user'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($appointment) {
                return [
                    'id' => $appointment->CodiceAppuntamento,
                    'customer' => $appointment->user->first_name . ' ' . $appointment->user->last_name,
                    'description' => $appointment->Descrizione,
                    'type' => ucfirst(str_replace('_', ' ', $appointment->Tipo)),
                    'appointment_date' => $appointment->DataAppuntamento->format('Y-m-d'),
                    'status' => 'scheduled', // Simplified status
                ];
            });

        // Work orders by status (use Stato column)
        $totalWorkOrders = WorkOrder::count();
        $pendingWorkOrders = WorkOrder::where('Stato', 'pending')->count();
        $inProgressWorkOrders = WorkOrder::where('Stato', 'in_progress')->count();
        $completedWorkOrders = WorkOrder::where('Stato', 'completed')->count();

        $workOrdersByStatus = [
            'pending' => $pendingWorkOrders,
            'in_progress' => $inProgressWorkOrders,
            'completed' => $completedWorkOrders,
        ];

        // Monthly revenue data (last 6 months)
        $monthlyRevenue = collect();
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $revenue = Invoice::whereMonth('Data', $date->month)
                ->whereYear('Data', $date->year)
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
            ->with(['motorcycle.motorcycleModel', 'motorcycle.user'])
            ->whereIn('Stato', ['pending', 'in_progress'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($workOrder) {
                return [
                    'id' => $workOrder->CodiceIntervento,
                    'customer' => $workOrder->motorcycle->user->first_name . ' ' . $workOrder->motorcycle->user->last_name,
                    'motorcycle' => $workOrder->motorcycle->motorcycleModel->Marca . ' ' . $workOrder->motorcycle->motorcycleModel->Nome,
                    'description' => $workOrder->Note,
                    'status' => $workOrder->Stato,
                    'created_at' => $workOrder->created_at->format('Y-m-d'),
                ];
            });

        // Get completed work orders count (this month)
        $completedThisMonth = $user->assignedWorkOrders()
            ->where('Stato', 'completed')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        // Get active work sessions
        $activeWorkSessions = $user->workSessions()
            ->with(['motorcycle.motorcycleModel'])
            ->get()
            ->map(function ($session) {
                return [
                    'id' => $session->CodiceSessione,
                    'motorcycle' => $session->motorcycle->motorcycleModel->Marca . ' ' . $session->motorcycle->motorcycleModel->Nome,
                    'date' => $session->Data->format('Y-m-d'),
                    'hours_worked' => $session->OreImpiegate,
                ];
            });

        // Get recent completed work orders
        $recentCompletedOrders = $user->assignedWorkOrders()
            ->with(['motorcycle.motorcycleModel', 'motorcycle.user'])
            ->whereNotNull('DataFine')
            ->orderBy('DataFine', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($workOrder) {
                return [
                    'id' => $workOrder->CodiceIntervento,
                    'customer' => $workOrder->motorcycle->user->first_name . ' ' . $workOrder->motorcycle->user->last_name,
                    'motorcycle' => $workOrder->motorcycle->motorcycleModel->Marca . ' ' . $workOrder->motorcycle->motorcycleModel->Nome,
                    'description' => $workOrder->Note,
                    'completed_at' => $workOrder->DataFine?->format('Y-m-d') ?? 'N/A',
                    'hours_worked' => $workOrder->OreImpiegate,
                ];
            });

        // Calculate hours worked this week
        $hoursWorkedThisWeek = $user->workSessions()
            ->whereBetween('Data', [now()->startOfWeek(), now()->endOfWeek()])
            ->sum('OreImpiegate');

        // Today's schedule simplified - show work orders for today (no appointment link in schema)
        $todaySchedule = $user->assignedWorkOrders()
            ->with(['motorcycle.motorcycleModel', 'motorcycle.user'])
            ->whereDate('created_at', now()->toDateString())
            ->get()
            ->map(function ($workOrder) {
                return [
                    'id' => $workOrder->CodiceIntervento,
                    'customer' => $workOrder->motorcycle->user->first_name . ' ' . $workOrder->motorcycle->user->last_name,
                    'motorcycle' => $workOrder->motorcycle->motorcycleModel->Marca . ' ' . $workOrder->motorcycle->motorcycleModel->Nome,
                    'description' => $workOrder->Note,
                    'status' => $workOrder->Stato,
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