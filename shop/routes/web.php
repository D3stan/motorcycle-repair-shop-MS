<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GarageController;
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
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
