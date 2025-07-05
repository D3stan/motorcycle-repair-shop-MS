<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Appointment;
use App\Models\WorkOrder;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    /**
     * Display a listing of customers.
     */
    public function index(): Response
    {
        $customers = User::where('type', 'customer')
            ->withCount(['motorcycles', 'appointments', 'workOrders', 'invoices'])
            ->with(['invoices' => function($query) {
                $query->where('status', 'pending');
            }])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $customersData = $customers->through(function ($customer) {
            return [
                'id' => $customer->id,
                'first_name' => $customer->first_name,
                'last_name' => $customer->last_name,
                'email' => $customer->email,
                'phone' => $customer->phone,
                'tax_code' => $customer->tax_code,
                'motorcycles_count' => $customer->motorcycles_count,
                'appointments_count' => $customer->appointments_count,
                'work_orders_count' => $customer->work_orders_count,
                'invoices_count' => $customer->invoices_count,
                'pending_invoices_count' => $customer->invoices->count(),
                'created_at' => $customer->created_at->format('Y-m-d'),
            ];
        });

        return Inertia::render('admin/customers/index', [
            'customers' => $customersData,
        ]);
    }

    /**
     * Display the specified customer.
     */
    public function show(User $customer): Response
    {
        // Ensure we're viewing a customer
        if ($customer->type !== 'customer') {
            abort(404);
        }

        // Load customer data with relationships
        $customer->load([
            'motorcycles.motorcycleModel',
            'appointments.motorcycle.motorcycleModel',
            'workOrders.motorcycle.motorcycleModel',
            'invoices'
        ]);

        // Format customer data
        $customerData = [
            'id' => $customer->id,
            'first_name' => $customer->first_name,
            'last_name' => $customer->last_name,
            'email' => $customer->email,
            'phone' => $customer->phone,
            'tax_code' => $customer->tax_code,
            'created_at' => $customer->created_at->format('Y-m-d H:i'),
        ];

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
        // Ensure we're editing a customer
        if ($customer->type !== 'customer') {
            abort(404);
        }

        return Inertia::render('admin/customers/edit', [
            'customer' => [
                'id' => $customer->id,
                'first_name' => $customer->first_name,
                'last_name' => $customer->last_name,
                'email' => $customer->email,
                'phone' => $customer->phone,
                'tax_code' => $customer->tax_code,
            ],
        ]);
    }

    /**
     * Update the specified customer.
     */
    public function update(Request $request, User $customer): RedirectResponse
    {
        // Ensure we're updating a customer
        if ($customer->type !== 'customer') {
            abort(404);
        }

        $validated = $request->validate([
            'first_name' => 'required|string|min:1|max:255|regex:/^[a-zA-ZÀ-ÿ\s\'-]+$/',
            'last_name' => 'required|string|min:1|max:255|regex:/^[a-zA-ZÀ-ÿ\s\'-]+$/',
            'email' => 'required|string|lowercase|email|max:255|unique:users,email,' . $customer->id,
            'phone' => 'nullable|string|max:20',
            'tax_code' => 'nullable|string|max:16|unique:users,tax_code,' . $customer->id,
        ]);

        $customer->update($validated);

        return redirect()->route('admin.customers.show', $customer)
            ->with('success', 'Customer updated successfully!');
    }

    /**
     * Remove the specified customer.
     */
    public function destroy(User $customer): RedirectResponse
    {
        // Ensure we're deleting a customer
        if ($customer->type !== 'customer') {
            abort(404);
        }

        // Check for active work orders
        $activeWorkOrders = $customer->workOrders()
            ->whereIn('status', ['pending', 'in_progress'])
            ->count();

        if ($activeWorkOrders > 0) {
            return redirect()->route('admin.customers.index')
                ->with('error', 'Cannot delete customer with active work orders.');
        }

        $customer->delete();

        return redirect()->route('admin.customers.index')
            ->with('success', 'Customer deleted successfully!');
    }
} 