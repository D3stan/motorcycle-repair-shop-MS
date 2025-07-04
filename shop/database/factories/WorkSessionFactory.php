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
        $startTime = fake()->dateTimeBetween('-6 months', 'now');
        $hoursWorked = fake()->randomFloat(2, 0.5, 8);
        $endTime = (clone $startTime)->modify("+{$hoursWorked} hours");

        return [
            'session_code' => fake()->unique()->regexify('SES[0-9]{6}'),
            'motorcycle_id' => Motorcycle::factory(),
            'start_time' => $startTime,
            'end_time' => fake()->boolean(80) ? $endTime : null, // 80% completed sessions
            'hours_worked' => $hoursWorked,
            'notes' => fake()->optional()->sentence(),
            'session_type' => fake()->randomElement(['maintenance', 'dyno', 'diagnosis', 'repair', 'inspection']),
        ];
    }

    /**
     * Create an active session (no end time).
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'end_time' => null,
            'start_time' => fake()->dateTimeBetween('-8 hours', 'now'),
        ]);
    }
} 