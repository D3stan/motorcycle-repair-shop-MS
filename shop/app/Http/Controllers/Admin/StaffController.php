<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\Admin\StaffCreateRequest;
use App\Http\Requests\Admin\UserUpdateRequest;
use App\Http\Resources\Admin\StaffResource;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class StaffController extends BaseAdminController
{
    /**
     * Display a listing of staff members (mechanics).
     */
    public function index(): Response
    {
        $staff = $this->getUsersWithCounts(
            'mechanic',
            ['assignedWorkOrders'],
            ['assignedWorkOrders' => function($query) {
                $query->whereIn('status', ['pending', 'in_progress']);
            }]
        );

        return Inertia::render('admin/staff/index', [
            'staff' => StaffResource::collection($staff),
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
    public function store(StaffCreateRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $validated['password'] = Hash::make($validated['password']);

        $staff = User::create($validated);

        return $this->successRedirect('admin.staff.show', $staff, 'Staff member created successfully!');
    }

    /**
     * Display the specified staff member.
     */
    public function show(User $staff): Response
    {
        $this->ensureUserType($staff, 'mechanic');

        // Load staff data with relationships
        $staff->load([
            'assignedWorkOrders.motorcycle.motorcycleModel',
            'assignedWorkOrders.user',
            'workSessions'
        ]);

        // Format staff data using base controller method
        $staffData = $this->formatDetailedUserData($staff);

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
        $this->ensureUserType($staff, 'mechanic');

        return Inertia::render('admin/staff/edit', [
            'staff' => $this->formatBasicUserData($staff),
        ]);
    }

    /**
     * Update the specified staff member.
     */
    public function update(UserUpdateRequest $request, User $staff): RedirectResponse
    {
        $this->ensureUserType($staff, 'mechanic');

        $staff->update($request->validated());

        return $this->successRedirect('admin.staff.show', $staff, 'Staff member updated successfully!');
    }

    /**
     * Remove the specified staff member.
     */
    public function destroy(User $staff): RedirectResponse
    {
        $this->ensureUserType($staff, 'mechanic');

        $deleteCheck = $this->canDeleteUser($staff);
        
        if (!$deleteCheck['canDelete']) {
            return $this->errorRedirect('admin.staff.index', null, $deleteCheck['message']);
        }

        $staff->delete();

        return $this->successRedirect('admin.staff.index', null, 'Staff member deleted successfully!');
    }
} 