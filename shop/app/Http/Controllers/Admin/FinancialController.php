<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\WorkOrder;
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
        $currentMonthRevenue = Invoice::whereMonth('DataEmissione', $currentMonth->month)
            ->whereYear('DataEmissione', $currentMonth->year)
            ->where('Stato', 'paid')
            ->sum('Importo');
            
        // Previous month revenue for comparison
        $previousMonthRevenue = Invoice::whereMonth('DataEmissione', $previousMonth->month)
            ->whereYear('DataEmissione', $previousMonth->year)
            ->where('Stato', 'paid')
            ->sum('Importo');
            
        // Revenue growth percentage
        $revenueGrowth = $previousMonthRevenue > 0 
            ? (($currentMonthRevenue - $previousMonthRevenue) / $previousMonthRevenue) * 100 
            : 0;
            
        // Monthly revenue for last 12 months
        $monthlyRevenue = collect(range(11, 0))->map(function ($monthsBack) {
            $date = now()->subMonths($monthsBack);
            $revenue = Invoice::whereMonth('DataEmissione', $date->month)
                ->whereYear('DataEmissione', $date->year)
                ->where('Stato', 'paid')
                ->sum('Importo');
                
            return [
                'month' => $date->format('M Y'),
                'revenue' => (float) $revenue,
            ];
        });
        
        // Invoice statistics
        $totalInvoices = Invoice::count();
        $paidInvoices = Invoice::where('Stato', 'paid')->count();
        $pendingInvoices = Invoice::where('Stato', 'pending')->count();
        $overdueInvoices = Invoice::where('Stato', 'pending')
            ->where('DataScadenza', '<', now())
            ->count();
            
        // Outstanding payments (total amount of pending invoices)
        $outstandingPayments = Invoice::where('Stato', 'pending')
            ->sum('Importo');
            
        // Recent invoices
        $recentInvoices = Invoice::with(['user', 'workOrder.motorcycle.motorcycleModel'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($invoice) {
                return [
                    'id' => $invoice->CodiceFattura,
                    'invoice_number' => $invoice->CodiceFattura,
                    'customer' => $invoice->user->first_name . ' ' . $invoice->user->last_name,
                    'customer_email' => $invoice->user->email,
                    'motorcycle' => $invoice->workOrder->motorcycle->motorcycleModel->Marca . ' ' . 
                                   $invoice->workOrder->motorcycle->motorcycleModel->Nome . ' (' . 
                                   $invoice->workOrder->motorcycle->Targa . ')',
                    'issue_date' => $invoice->DataEmissione->format('Y-m-d'),
                    'due_date' => $invoice->DataScadenza->format('Y-m-d'),
                    'total_amount' => (float) $invoice->Importo,
                    'status' => $invoice->Stato,
                    'paid_at' => $invoice->DataPagamento?->format('Y-m-d'),
                    'is_overdue' => $invoice->Stato === 'pending' && $invoice->DataScadenza < now(),
                ];
            });
            
        // Top customers by revenue
        $topCustomers = User::where('type', 'customer')
            ->withSum(['invoices' => function($query) {
                $query->where('Stato', 'paid');
            }], 'Importo')
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
        $query = Invoice::with(['user', 'workOrder.motorcycle.motorcycleModel']);
        
        // Apply filters
        if ($request->filled('status')) {
            if ($request->status === 'overdue') {
                $query->where('Stato', 'pending')
                      ->where('DataScadenza', '<', now());
            } else {
                $query->where('Stato', $request->status)
                      ->where('DataScadenza', '>', now());
            }
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
            $query->where('DataEmissione', '>=', $request->date_from);
        }
        
        if ($request->filled('date_to')) {
            $query->where('DataEmissione', '<=', $request->date_to);
        }
        
        $invoices = $query->orderBy('created_at', 'desc')
            ->paginate(20)
            ->withQueryString();
            
        $invoicesData = $invoices->through(function ($invoice) {
            return [
                'id' => $invoice->CodiceFattura,
                'invoice_number' => $invoice->CodiceFattura,
                'customer' => $invoice->user->first_name . ' ' . $invoice->user->last_name,
                'customer_email' => $invoice->user->email,
                'motorcycle' => $invoice->workOrder->motorcycle->motorcycleModel->Marca . ' ' . 
                               $invoice->workOrder->motorcycle->motorcycleModel->Nome . ' (' . 
                               $invoice->workOrder->motorcycle->Targa . ')',
                'issue_date' => $invoice->DataEmissione->format('Y-m-d'),
                'due_date' => $invoice->DataScadenza->format('Y-m-d'),
                'subtotal' => (float) $invoice->Importo,
                'tax_amount' => 0.0, // Not using separate tax amount
                'total_amount' => (float) $invoice->Importo,
                'status' => $invoice->Stato,
                'paid_at' => $invoice->DataPagamento?->format('Y-m-d'),
                'is_overdue' => $invoice->Stato === 'pending' && $invoice->DataScadenza < now(),
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
        $invoice->load(['user', 'workOrder.motorcycle.motorcycleModel', 'workOrder.parts', 'workOrder.mechanics']);
        
        $invoiceData = [
            'id' => $invoice->CodiceFattura,
            'invoice_number' => $invoice->CodiceFattura,
            'issue_date' => $invoice->DataEmissione->format('Y-m-d'),
            'due_date' => $invoice->DataScadenza->format('Y-m-d'),
            'subtotal' => (float) $invoice->Importo,
            'tax_amount' => 0.0, // Not using separate tax amount
            'total_amount' => (float) $invoice->Importo,
            'status' => $invoice->Stato,
            'paid_at' => $invoice->DataPagamento?->format('Y-m-d H:i'),
            'created_at' => $invoice->created_at->format('Y-m-d H:i'),
        ];
        
        $customer = [
            'id' => $invoice->user->id,
            'name' => $invoice->user->first_name . ' ' . $invoice->user->last_name,
            'email' => $invoice->user->email,
            'phone' => $invoice->user->phone,
            'tax_code' => $invoice->user->CF,
        ];
        
        // Determine work order status based on dates
        $workOrderStatus = 'pending';
        if ($invoice->workOrder->DataInizio && $invoice->workOrder->DataFine) {
            $workOrderStatus = 'completed';
        } elseif ($invoice->workOrder->DataInizio) {
            $workOrderStatus = 'in_progress';
        }
        
        $workOrder = [
            'id' => $invoice->workOrder->CodiceIntervento,
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

        return Inertia::render('admin/financial/invoice-show', [
            'invoice' => $invoiceData,
            'customer' => $customer,
            'workOrder' => $workOrder,
        ]);
    }

    /**
     * Mark an invoice as paid.
     */
    public function markAsPaid(Invoice $invoice): RedirectResponse
    {
        if ($invoice->Stato === 'paid') {
            return back()->with('error', 'Invoice is already marked as paid.');
        }
        
        // Allow marking as paid for both pending and overdue invoices
        if (!in_array($invoice->Stato, ['pending', 'overdue'])) {
            return back()->with('error', 'Only pending or overdue invoices can be marked as paid.');
        }
        
        $invoice->update([
            'Stato' => 'paid',
            'DataPagamento' => now(),
        ]);
        
        return back()->with('success', 'Invoice marked as paid successfully.');
    }
} 