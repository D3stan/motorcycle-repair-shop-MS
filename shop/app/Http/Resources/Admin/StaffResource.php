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
                fn() => $this->assignedWorkOrders->whereIn('status', ['pending', 'in_progress'])->count()
            ),
        ]);
    }
} 