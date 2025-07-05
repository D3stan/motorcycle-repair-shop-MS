<?php

use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\MotorcycleModelController;
use App\Http\Controllers\Admin\StaffController;
use App\Http\Controllers\Admin\WorkOrderController;
use App\Http\Controllers\Admin\InventoryController;
use App\Http\Controllers\Admin\SupplierController;
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
    
    // Inventory Management
    Route::resource('inventory', InventoryController::class);
    
    // Supplier Management
    Route::resource('suppliers', SupplierController::class);
    
    // Legacy user management (keeping for compatibility)
    Route::resource('users', UserController::class);
    
    Route::get('financial', function () {
        return response()->json(['message' => 'Financial Management - To be implemented']);
    })->name('financial');
    
    Route::get('schedule', function () {
        return response()->json(['message' => 'Schedule Management - To be implemented']);
    })->name('schedule');
});
