<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\MotorcycleModel;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Motorcycle>
 */
class MotorcycleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'NumTelaio' => fake()->unique()->regexify('[A-HJ-NPR-Z0-9]{17}'), // VIN format
            'Targa' => fake()->unique()->regexify('[A-Z]{2}[0-9]{3}[A-Z]{2}'), // Italian plate format
            'AnnoImmatricolazione' => fake()->numberBetween(2000, 2024),
            'Note' => fake()->optional()->sentence(),
            'CodiceModello' => MotorcycleModel::factory(),
            'CF' => User::factory()->customer(),
        ];
    }
} 