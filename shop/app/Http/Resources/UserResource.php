<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'full_name' => $this->full_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'tax_code' => $this->tax_code,
            'type' => $this->type,
            'created_at' => $this->created_at->format('Y-m-d'),
            'created_at_detailed' => $this->created_at->format('Y-m-d H:i'),
        ];
    }
} 