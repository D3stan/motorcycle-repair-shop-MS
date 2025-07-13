<?php

namespace App\Http\Controllers\Mechanic;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;

class ScheduleController extends Controller
{
    /**
     * Display the mechanic's schedule.
     */
    public function index(Request $request)
    {
        /** @var User $user */
        $user = $request->user();

        // Get assigned work orders for the upcoming week
        $upcomingWorkOrders = $user->assignedWorkOrders()
            ->with(['motorcycle.motorcycleModel', 'motorcycle.user'])
            ->where('Stato', '!=', 'completed')
            ->where('INTERVENTI.created_at', '>=', now()->startOfWeek())
            ->orderBy('INTERVENTI.created_at', 'asc')
            ->get();

        return Inertia::render('mechanic/Schedule', [
            'upcomingWorkOrders' => $upcomingWorkOrders,
        ]);
    }
}
