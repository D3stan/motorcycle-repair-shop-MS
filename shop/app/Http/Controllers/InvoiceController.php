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
            ->whereNotNull('CodiceIntervento') // Only get invoices with work orders
            ->orderBy('Data', 'desc')
            ->get()
            ->map(function ($invoice) {
                // Ensure work order exists
                if (!$invoice->workOrder || !$invoice->workOrder->motorcycle) {
                    return null;
                }
                
                return [
                    'id' => $invoice->CodiceFattura,
                    'invoice_number' => $invoice->CodiceFattura,
                    'issue_date' => $invoice->Data->format('Y-m-d'),
                    'due_date' => $invoice->Data->format('Y-m-d'), // Use issue date as due date for compatibility
                    'status' => 'paid', // All invoices considered paid in simplified schema
                    'total_amount' => (float) $invoice->Importo,
                    'paid_at' => $invoice->Data->format('Y-m-d'),
                    'work_order' => [
                        'id' => $invoice->workOrder->CodiceIntervento,
                        'description' => $invoice->workOrder->Note ?? 'N/A',
                        'motorcycle' => [
                            'brand' => $invoice->workOrder->motorcycle->motorcycleModel->Marca ?? 'Unknown',
                            'model' => $invoice->workOrder->motorcycle->motorcycleModel->Nome ?? 'Unknown',
                            'plate' => $invoice->workOrder->motorcycle->Targa ?? 'N/A',
                        ],
                    ],
                ];
            })
            ->filter(); // Remove null entries

        // Calculate summary statistics
        // Status field not available in FATTURE schema - treating all invoices as paid
        $totalOutstanding = 0; // No outstanding invoices in simplified schema
        $totalPaid = $invoices->sum('total_amount');
        $pendingCount = 0; // No pending invoices in simplified schema
        $overdueCount = 0; // No overdue invoices in simplified schema

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
        $invoice = Invoice::where('CodiceFattura', $invoiceId)
            ->where('CF', $user->CF)
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

        // Ensure work order exists
        if (!$invoice->workOrder) {
            abort(404, 'Invoice work order not found.');
        }

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
        $filename = "invoice-{$invoice->CodiceFattura}.pdf";
        
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