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
        $appointmentDate = fake()->dateTimeBetween('now', '+3 months');
        $appointmentTime = fake()->time('H:i:s');
        
        return [
            'CodiceAppuntamento' => fake()->unique()->regexify('APP[0-9]{6}'),
            'DataAppuntamento' => $appointmentDate,
            'Ora' => $appointmentDate->format('Y-m-d') . ' ' . $appointmentTime,
            'Tipo' => fake()->randomElement(['maintenance', 'repair', 'inspection', 'consultation']),
            'Stato' => fake()->randomElement(['scheduled', 'confirmed', 'completed', 'cancelled']),
            'Note' => fake()->optional()->sentence(),
            'CF' => User::factory()->customer(),
            'NumTelaio' => Motorcycle::factory(),
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