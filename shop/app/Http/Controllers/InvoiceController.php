<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Barryvdh\DomPDF\Facade\Pdf;

class InvoiceController extends Controller
{
    /**
     * Display a listing of the user's invoices.
     */
    public function index(Request $request): InertiaResponse
    {
        $user = $request->user();

        // Get user's invoices with related data
        $invoices = $user->invoices()
            ->with(['workOrder.motorcycle.motorcycleModel'])
            ->orderBy('issue_date', 'desc')
            ->get()
            ->map(function ($invoice) {
                return [
                    'id' => $invoice->id,
                    'invoice_number' => $invoice->invoice_number,
                    'issue_date' => $invoice->issue_date->format('Y-m-d'),
                    'due_date' => $invoice->due_date->format('Y-m-d'),
                    'status' => $invoice->status,
                    'subtotal' => (float) $invoice->subtotal,
                    'tax_amount' => (float) $invoice->tax_amount,
                    'total_amount' => (float) $invoice->total_amount,
                    'paid_at' => $invoice->paid_at?->format('Y-m-d'),
                    'work_order' => [
                        'id' => $invoice->workOrder->id,
                        'description' => $invoice->workOrder->description,
                        'motorcycle' => [
                            'brand' => $invoice->workOrder->motorcycle->motorcycleModel->brand,
                            'model' => $invoice->workOrder->motorcycle->motorcycleModel->name,
                            'plate' => $invoice->workOrder->motorcycle->license_plate,
                        ],
                    ],
                ];
            });

        // Calculate summary statistics
        $totalOutstanding = $invoices->where('status', '!=', 'paid')->sum('total_amount');
        $totalPaid = $invoices->where('status', 'paid')->sum('total_amount');
        $pendingCount = $invoices->where('status', 'pending')->count();
        $overdueCount = $invoices->where('status', 'overdue')->count();

        return Inertia::render('invoices', [
            'invoices' => $invoices,
            'summary' => [
                'total_outstanding' => $totalOutstanding,
                'total_paid' => $totalPaid,
                'pending_count' => $pendingCount,
                'overdue_count' => $overdueCount,
            ],
        ]);
    }

    /**
     * Download invoice as PDF.
     */
    public function download(Request $request, Invoice $invoice): Response
    {
        $user = $request->user();

        // Ensure the invoice belongs to the authenticated user
        if ($invoice->user_id !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        // Load relationships for the PDF
        $invoice->load([
            'user',
            'workOrder.motorcycle.motorcycleModel',
            'workOrder.parts'
        ]);

        // Generate PDF
        $pdf = Pdf::loadView('invoices.pdf', [
            'invoice' => $invoice,
            'user' => $user,
            'workOrder' => $invoice->workOrder,
            'motorcycle' => $invoice->workOrder->motorcycle,
            'parts' => $invoice->workOrder->parts,
        ]);

        // Return PDF download
        return $pdf->download("invoice-{$invoice->invoice_number}.pdf");
    }
} 