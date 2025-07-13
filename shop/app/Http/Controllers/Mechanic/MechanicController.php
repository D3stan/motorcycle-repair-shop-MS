<?php

namespace App\Http\Controllers\Mechanic;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\WorkOrder;
use Illuminate\Validation\Rule;

class MechanicController extends Controller
{
    /**
     * Display the mechanic's assigned work orders.
     */
    public function workOrders(Request $request)
    {
        /** @var User $user */
        $user = $request->user();

        $workOrders = $user->assignedWorkOrders()
            ->with(['motorcycle.motorcycleModel', 'motorcycle.user'])
            ->orderBy('INTERVENTI.created_at', 'desc')
            ->paginate(10);

        return Inertia::render('mechanic/WorkOrders', [
            'workOrders' => $workOrders,
        ]);
    }

    /**
     * Display a single work order.
     */
    public function showWorkOrder(Request $request, WorkOrder $workOrder)
    {
        // Ensure the mechanic is assigned to this work order
        // TODO: Add authorization logic

        $workOrder->load(['motorcycle.motorcycleModel', 'motorcycle.user', 'parts', 'mechanics']);

        return Inertia::render('mechanic/ShowWorkOrder', [
            'workOrder' => $workOrder,
        ]);
    }

    /**
     * Update the specified work order in storage.
     */
    public function update(Request $request, WorkOrder $workOrder)
    {
        // TODO: Add authorization logic

        $request->validate([
            'status' => ['required', Rule::in(['pending', 'in_progress', 'completed', 'cancelled'])],
        ]);

        $workOrder->update([
            'Stato' => $request->status,
        ]);

        return redirect()->route('mechanic.work-orders.show', $workOrder);
    }
}
