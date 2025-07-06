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
        $currentMonthRevenue = Invoice::whereMonth('issue_date', $currentMonth->month)
            ->whereYear('issue_date', $currentMonth->year)
            ->where('status', 'paid')
            ->sum('total_amount');
            
        // Previous month revenue for comparison
        $previousMonthRevenue = Invoice::whereMonth('issue_date', $previousMonth->month)
            ->whereYear('issue_date', $previousMonth->year)
            ->where('status', 'paid')
            ->sum('total_amount');
            
        // Revenue growth percentage
        $revenueGrowth = $previousMonthRevenue > 0 
            ? (($currentMonthRevenue - $previousMonthRevenue) / $previousMonthRevenue) * 100 
            : 0;
            
        // Monthly revenue for last 12 months
        $monthlyRevenue = collect(range(11, 0))->map(function ($monthsBack) {
            $date = now()->subMonths($monthsBack);
            $revenue = Invoice::whereMonth('issue_date', $date->month)
                ->whereYear('issue_date', $date->year)
                ->where('status', 'paid')
                ->sum('total_amount');
                
            return [
                'month' => $date->format('M Y'),
                'revenue' => (float) $revenue,
            ];
        });
        
        // Invoice statistics
        $totalInvoices = Invoice::count();
        $paidInvoices = Invoice::where('status', 'paid')->count();
        $pendingInvoices = Invoice::where('status', 'pending')->count();
        $overdueInvoices = Invoice::where('status', 'pending')
            ->where('due_date', '<', now())
            ->count();
            
        // Outstanding payments (total amount of pending invoices)
        $outstandingPayments = Invoice::where('status', 'pending')
            ->sum('total_amount');
            
        // Recent invoices
        $recentInvoices = Invoice::with(['user', 'workOrder.motorcycle.motorcycleModel'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($invoice) {
                return [
                    'id' => $invoice->id,
                    'invoice_number' => $invoice->invoice_number,
                    'customer' => $invoice->user->first_name . ' ' . $invoice->user->last_name,
                    'customer_email' => $invoice->user->email,
                    'motorcycle' => $invoice->workOrder->motorcycle->motorcycleModel->brand . ' ' . 
                                   $invoice->workOrder->motorcycle->motorcycleModel->name . ' (' . 
                                   $invoice->workOrder->motorcycle->license_plate . ')',
                    'issue_date' => $invoice->issue_date->format('Y-m-d'),
                    'due_date' => $invoice->due_date->format('Y-m-d'),
                    'total_amount' => (float) $invoice->total_amount,
                    'status' => $invoice->status,
                    'paid_at' => $invoice->paid_at?->format('Y-m-d'),
                    'is_overdue' => $invoice->status === 'pending' && $invoice->due_date < now(),
                ];
            });
            
        // Top customers by revenue
        $topCustomers = User::where('type', 'customer')
            ->withSum(['invoices' => function($query) {
                $query->where('status', 'paid');
            }], 'total_amount')
            ->having('invoices_sum_total_amount', '>', 0)
            ->orderBy('invoices_sum_total_amount', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($customer) {
                return [
                    'id' => $customer->id,
                    'name' => $customer->first_name . ' ' . $customer->last_name,
                    'email' => $customer->email,
                    'total_revenue' => (float) ($customer->invoices_sum_total_amount ?? 0),
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
            $query->where('status', $request->status);
        }
        
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($userQuery) use ($search) {
                      $userQuery->where('first_name', 'like', "%{$search}%")
                               ->orWhere('last_name', 'like', "%{$search}%")
                               ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }
        
        if ($request->filled('date_from')) {
            $query->where('issue_date', '>=', $request->date_from);
        }
        
        if ($request->filled('date_to')) {
            $query->where('issue_date', '<=', $request->date_to);
        }
        
        $invoices = $query->orderBy('created_at', 'desc')
            ->paginate(20)
            ->withQueryString();
            
        $invoicesData = $invoices->through(function ($invoice) {
            return [
                'id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'customer' => $invoice->user->first_name . ' ' . $invoice->user->last_name,
                'customer_email' => $invoice->user->email,
                'motorcycle' => $invoice->workOrder->motorcycle->motorcycleModel->brand . ' ' . 
                               $invoice->workOrder->motorcycle->motorcycleModel->name . ' (' . 
                               $invoice->workOrder->motorcycle->license_plate . ')',
                'issue_date' => $invoice->issue_date->format('Y-m-d'),
                'due_date' => $invoice->due_date->format('Y-m-d'),
                'subtotal' => (float) $invoice->subtotal,
                'tax_amount' => (float) $invoice->tax_amount,
                'total_amount' => (float) $invoice->total_amount,
                'status' => $invoice->status,
                'paid_at' => $invoice->paid_at?->format('Y-m-d'),
                'is_overdue' => $invoice->status === 'pending' && $invoice->due_date < now(),
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
            'id' => $invoice->id,
            'invoice_number' => $invoice->invoice_number,
            'issue_date' => $invoice->issue_date->format('Y-m-d'),
            'due_date' => $invoice->due_date->format('Y-m-d'),
            'subtotal' => (float) $invoice->subtotal,
            'tax_amount' => (float) $invoice->tax_amount,
            'total_amount' => (float) $invoice->total_amount,
            'status' => $invoice->status,
            'paid_at' => $invoice->paid_at?->format('Y-m-d H:i'),
            'created_at' => $invoice->created_at->format('Y-m-d H:i'),
        ];
        
        $customer = [
            'id' => $invoice->user->id,
            'name' => $invoice->user->first_name . ' ' . $invoice->user->last_name,
            'email' => $invoice->user->email,
            'phone' => $invoice->user->phone,
            'tax_code' => $invoice->user->tax_code,
        ];
        
        $workOrder = [
            'id' => $invoice->workOrder->id,
            'description' => $invoice->workOrder->description,
            'status' => $invoice->workOrder->status,
            'started_at' => $invoice->workOrder->started_at?->format('Y-m-d'),
            'completed_at' => $invoice->workOrder->completed_at?->format('Y-m-d'),
            'labor_cost' => (float) $invoice->workOrder->labor_cost,
            'parts_cost' => (float) $invoice->workOrder->parts_cost,
            'total_cost' => (float) $invoice->workOrder->total_cost,
            'motorcycle' => [
                'brand' => $invoice->workOrder->motorcycle->motorcycleModel->brand,
                'model' => $invoice->workOrder->motorcycle->motorcycleModel->name,
                'year' => $invoice->workOrder->motorcycle->registration_year,
                'plate' => $invoice->workOrder->motorcycle->license_plate,
                'vin' => $invoice->workOrder->motorcycle->vin,
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
        if ($invoice->status === 'paid') {
            return back()->with('error', 'Invoice is already marked as paid.');
        }
        
        $invoice->update([
            'status' => 'paid',
            'paid_at' => now(),
        ]);
        
        return back()->with('success', 'Invoice marked as paid successfully.');
    }


} 