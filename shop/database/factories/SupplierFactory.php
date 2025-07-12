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
            'CodiceFornitore' => fake()->unique()->regexify('SUP[0-9]{4}'),
            'Nome' => fake()->randomElement($companies),
            'Telefono' => fake()->phoneNumber(),
            'Email' => fake()->unique()->companyEmail(),
        ];
    }
} 