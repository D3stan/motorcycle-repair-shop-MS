<?php

namespace App\Http\Controllers\Mechanic;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\WorkSession;

class WorkSessionController extends Controller
{
    /**
     * Display the mechanic's work sessions.
     */
    public function index(Request $request)
    {
        /** @var User $user */
        $user = $request->user();

        $workSessions = $user->workSessions()
            ->with(['motorcycle.motorcycleModel'])
            ->orderBy('Data', 'desc')
            ->paginate(10);

        return Inertia::render('mechanic/WorkSessions', [
            'workSessions' => $workSessions,
        ]);
    }

    /**
     * Show the form for creating a new work session.
     */
    public function create()
    {
        // This would typically involve selecting a work order to create a session for.
        // For now, we'll render a simple form.
        return Inertia::render('mechanic/CreateWorkSession');
    }

    /**
     * Store a newly created work session in storage.
     */
    public function store(Request $request)
    {
        // Validation and creation logic would go here.
        // This is a placeholder for now.
        return redirect()->route('mechanic.work-sessions.index');
    }
}
