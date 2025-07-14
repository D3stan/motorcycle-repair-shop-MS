<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Invoice;
use App\Models\WorkOrder;
use App\Models\WorkSession;
use App\Models\User;
use App\Models\Motorcycle;
use App\Models\Part;
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

        // Active work orders and sessions count (use Stato column)
        $activeWorkOrdersCount = WorkOrder::whereIn('Stato', ['pending', 'in_progress'])->count();
        $activeWorkSessionsCount = WorkSession::whereIn('Stato', ['pending', 'in_progress'])->count();
        $totalActiveWork = $activeWorkOrdersCount + $activeWorkSessionsCount;

        // Future appointments count (since no status field in schema)
        $pendingAppointmentsCount = Appointment::where('DataAppuntamento', '>=', now()->toDateString())->count();

        // Total customers count
        $totalCustomersCount = User::where('type', 'customer')->count();

        // Recent work orders and sessions combined
        $recentWorkOrders = collect();
        
        // Get recent work orders
        WorkOrder::with(['motorcycle.user', 'motorcycle.motorcycleModel', 'mechanics'])
            ->orderBy('created_at', 'desc')
            ->limit(3)
            ->get()
            ->each(function ($workOrder) use ($recentWorkOrders) {
                $recentWorkOrders->push([
                    'id' => $workOrder->CodiceIntervento,
                    'type' => 'maintenance',
                    'customer' => $workOrder->motorcycle->user->first_name . ' ' . $workOrder->motorcycle->user->last_name,
                    'motorcycle' => $workOrder->motorcycle->motorcycleModel->Marca . ' ' . $workOrder->motorcycle->motorcycleModel->Nome,
                    'description' => $workOrder->Note,
                    'status' => $workOrder->Stato,
                    'created_at' => $workOrder->created_at,
                    'formatted_date' => $workOrder->created_at->format('Y-m-d H:i'),
                    'mechanics' => $workOrder->mechanics->pluck('first_name')->implode(', '),
                ]);
            });
            
        // Get recent work sessions
        WorkSession::with(['motorcycle.user', 'motorcycle.motorcycleModel', 'mechanics'])
            ->orderBy('created_at', 'desc')
            ->limit(3)
            ->get()
            ->each(function ($workSession) use ($recentWorkOrders) {
                $recentWorkOrders->push([
                    'id' => $workSession->CodiceSessione,
                    'type' => 'session',
                    'customer' => $workSession->motorcycle->user->first_name . ' ' . $workSession->motorcycle->user->last_name,
                    'motorcycle' => $workSession->motorcycle->motorcycleModel->Marca . ' ' . $workSession->motorcycle->motorcycleModel->Nome,
                    'description' => $workSession->Note ?? 'Work session',
                    'status' => $workSession->Stato,
                    'created_at' => $workSession->created_at,
                    'formatted_date' => $workSession->created_at->format('Y-m-d H:i'),
                    'mechanics' => $workSession->mechanics->pluck('first_name')->implode(', '),
                ]);
            });
            
        // Sort by creation date and take top 5
        $recentWorkOrders = $recentWorkOrders->sortByDesc('created_at')->take(5)->values()->map(function ($item) {
            unset($item['created_at']); // Remove the Carbon object, keep formatted_date
            return $item;
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

        // Work orders and sessions by status (use Stato column)
        $totalWorkOrders = WorkOrder::count();
        $totalWorkSessions = WorkSession::count();
        
        $pendingWorkOrders = WorkOrder::where('Stato', 'pending')->count();
        $pendingWorkSessions = WorkSession::where('Stato', 'pending')->count();
        
        $inProgressWorkOrders = WorkOrder::where('Stato', 'in_progress')->count();
        $inProgressWorkSessions = WorkSession::where('Stato', 'in_progress')->count();
        
        $completedWorkOrders = WorkOrder::where('Stato', 'completed')->count();
        $completedWorkSessions = WorkSession::where('Stato', 'completed')->count();

        $workOrdersByStatus = [
            'pending' => $pendingWorkOrders + $pendingWorkSessions,
            'in_progress' => $inProgressWorkOrders + $inProgressWorkSessions,
            'completed' => $completedWorkOrders + $completedWorkSessions,
        ];
        
        $totalWork = $totalWorkOrders + $totalWorkSessions;

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
            'activeWorkOrdersCount' => $totalActiveWork,
            'pendingAppointmentsCount' => $pendingAppointmentsCount,
            'totalCustomersCount' => $totalCustomersCount,
            'recentWorkOrders' => $recentWorkOrders,
            'recentAppointments' => $recentAppointments,
            'workOrdersByStatus' => $workOrdersByStatus,
            'monthlyRevenue' => $monthlyRevenue,
            'lowStockParts' => $lowStockParts,
            'totalWork' => $totalWork,
            'totalWorkOrders' => $totalWorkOrders,
            'totalWorkSessions' => $totalWorkSessions,
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
            ->orderBy('INTERVENTI.created_at', 'desc')
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
            ->whereMonth('INTERVENTI.created_at', now()->month)
            ->whereYear('INTERVENTI.created_at', now()->year)
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
            ->whereDate('INTERVENTI.created_at', now()->toDateString())
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