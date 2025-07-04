<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Motorcycle;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Appointment>
 */
class AppointmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $appointmentDate = fake()->dateTimeBetween('-2 months', '+2 months');
        
        return [
            'user_id' => User::factory()->customer(),
            'motorcycle_id' => Motorcycle::factory(),
            'appointment_date' => $appointmentDate->format('Y-m-d'),
            'appointment_time' => fake()->time('H:i:s'),
            'type' => fake()->randomElement(['maintenance', 'dyno_testing']),
            'status' => fake()->randomElement(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']),
            'notes' => fake()->optional()->sentence(),
        ];
    }

    /**
     * Create an upcoming appointment.
     */
    public function upcoming(): static
    {
        return $this->state(fn (array $attributes) => [
            'appointment_date' => fake()->dateTimeBetween('tomorrow', '+1 month')->format('Y-m-d'),
            'status' => fake()->randomElement(['pending', 'confirmed']),
        ]);
    }

    /**
     * Create a completed appointment.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'appointment_date' => fake()->dateTimeBetween('-2 months', 'yesterday')->format('Y-m-d'),
            'status' => 'completed',
        ]);
    }
} 