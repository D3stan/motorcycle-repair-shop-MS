<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
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
    public function download(Request $request, $invoiceId): StreamedResponse
    {
        $user = $request->user();

        // Find the invoice manually to avoid route model binding issues
        $invoice = Invoice::where('id', $invoiceId)
            ->where('user_id', $user->id)
            ->first();

        // Check if invoice exists and belongs to user
        if (!$invoice) {
            abort(404, 'Invoice not found or access denied.');
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

        // Set PDF options for better output
        $pdf->setPaper('A4', 'portrait');
        $pdf->setOptions([
            'dpi' => 150,
            'defaultFont' => 'DejaVu Sans',
            'isRemoteEnabled' => false,
            'chroot' => public_path(),
        ]);

        // Generate filename
        $filename = "invoice-{$invoice->invoice_number}.pdf";
        
        // Force download using the download method with proper headers
        return response()->streamDownload(function() use ($pdf) {
            echo $pdf->output();
        }, $filename, [
            'Content-Type' => 'application/pdf',
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ]);
    }
} 