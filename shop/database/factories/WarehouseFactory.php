<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Warehouse>
 */
class WarehouseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $locations = [
            'Main Storage - Ground Floor',
            'Parts Storage - Basement',
            'Engine Parts - Section A',
            'Body Parts - Section B',
            'Small Parts - Shelving Unit',
            'Used Parts - Back Storage',
            'New Arrivals - Temporary',
            'High Value - Secure Storage'
        ];

        return [
            'CodiceMagazzino' => fake()->unique()->regexify('WH[0-9]{3}'),
        ];
    }
} 