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
            ['invoices' => function($query) {
                $query->where('status', 'pending');
            }]
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
            'appointments.motorcycle.motorcycleModel',
            'workOrders.motorcycle.motorcycleModel',
            'invoices'
        ]);

        // Format customer data using base controller method
        $customerData = $this->formatDetailedUserData($customer);

        // Format motorcycles
        $motorcycles = $customer->motorcycles->map(function ($motorcycle) {
            return [
                'id' => $motorcycle->id,
                'brand' => $motorcycle->motorcycleModel->brand,
                'model' => $motorcycle->motorcycleModel->name,
                'year' => $motorcycle->registration_year,
                'plate' => $motorcycle->license_plate,
                'vin' => $motorcycle->vin,
                'engine_size' => $motorcycle->motorcycleModel->engine_size,
            ];
        });

        // Format appointments
        $appointments = $customer->appointments->map(function ($appointment) {
            return [
                'id' => $appointment->id,
                'appointment_date' => $appointment->appointment_date->format('Y-m-d'),
                'appointment_time' => $appointment->appointment_time,
                'type' => ucfirst(str_replace('_', ' ', $appointment->type)),
                'status' => $appointment->status,
                'motorcycle' => $appointment->motorcycle->motorcycleModel->brand . ' ' . $appointment->motorcycle->motorcycleModel->name,
                'notes' => $appointment->notes,
            ];
        });

        // Format work orders
        $workOrders = $customer->workOrders->map(function ($workOrder) {
            return [
                'id' => $workOrder->id,
                'description' => $workOrder->description,
                'status' => $workOrder->status,
                'started_at' => $workOrder->started_at?->format('Y-m-d'),
                'completed_at' => $workOrder->completed_at?->format('Y-m-d'),
                'total_cost' => $workOrder->total_cost ? (float) $workOrder->total_cost : 0.0,
                'motorcycle' => $workOrder->motorcycle->motorcycleModel->brand . ' ' . $workOrder->motorcycle->motorcycleModel->name,
            ];
        });

        // Format invoices
        $invoices = $customer->invoices->map(function ($invoice) {
            return [
                'id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'issue_date' => $invoice->issue_date->format('Y-m-d'),
                'due_date' => $invoice->due_date->format('Y-m-d'),
                'total_amount' => (float) $invoice->total_amount,
                'status' => $invoice->status,
                'paid_at' => $invoice->paid_at?->format('Y-m-d'),
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