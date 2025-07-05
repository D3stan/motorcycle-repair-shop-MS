<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\WorkOrder;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class StaffController extends Controller
{
    /**
     * Display a listing of staff members (mechanics).
     */
    public function index(): Response
    {
        $staff = User::where('type', 'mechanic')
            ->withCount(['assignedWorkOrders'])
            ->with(['assignedWorkOrders' => function($query) {
                $query->whereIn('status', ['pending', 'in_progress']);
            }])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $staffData = $staff->through(function ($mechanic) {
            return [
                'id' => $mechanic->id,
                'first_name' => $mechanic->first_name,
                'last_name' => $mechanic->last_name,
                'email' => $mechanic->email,
                'phone' => $mechanic->phone,
                'tax_code' => $mechanic->tax_code,
                'assigned_work_orders_count' => $mechanic->assigned_work_orders_count,
                'active_work_orders_count' => $mechanic->assignedWorkOrders->count(),
                'created_at' => $mechanic->created_at->format('Y-m-d'),
            ];
        });

        return Inertia::render('admin/staff/index', [
            'staff' => $staffData,
        ]);
    }

    /**
     * Show the form for creating a new staff member.
     */
    public function create(): Response
    {
        return Inertia::render('admin/staff/create');
    }

    /**
     * Store a newly created staff member.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'first_name' => 'required|string|min:1|max:255|regex:/^[a-zA-ZÀ-ÿ\s\'-]+$/',
            'last_name' => 'required|string|min:1|max:255|regex:/^[a-zA-ZÀ-ÿ\s\'-]+$/',
            'email' => 'required|string|lowercase|email|max:255|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'tax_code' => 'nullable|string|max:16|unique:users,tax_code',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $validated['type'] = 'mechanic';
        $validated['password'] = Hash::make($validated['password']);

        $staff = User::create($validated);

        return redirect()->route('admin.staff.show', $staff)
            ->with('success', 'Staff member created successfully!');
    }

    /**
     * Display the specified staff member.
     */
    public function show(User $staff): Response
    {
        // Ensure we're viewing a mechanic
        if ($staff->type !== 'mechanic') {
            abort(404);
        }

        // Load staff data with relationships
        $staff->load([
            'assignedWorkOrders.motorcycle.motorcycleModel',
            'assignedWorkOrders.user',
            'workSessions'
        ]);

        // Format staff data
        $staffData = [
            'id' => $staff->id,
            'first_name' => $staff->first_name,
            'last_name' => $staff->last_name,
            'email' => $staff->email,
            'phone' => $staff->phone,
            'tax_code' => $staff->tax_code,
            'created_at' => $staff->created_at->format('Y-m-d H:i'),
        ];

        // Format assigned work orders
        $assignedWorkOrders = $staff->assignedWorkOrders->map(function ($workOrder) {
            return [
                'id' => $workOrder->id,
                'description' => $workOrder->description,
                'status' => $workOrder->status,
                'started_at' => $workOrder->started_at?->format('Y-m-d'),
                'completed_at' => $workOrder->completed_at?->format('Y-m-d'),
                'total_cost' => $workOrder->total_cost ? (float) $workOrder->total_cost : 0.0,
                'motorcycle' => $workOrder->motorcycle->motorcycleModel->brand . ' ' . $workOrder->motorcycle->motorcycleModel->name,
                'customer' => $workOrder->user->first_name . ' ' . $workOrder->user->last_name,
                'assigned_at' => $workOrder->pivot->assigned_at ? Carbon::parse($workOrder->pivot->assigned_at)->format('Y-m-d H:i') : null,
                'pivot_started_at' => $workOrder->pivot->started_at ? Carbon::parse($workOrder->pivot->started_at)->format('Y-m-d H:i') : null,
                'pivot_completed_at' => $workOrder->pivot->completed_at ? Carbon::parse($workOrder->pivot->completed_at)->format('Y-m-d H:i') : null,
                'pivot_notes' => $workOrder->pivot->notes,
            ];
        });

        // Calculate statistics
        $totalWorkOrders = $staff->assignedWorkOrders->count();
        $completedWorkOrders = $staff->assignedWorkOrders->where('status', 'completed')->count();
        $activeWorkOrders = $staff->assignedWorkOrders->whereIn('status', ['pending', 'in_progress'])->count();
        $completionRate = $totalWorkOrders > 0 ? round(($completedWorkOrders / $totalWorkOrders) * 100, 1) : 0;

        return Inertia::render('admin/staff/show', [
            'staff' => $staffData,
            'assignedWorkOrders' => $assignedWorkOrders,
            'statistics' => [
                'total_work_orders' => $totalWorkOrders,
                'completed_work_orders' => $completedWorkOrders,
                'active_work_orders' => $activeWorkOrders,
                'completion_rate' => $completionRate,
            ],
        ]);
    }

    /**
     * Show the form for editing the specified staff member.
     */
    public function edit(User $staff): Response
    {
        // Ensure we're editing a mechanic
        if ($staff->type !== 'mechanic') {
            abort(404);
        }

        return Inertia::render('admin/staff/edit', [
            'staff' => [
                'id' => $staff->id,
                'first_name' => $staff->first_name,
                'last_name' => $staff->last_name,
                'email' => $staff->email,
                'phone' => $staff->phone,
                'tax_code' => $staff->tax_code,
            ],
        ]);
    }

    /**
     * Update the specified staff member.
     */
    public function update(Request $request, User $staff): RedirectResponse
    {
        // Ensure we're updating a mechanic
        if ($staff->type !== 'mechanic') {
            abort(404);
        }

        $validated = $request->validate([
            'first_name' => 'required|string|min:1|max:255|regex:/^[a-zA-ZÀ-ÿ\s\'-]+$/',
            'last_name' => 'required|string|min:1|max:255|regex:/^[a-zA-ZÀ-ÿ\s\'-]+$/',
            'email' => 'required|string|lowercase|email|max:255|unique:users,email,' . $staff->id,
            'phone' => 'nullable|string|max:20',
            'tax_code' => 'nullable|string|max:16|unique:users,tax_code,' . $staff->id,
        ]);

        $staff->update($validated);

        return redirect()->route('admin.staff.show', $staff)
            ->with('success', 'Staff member updated successfully!');
    }

    /**
     * Remove the specified staff member.
     */
    public function destroy(User $staff): RedirectResponse
    {
        // Ensure we're deleting a mechanic
        if ($staff->type !== 'mechanic') {
            abort(404);
        }

        // Check for active work orders
        $activeWorkOrders = $staff->assignedWorkOrders()
            ->whereIn('status', ['pending', 'in_progress'])
            ->count();

        if ($activeWorkOrders > 0) {
            return redirect()->route('admin.staff.index')
                ->with('error', 'Cannot delete staff member with active work orders. Please reassign or complete work orders first.');
        }

        $staff->delete();

        return redirect()->route('admin.staff.index')
            ->with('success', 'Staff member deleted successfully!');
    }
} 