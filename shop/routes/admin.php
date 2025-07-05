<?php

use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    // Admin role check middleware would go here in a full implementation
    
    // Customer Management
    Route::get('customers', [UserController::class, 'index'])->name('customers');
    Route::resource('users', UserController::class);
    
    // Placeholder routes for navigation - these would be implemented with proper controllers
    Route::get('motorcycles', function () {
        return response()->json(['message' => 'Motorcycle Management - To be implemented']);
    })->name('motorcycles');
    
    Route::get('staff', function () {
        return response()->json(['message' => 'Staff Management - To be implemented']);
    })->name('staff');
    
    Route::get('work-orders', function () {
        return response()->json(['message' => 'Admin Work Orders - To be implemented']);
    })->name('work-orders');
    
    Route::get('inventory', function () {
        return response()->json(['message' => 'Inventory Management - To be implemented']);
    })->name('inventory');
    
    Route::get('suppliers', function () {
        return response()->json(['message' => 'Supplier Management - To be implemented']);
    })->name('suppliers');
    
    Route::get('financial', function () {
        return response()->json(['message' => 'Financial Management - To be implemented']);
    })->name('financial');
    
    Route::get('schedule', function () {
        return response()->json(['message' => 'Schedule Management - To be implemented']);
    })->name('schedule');
});
