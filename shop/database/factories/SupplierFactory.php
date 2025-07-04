<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Supplier>
 */
class SupplierFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $companies = [
            'Motosport Components Srl',
            'Ricambi Moto Italia SpA',
            'Euro Parts Distribution',
            'Speedway Supply Co.',
            'Racing Components Ltd',
            'Motorcycle Parts Express',
            'Italian Bike Parts',
            'Continental Moto Supply',
            'Performance Parts Pro',
            'Bike Tech Solutions'
        ];

        return [
            'supplier_code' => fake()->unique()->regexify('SUP[0-9]{4}'),
            'name' => fake()->randomElement($companies),
            'phone' => fake()->phoneNumber(),
            'email' => fake()->unique()->companyEmail(),
            'address' => fake()->streetAddress(),
            'city' => fake()->city(),
            'postal_code' => fake()->postcode(),
            'country' => fake()->randomElement(['Italy', 'Germany', 'France', 'Spain', 'UK']),
            'notes' => fake()->optional()->sentence(),
        ];
    }
} 