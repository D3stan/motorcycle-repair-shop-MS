<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\Admin\UserUpdateRequest;
use App\Http\Resources\Admin\CustomerResource;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends BaseAdminController
{
    /**
     * Display a listing of customers.
     */
    public function index(): Response
    {
        $customers = $this->getUsersWithCounts(
            'customer',
            ['motorcycles', 'appointments', 'workOrders', 'invoices'],
            [] // No filtering needed - simplified schema has no invoice status
        );

        return Inertia::render('admin/customers/index', [
            'customers' => CustomerResource::collection($customers),
        ]);
    }

    /**
     * Display the specified customer.
     */
    public function show(User $customer): Response
    {
        $this->ensureUserType($customer, 'customer');

        // Load customer data with relationships
        $customer->load([
            'motorcycles.motorcycleModel',
            'appointments', // Simplified schema - appointments don't link to motorcycles
            'workOrders.motorcycle.motorcycleModel',
            'invoices'
        ]);

        // Format customer data using base controller method
        $customerData = $this->formatDetailedUserData($customer);

        // Format motorcycles
        $motorcycles = $customer->motorcycles->map(function ($motorcycle) {
            return [
                'id' => $motorcycle->NumTelaio,
                'brand' => $motorcycle->motorcycleModel->Marca,
                'model' => $motorcycle->motorcycleModel->Nome,
                'year' => $motorcycle->AnnoImmatricolazione,
                'plate' => $motorcycle->Targa,
                'vin' => $motorcycle->NumTelaio,
                'engine_size' => $motorcycle->motorcycleModel->Cilindrata,
            ];
        });

        // Format appointments
        $appointments = $customer->appointments->map(function ($appointment) {
            return [
                'id' => $appointment->CodiceAppuntamento,
                'appointment_date' => $appointment->DataAppuntamento->format('Y-m-d'),
                'type' => ucfirst(str_replace('_', ' ', $appointment->Tipo)),
                'description' => $appointment->Descrizione,
                'motorcycle' => 'Not linked in simplified schema', // Appointments don't link to motorcycles
                'notes' => null, // No notes field in simplified schema
            ];
        });

        // Format work orders
        $workOrders = $customer->workOrders->map(function ($workOrder) {
            // Determine status based on dates
            $status = 'pending';
            if ($workOrder->DataInizio && $workOrder->DataFine) {
                $status = 'completed';
            } elseif ($workOrder->DataInizio) {
                $status = 'in_progress';
            }

            return [
                'id' => $workOrder->CodiceIntervento,
                'description' => $workOrder->Note,
                'status' => $status,
                'started_at' => $workOrder->DataInizio?->format('Y-m-d'),
                'completed_at' => $workOrder->DataFine?->format('Y-m-d'),
                'total_cost' => $workOrder->invoice?->Importo ? (float) $workOrder->invoice->Importo : 0.0,
                'motorcycle' => $workOrder->motorcycle->motorcycleModel->Marca . ' ' . $workOrder->motorcycle->motorcycleModel->Nome,
            ];
        });

        // Format invoices
        $invoices = $customer->invoices->map(function ($invoice) {
            return [
                'id' => $invoice->CodiceFattura,
                'invoice_number' => $invoice->CodiceFattura,
                'issue_date' => $invoice->Data->format('Y-m-d'),
                'due_date' => null, // No due date in simplified schema
                'total_amount' => (float) $invoice->Importo,
                'status' => 'paid', // All invoices considered paid in simplified schema
                'paid_at' => $invoice->Data->format('Y-m-d'),
            ];
        });

        return Inertia::render('admin/customers/show', [
            'customer' => $customerData,
            'motorcycles' => $motorcycles,
            'appointments' => $appointments,
            'workOrders' => $workOrders,
            'invoices' => $invoices,
        ]);
    }

    /**
     * Show the form for editing the specified customer.
     */
    public function edit(User $customer): Response
    {
        $this->ensureUserType($customer, 'customer');

        return Inertia::render('admin/customers/edit', [
            'customer' => $this->formatBasicUserData($customer),
        ]);
    }

    /**
     * Update the specified customer.
     */
    public function update(UserUpdateRequest $request, User $customer): RedirectResponse
    {
        $this->ensureUserType($customer, 'customer');

        $customer->update($request->validated());

        return $this->successRedirect('admin.customers.show', $customer, 'Customer updated successfully!');
    }

    /**
     * Remove the specified customer.
     */
    public function destroy(User $customer): RedirectResponse
    {
        $this->ensureUserType($customer, 'customer');

        $deleteCheck = $this->canDeleteUser($customer);
        
        if (!$deleteCheck['canDelete']) {
            return $this->errorRedirect('admin.customers.index', null, $deleteCheck['message']);
        }

        $customer->delete();

        return $this->successRedirect('admin.customers.index', null, 'Customer deleted successfully!');
    }
} 