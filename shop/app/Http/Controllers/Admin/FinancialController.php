<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\WorkOrder;
use App\Models\WorkSession;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class FinancialController extends Controller
{
    /**
     * Display the financial dashboard with revenue analytics and invoice management.
     */
    public function index(Request $request): Response
    {
        // Revenue Analytics
        $currentMonth = now()->startOfMonth();
        $previousMonth = now()->subMonth()->startOfMonth();
        
        // Current month revenue
        $currentMonthRevenue = Invoice::whereMonth('Data', $currentMonth->month)
            ->whereYear('Data', $currentMonth->year)
            ->sum('Importo');
            
        // Previous month revenue for comparison
        $previousMonthRevenue = Invoice::whereMonth('Data', $previousMonth->month)
            ->whereYear('Data', $previousMonth->year)
            ->sum('Importo');
            
        // Revenue growth percentage
        $revenueGrowth = $previousMonthRevenue > 0 
            ? (($currentMonthRevenue - $previousMonthRevenue) / $previousMonthRevenue) * 100 
            : 0;
            
        // Monthly revenue for last 12 months
        $monthlyRevenue = collect(range(11, 0))->map(function ($monthsBack) {
            $date = now()->subMonths($monthsBack);
            $revenue = Invoice::whereMonth('Data', $date->month)
                ->whereYear('Data', $date->year)
                ->sum('Importo');
                
            return [
                'month' => $date->format('M Y'),
                'revenue' => (float) $revenue,
            ];
        });
        
        // Invoice statistics (simplified for schema)
        $totalInvoices = Invoice::count();
        $paidInvoices = Invoice::count(); // All invoices considered paid in simplified schema
        $pendingInvoices = 0;
        $overdueInvoices = 0;
            
        // Outstanding payments (no pending invoices in simplified schema)
        $outstandingPayments = 0;
            
        // Recent invoices
        $recentInvoices = Invoice::with(['user', 'workOrder.motorcycle.motorcycleModel', 'workSession.motorcycle.motorcycleModel'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($invoice) {
                // Determine motorcycle info based on whether it's linked to work order or session
                $motorcycle = null;
                $workType = 'Unknown';
                
                if ($invoice->workOrder && $invoice->workOrder->motorcycle) {
                    $motorcycle = $invoice->workOrder->motorcycle->motorcycleModel->Marca . ' ' . 
                                 $invoice->workOrder->motorcycle->motorcycleModel->Nome . ' (' . 
                                 $invoice->workOrder->motorcycle->Targa . ')';
                    $workType = 'Maintenance';
                } elseif ($invoice->workSession && $invoice->workSession->motorcycle) {
                    $motorcycle = $invoice->workSession->motorcycle->motorcycleModel->Marca . ' ' . 
                                 $invoice->workSession->motorcycle->motorcycleModel->Nome . ' (' . 
                                 $invoice->workSession->motorcycle->Targa . ')';
                    $workType = 'Session';
                } else {
                    $motorcycle = 'N/A';
                }
                
                return [
                    'id' => $invoice->CodiceFattura,
                    'invoice_number' => $invoice->CodiceFattura,
                    'customer' => $invoice->user->first_name . ' ' . $invoice->user->last_name,
                    'customer_email' => $invoice->user->email,
                    'motorcycle' => $motorcycle,
                    'work_type' => $workType,
                    'issue_date' => $invoice->Data->format('Y-m-d'),
                    'due_date' => null, // No due date in simplified schema
                    'total_amount' => (float) $invoice->Importo,
                    'status' => 'paid', // All invoices considered paid in simplified schema
                    'paid_at' => $invoice->Data?->format('Y-m-d'),
                    'is_overdue' => false, // No overdue tracking in simplified schema
                ];
            });
            
        // Top customers by revenue
        $topCustomers = User::where('type', 'customer')
            ->withSum('invoices', 'Importo')
            ->having('invoices_sum_importo', '>', 0)
            ->orderBy('invoices_sum_importo', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($customer) {
                return [
                    'id' => $customer->id,
                    'name' => $customer->first_name . ' ' . $customer->last_name,
                    'email' => $customer->email,
                    'total_revenue' => (float) ($customer->invoices_sum_importo ?? 0),
                ];
            });

        return Inertia::render('admin/financial/index', [
            'revenueAnalytics' => [
                'current_month_revenue' => (float) $currentMonthRevenue,
                'previous_month_revenue' => (float) $previousMonthRevenue,
                'revenue_growth' => round($revenueGrowth, 2),
                'monthly_revenue' => $monthlyRevenue,
            ],
            'invoiceStatistics' => [
                'total_invoices' => $totalInvoices,
                'paid_invoices' => $paidInvoices,
                'pending_invoices' => $pendingInvoices,
                'overdue_invoices' => $overdueInvoices,
                'outstanding_payments' => (float) $outstandingPayments,
            ],
            'recentInvoices' => $recentInvoices,
            'topCustomers' => $topCustomers,
        ]);
    }

    /**
     * Display a listing of all invoices with filtering and search.
     */
    public function invoices(Request $request): Response
    {
        $query = Invoice::with(['user', 'workOrder.motorcycle.motorcycleModel', 'workSession.motorcycle.motorcycleModel']);
        
        // Apply filters
        if ($request->filled('status')) {
            // Status filtering simplified - all invoices considered paid
            // No filtering needed since no status field in schema
        }
        
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('CodiceFattura', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($userQuery) use ($search) {
                      $userQuery->where('first_name', 'like', "%{$search}%")
                               ->orWhere('last_name', 'like', "%{$search}%")
                               ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }
        
        if ($request->filled('date_from')) {
            $query->where('Data', '>=', $request->date_from);
        }
        
        if ($request->filled('date_to')) {
            $query->where('Data', '<=', $request->date_to);
        }
        
        $invoices = $query->orderBy('created_at', 'desc')
            ->paginate(20)
            ->withQueryString();
            
        $invoicesData = $invoices->through(function ($invoice) {
            // Determine motorcycle info based on whether it's linked to work order or session
            $motorcycle = null;
            $workType = 'Unknown';
            
            if ($invoice->workOrder && $invoice->workOrder->motorcycle) {
                $motorcycle = $invoice->workOrder->motorcycle->motorcycleModel->Marca . ' ' . 
                             $invoice->workOrder->motorcycle->motorcycleModel->Nome . ' (' . 
                             $invoice->workOrder->motorcycle->Targa . ')';
                $workType = 'Maintenance';
            } elseif ($invoice->workSession && $invoice->workSession->motorcycle) {
                $motorcycle = $invoice->workSession->motorcycle->motorcycleModel->Marca . ' ' . 
                             $invoice->workSession->motorcycle->motorcycleModel->Nome . ' (' . 
                             $invoice->workSession->motorcycle->Targa . ')';
                $workType = 'Session';
            } else {
                $motorcycle = 'N/A';
            }
            
            return [
                'id' => $invoice->CodiceFattura,
                'invoice_number' => $invoice->CodiceFattura,
                'customer' => $invoice->user->first_name . ' ' . $invoice->user->last_name,
                'customer_email' => $invoice->user->email,
                'motorcycle' => $motorcycle,
                'work_type' => $workType,
                'issue_date' => $invoice->Data->format('Y-m-d'),
                'due_date' => null, // No due date in simplified schema
                'subtotal' => (float) $invoice->Importo,
                'tax_amount' => 0.0, // Not using separate tax amount
                'total_amount' => (float) $invoice->Importo,
                'status' => 'paid', // All invoices considered paid in simplified schema
                'paid_at' => $invoice->Data->format('Y-m-d'),
                'is_overdue' => false, // No overdue tracking in simplified schema
                'created_at' => $invoice->created_at->format('Y-m-d H:i'),
            ];
        });

        return Inertia::render('admin/financial/invoices', [
            'invoices' => $invoicesData,
            'filters' => $request->only(['status', 'search', 'date_from', 'date_to']),
        ]);
    }

    /**
     * Display the specified invoice details.
     */
    public function showInvoice(Invoice $invoice): Response
    {
        $invoice->load(['user', 'workOrder.motorcycle.motorcycleModel', 'workOrder.parts', 'workOrder.mechanics', 'workSession.motorcycle.motorcycleModel', 'workSession.mechanics']);
        
        $invoiceData = [
            'id' => $invoice->CodiceFattura,
            'invoice_number' => $invoice->CodiceFattura,
            'issue_date' => $invoice->Data->format('Y-m-d'),
            'due_date' => null, // No due date in simplified schema
            'subtotal' => (float) $invoice->Importo,
            'tax_amount' => 0.0, // Not using separate tax amount
            'total_amount' => (float) $invoice->Importo,
            'status' => 'paid', // All invoices considered paid in simplified schema
            'paid_at' => $invoice->Data->format('Y-m-d H:i'),
            'created_at' => $invoice->created_at->format('Y-m-d H:i'),
        ];
        
        $customer = [
            'id' => $invoice->user->id,
            'name' => $invoice->user->first_name . ' ' . $invoice->user->last_name,
            'email' => $invoice->user->email,
            'phone' => $invoice->user->phone,
            'tax_code' => $invoice->user->CF,
        ];
        
        $workData = null;
        
        if ($invoice->workOrder && $invoice->workOrder->motorcycle) {
            // Determine work order status based on dates
            $workOrderStatus = 'pending';
            if ($invoice->workOrder->DataInizio && $invoice->workOrder->DataFine) {
                $workOrderStatus = 'completed';
            } elseif ($invoice->workOrder->DataInizio) {
                $workOrderStatus = 'in_progress';
            }
            
            $workData = [
                'id' => $invoice->workOrder->CodiceIntervento,
                'type' => 'maintenance',
                'description' => $invoice->workOrder->Note,
                'status' => $workOrderStatus,
                'started_at' => $invoice->workOrder->DataInizio?->format('Y-m-d'),
                'completed_at' => $invoice->workOrder->DataFine?->format('Y-m-d'),
                'labor_cost' => 0.0, // Not using separate labor cost
                'parts_cost' => 0.0, // Not using separate parts cost
                'total_cost' => (float) $invoice->Importo,
                'motorcycle' => [
                    'brand' => $invoice->workOrder->motorcycle->motorcycleModel->Marca,
                    'model' => $invoice->workOrder->motorcycle->motorcycleModel->Nome,
                    'year' => $invoice->workOrder->motorcycle->AnnoImmatricolazione,
                    'plate' => $invoice->workOrder->motorcycle->Targa,
                    'vin' => $invoice->workOrder->motorcycle->NumTelaio,
                ],
            ];
        } elseif ($invoice->workSession && $invoice->workSession->motorcycle) {
            $workData = [
                'id' => $invoice->workSession->CodiceSessione,
                'type' => 'session',
                'description' => $invoice->workSession->Note ?? 'Work session',
                'status' => $invoice->workSession->Stato,
                'started_at' => $invoice->workSession->Data->format('Y-m-d'),
                'completed_at' => null, // Sessions don't have end dates
                'labor_cost' => 0.0, // Not using separate labor cost
                'parts_cost' => 0.0, // Sessions don't use parts
                'total_cost' => (float) $invoice->Importo,
                'motorcycle' => [
                    'brand' => $invoice->workSession->motorcycle->motorcycleModel->Marca,
                    'model' => $invoice->workSession->motorcycle->motorcycleModel->Nome,
                    'year' => $invoice->workSession->motorcycle->AnnoImmatricolazione,
                    'plate' => $invoice->workSession->motorcycle->Targa,
                    'vin' => $invoice->workSession->motorcycle->NumTelaio,
                ],
            ];
        } else {
            $workData = [
                'id' => 'N/A',
                'type' => 'unknown',
                'description' => 'Invoice not linked to work order or session',
                'status' => 'unknown',
                'started_at' => null,
                'completed_at' => null,
                'labor_cost' => 0.0,
                'parts_cost' => 0.0,
                'total_cost' => (float) $invoice->Importo,
                'motorcycle' => [
                    'brand' => 'N/A',
                    'model' => 'N/A',
                    'year' => null,
                    'plate' => 'N/A',
                    'vin' => 'N/A',
                ],
            ];
        }

        return Inertia::render('admin/financial/invoice-show', [
            'invoice' => $invoiceData,
            'customer' => $customer,
            'workOrder' => $workData, // Keep name for compatibility
        ]);
    }

    /**
     * Mark an invoice as paid.
     */
    public function markAsPaid(Invoice $invoice): RedirectResponse
    {
        // In simplified schema, all invoices are considered paid
        // This method is kept for interface compatibility but doesn't change anything
        return back()->with('success', 'Invoice is already considered paid in the simplified system.');
    }
} 