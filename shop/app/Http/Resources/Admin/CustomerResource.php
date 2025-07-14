<?php

namespace App\Http\Resources\Admin;

use App\Http\Resources\UserResource;
use Illuminate\Http\Request;

class CustomerResource extends UserResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return array_merge(parent::toArray($request), [
            'motorcycles_count' => $this->whenCounted('motorcycles'),
            'appointments_count' => $this->whenCounted('appointments'),
            'work_orders_count' => $this->whenCounted('workOrders'),
            'invoices_count' => $this->whenCounted('invoices'),
            'pending_invoices_count' => $this->when(
                $this->relationLoaded('invoices'),
                fn() => 0 // Status field not available in FATTURE schema
            ),
        ]);
    }
} 