<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Motorcycle;
use App\Models\Appointment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\WorkOrder>
 */
class WorkOrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $descriptions = [
            'Oil change and filter replacement',
            'Brake pad replacement - front and rear',
            'Chain and sprocket maintenance',
            'Engine diagnostic and tune-up',
            'Suspension adjustment and inspection',
            'Electrical system troubleshooting',
            'Tire replacement and wheel balancing',
            'Valve adjustment and timing check',
            'Carburetor cleaning and adjustment',
            'Fork seal replacement',
            'Clutch adjustment and inspection',
            'Cooling system flush and refill'
        ];

        $startDate = fake()->dateTimeBetween('-6 months', '-1 week');
        $status = fake()->randomElement(['pending', 'in_progress', 'completed', 'cancelled']);
        $laborCost = fake()->randomFloat(2, 50, 300);
        $partsCost = fake()->randomFloat(2, 0, 500);

        return [
            'user_id' => User::factory()->customer(),
            'motorcycle_id' => Motorcycle::factory(),
            'appointment_id' => fake()->boolean(70) ? Appointment::factory() : null,
            'description' => fake()->randomElement($descriptions),
            'status' => $status,
            'started_at' => in_array($status, ['in_progress', 'completed']) ? $startDate : null,
            'completed_at' => $status === 'completed' ? fake()->dateTimeBetween($startDate, '-1 day') : null,
            'labor_cost' => $laborCost,
            'parts_cost' => $partsCost,
            'total_cost' => $laborCost + $partsCost,
            'notes' => fake()->optional()->sentence(),
        ];
    }

    /**
     * Create a pending work order.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'started_at' => null,
            'completed_at' => null,
        ]);
    }

    /**
     * Create an in-progress work order.
     */
    public function inProgress(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'in_progress',
            'started_at' => fake()->dateTimeBetween('-2 weeks', '-1 day'),
            'completed_at' => null,
        ]);
    }

    /**
     * Create a completed work order.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'started_at' => fake()->dateTimeBetween('-6 months', '-2 days'),
            'completed_at' => fake()->dateTimeBetween($attributes['started_at'] ?? '-6 months', '-1 day'),
        ]);
    }
} 