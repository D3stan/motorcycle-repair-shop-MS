<?php

namespace App\Http\Resources\Admin;

use App\Http\Resources\UserResource;
use Illuminate\Http\Request;

class StaffResource extends UserResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return array_merge(parent::toArray($request), [
            'assigned_work_orders_count' => $this->whenCounted('assignedWorkOrders'),
            'active_work_orders_count' => $this->when(
                $this->relationLoaded('assignedWorkOrders'),
                fn() => $this->assignedWorkOrders->filter(function ($workOrder) {
                    // A work order is active if it's not completed (no DataFine)
                    return !$workOrder->DataFine;
                })->count()
            ),
        ]);
    }
} 