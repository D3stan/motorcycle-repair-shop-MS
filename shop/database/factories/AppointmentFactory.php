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
        $appointmentTime = fake()->time('H:i');
        
        return [
            'CodiceAppuntamento' => fake()->unique()->regexify('APP[0-9]{6}'),
            'DataAppuntamento' => $appointmentDate,
            'Descrizione' => fake()->sentence(),
            'Tipo' => fake()->randomElement(['maintenance', 'dyno_testing']),
            'CF' => User::factory()->customer(),
        ];
    }

    /**
     * Create an upcoming appointment.
     */
    public function upcoming(): static
    {
        return $this->state(fn (array $attributes) => [
            'DataAppuntamento' => fake()->dateTimeBetween('tomorrow', '+1 month'),
        ]);
    }

    /**
     * Create a past appointment.
     */
    public function past(): static
    {
        return $this->state(fn (array $attributes) => [
            'DataAppuntamento' => fake()->dateTimeBetween('-2 months', 'yesterday'),
        ]);
    }
} 