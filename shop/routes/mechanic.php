<?php

use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    // Mechanic role check middleware would go here in a full implementation
    
    // Placeholder routes for navigation - these would be implemented with proper controllers
    Route::get('work-orders', function () {
        return response()->json(['message' => 'Mechanic Work Orders - To be implemented']);
    })->name('work-orders');
    
    Route::get('schedule', function () {
        return response()->json(['message' => 'Mechanic Schedule - To be implemented']);
    })->name('schedule');
    
    Route::get('inventory', function () {
        return response()->json(['message' => 'Mechanic Inventory - To be implemented']);
    })->name('inventory');
}); 