<?php

use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\MotorcycleModelController;
use App\Http\Controllers\Admin\StaffController;
use App\Http\Controllers\Admin\WorkOrderController;
use App\Http\Controllers\Admin\InventoryController;
use App\Http\Controllers\Admin\SupplierController;
use App\Http\Controllers\Admin\FinancialController;
use App\Http\Controllers\Admin\ScheduleController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    // Admin role check middleware would go here in a full implementation
    
    // Customer Management
    Route::resource('customers', CustomerController::class);
    
    // Motorcycle Model Management
    Route::resource('motorcycles', MotorcycleModelController::class);
    
    // Staff Management
    Route::resource('staff', StaffController::class);
    
    // Work Orders Management
    Route::resource('work-orders', WorkOrderController::class);
    Route::post('work-orders/{workOrder}/assign-mechanics', [WorkOrderController::class, 'assignMechanics'])->name('work-orders.assign-mechanics');
    Route::patch('work-orders/{workOrder}/status', [WorkOrderController::class, 'updateStatus'])->name('work-orders.update-status');
    Route::patch('work-orders/{workOrder}/mark-completed', [WorkOrderController::class, 'markCompleted'])->name('work-orders.mark-completed');
    
    // Debug route for testing mechanics relationship
    Route::get('debug/work-order-mechanics', function () {
        $workOrder = \App\Models\WorkOrder::with('mechanics')->first();
        if (!$workOrder) {
            return response()->json(['error' => 'No work orders found']);
        }
        
        return response()->json([
            'work_order_id' => $workOrder->CodiceIntervento,
            'mechanics_count' => $workOrder->mechanics->count(),
            'mechanics' => $workOrder->mechanics->toArray(),
            'raw_query' => $workOrder->mechanics()->toSql(),
            'raw_bindings' => $workOrder->mechanics()->getBindings(),
        ]);
    });
    
    // Debug route for testing staff assigned work orders
    Route::get('debug/staff-work-orders', function () {
        $mechanic = \App\Models\User::where('type', 'mechanic')->with('assignedWorkOrders')->first();
        if (!$mechanic) {
            return response()->json(['error' => 'No mechanics found']);
        }
        
        return response()->json([
            'mechanic_name' => $mechanic->first_name . ' ' . $mechanic->last_name,
            'mechanic_cf' => $mechanic->CF,
            'assigned_work_orders_count' => $mechanic->assignedWorkOrders->count(),
            'assigned_work_orders' => $mechanic->assignedWorkOrders->toArray(),
            'raw_query' => $mechanic->assignedWorkOrders()->toSql(),
            'raw_bindings' => $mechanic->assignedWorkOrders()->getBindings(),
        ]);
    });
    
    // Inventory Management
    Route::resource('inventory', InventoryController::class);
    
    // Supplier Management
    Route::resource('suppliers', SupplierController::class);
    
    // Legacy user management (keeping for compatibility)
    Route::resource('users', UserController::class);
    
    // Financial Management
    Route::prefix('financial')->name('financial.')->group(function () {
        Route::get('/', [FinancialController::class, 'index'])->name('index');
        Route::get('/invoices', [FinancialController::class, 'invoices'])->name('invoices');
        Route::get('/invoices/create', [FinancialController::class, 'create'])->name('invoices.create');
        Route::post('/invoices', [FinancialController::class, 'store'])->name('invoices.store');
        Route::get('/invoices/{invoice}', [FinancialController::class, 'showInvoice'])->name('invoices.show');
        Route::patch('/invoices/{invoice}/mark-as-paid', [FinancialController::class, 'markAsPaid'])->name('invoices.mark-as-paid');
        Route::get('/work-orders/{workOrder}/create-invoice', [FinancialController::class, 'createInvoice'])->name('work-orders.create-invoice');
        Route::post('/work-orders/{workOrder}/create-invoice', [FinancialController::class, 'storeInvoice'])->name('work-orders.store-invoice');
    });
    
    // Schedule Management
    Route::prefix('schedule')->name('schedule.')->group(function () {
        Route::get('/', [ScheduleController::class, 'index'])->name('index');
        Route::get('/appointments', [ScheduleController::class, 'appointments'])->name('appointments');
        Route::get('/appointments/create', [ScheduleController::class, 'create'])->name('appointments.create');
        Route::post('/appointments', [ScheduleController::class, 'store'])->name('appointments.store');
        Route::get('/appointments/{appointment}', [ScheduleController::class, 'show'])->name('show');
        Route::get('/appointments/{appointment}/edit', [ScheduleController::class, 'edit'])->name('appointments.edit');
        Route::put('/appointments/{appointment}', [ScheduleController::class, 'update'])->name('appointments.update');
        Route::delete('/appointments/{appointment}', [ScheduleController::class, 'destroy'])->name('appointments.destroy');
        Route::patch('/appointments/{appointment}/accept', [ScheduleController::class, 'accept'])->name('appointments.accept');
        Route::patch('/appointments/{appointment}/reject', [ScheduleController::class, 'reject'])->name('appointments.reject');

    });
});
