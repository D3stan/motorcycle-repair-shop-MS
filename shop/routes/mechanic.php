<?php

use App\Http\Controllers\Mechanic\MechanicController;
use App\Http\Controllers\Mechanic\WorkSessionController;
use App\Http\Controllers\Mechanic\ScheduleController;
use App\Http\Controllers\Mechanic\InventoryController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    // In a real app, a middleware would check for the 'mechanic' role.

    Route::get('work-orders', [MechanicController::class, 'workOrders'])->name('work-orders.index');
    Route::get('work-orders/{workOrder}', [MechanicController::class, 'showWorkOrder'])->name('work-orders.show');
    Route::patch('work-orders/{workOrder}', [MechanicController::class, 'update'])->name('work-orders.update');

    Route::get('work-sessions', [WorkSessionController::class, 'index'])->name('work-sessions.index');
    Route::get('work-sessions/create', [WorkSessionController::class, 'create'])->name('work-sessions.create');
    Route::post('work-sessions', [WorkSessionController::class, 'store'])->name('work-sessions.store');

    Route::get('schedule', [ScheduleController::class, 'index'])->name('schedule');
    Route::get('inventory', [InventoryController::class, 'index'])->name('inventory');
}); 