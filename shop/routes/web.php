<?php

use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GarageController;
use App\Http\Controllers\WorkOrderController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    Route::get('garage', [GarageController::class, 'index'])->name('garage');
    Route::post('garage', [GarageController::class, 'store'])->name('garage.store');
    Route::put('garage/{motorcycle}', [GarageController::class, 'update'])->name('garage.update');
    Route::delete('garage/{motorcycle}', [GarageController::class, 'destroy'])->name('garage.destroy');
    Route::get('garage/{motorcycle}/history', [GarageController::class, 'history'])->name('garage.history');
    
    Route::get('appointments', [AppointmentController::class, 'index'])->name('appointments');
    Route::post('appointments', [AppointmentController::class, 'store'])->name('appointments.store');
    Route::put('appointments/{appointment}', [AppointmentController::class, 'update'])->name('appointments.update');
    Route::delete('appointments/{appointment}', [AppointmentController::class, 'destroy'])->name('appointments.destroy');
    
    Route::get('work-orders', [WorkOrderController::class, 'index'])->name('work-orders');
    Route::get('work-orders/{workOrder}', [WorkOrderController::class, 'show'])->name('work-orders.show');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
