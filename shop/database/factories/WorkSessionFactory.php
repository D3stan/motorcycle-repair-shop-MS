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
        // Generate dates before today
        $workDate = fake()->dateTimeBetween('-6 months', '-1 day');
        $hoursWorked = fake()->randomFloat(2, 0.5, 8);
        
        // Random status based on probability
        $stato = fake()->randomElement(['pending', 'in_progress', 'completed']);

        return [
            'CodiceSessione' => fake()->unique()->regexify('SES[0-9]{6}'),
            'Data' => $workDate,
            'Stato' => $stato,
            'OreImpiegate' => $hoursWorked,
            'Note' => fake()->optional()->sentence(),
            'NumTelaio' => Motorcycle::factory(),
        ];
    }

    /**
     * Create a pending session.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'Data' => fake()->dateTimeBetween('-2 days', '+1 week'),
            'Stato' => 'pending',
            'OreImpiegate' => 0,
        ]);
    }

    /**
     * Create an in-progress session.
     */
    public function inProgress(): static
    {
        return $this->state(fn (array $attributes) => [
            'Data' => fake()->dateTimeBetween('-1 week', 'today'),
            'Stato' => 'in_progress',
            'OreImpiegate' => fake()->randomFloat(2, 0.5, 4),
        ]);
    }

    /**
     * Create a completed session.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'Data' => fake()->dateTimeBetween('-6 months', '-2 days'),
            'Stato' => 'completed',
            'OreImpiegate' => fake()->randomFloat(2, 1, 8),
        ]);
    }
} 