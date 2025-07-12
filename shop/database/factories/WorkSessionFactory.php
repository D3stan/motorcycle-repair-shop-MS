<?php

namespace Database\Factories;

use App\Models\Motorcycle;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\WorkSession>
 */
class WorkSessionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startTime = fake()->dateTimeBetween('-6 months', '-1 day');
        $hoursWorked = fake()->randomFloat(2, 0.5, 8);

        return [
            'CodiceSessione' => fake()->unique()->regexify('SES[0-9]{6}'),
            'NumTelaio' => Motorcycle::factory(),
            'DataInizio' => $startTime,
            'OreImpiegate' => $hoursWorked,
            'Note' => fake()->optional()->sentence(),
        ];
    }

    /**
     * Create an active session.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'DataInizio' => fake()->dateTimeBetween('-8 hours', '-1 hour'),
        ]);
    }
} 