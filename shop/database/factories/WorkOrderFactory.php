<?php

namespace Database\Factories;

use App\Models\Motorcycle;
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

        // Generate dates before today
        $startDate = fake()->dateTimeBetween('-6 months', '-1 week');
        $endDate = fake()->boolean(70) ? fake()->dateTimeBetween($startDate, '-1 day') : null;
        $hoursWorked = $endDate ? fake()->randomFloat(2, 0.5, 8) : 0;
        
        // Determine status based on dates
        $stato = 'pending';
        if ($startDate && $endDate) {
            $stato = 'completed';
        } elseif ($startDate) {
            $stato = 'in_progress';
        }

        $workTypes = ['manutenzione_ordinaria', 'manutenzione_straordinaria'];

        return [
            'CodiceIntervento' => fake()->unique()->regexify('WO[0-9]{6}'),
            'DataInizio' => $startDate,
            'DataFine' => $endDate,
            'KmMoto' => fake()->numberBetween(0, 120000),
            'Tipo' => fake()->randomElement($workTypes),
            'Stato' => $stato,
            'Causa' => fake()->optional()->words(3, true),
            'OreImpiegate' => $hoursWorked,
            'Note' => fake()->randomElement($descriptions),
            'Nome' => fake()->sentence(3),
            'NumTelaio' => Motorcycle::factory(),
        ];
    }

    /**
     * Create a pending work order.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'DataInizio' => null,
            'DataFine' => null,
            'Stato' => 'pending',
            'OreImpiegate' => 0,
        ]);
    }

    /**
     * Create an in-progress work order.
     */
    public function inProgress(): static
    {
        return $this->state(fn (array $attributes) => [
            'DataInizio' => fake()->dateTimeBetween('-2 weeks', '-1 day'),
            'DataFine' => null,
            'Stato' => 'in_progress',
            'OreImpiegate' => fake()->randomFloat(2, 0.5, 4),
        ]);
    }

    /**
     * Create a completed work order.
     */
    public function completed(): static
    {
        $startDate = fake()->dateTimeBetween('-6 months', '-2 days');
        return $this->state(fn (array $attributes) => [
            'DataInizio' => $startDate,
            'DataFine' => fake()->dateTimeBetween($startDate, '-1 day'),
            'Stato' => 'completed',
            'OreImpiegate' => fake()->randomFloat(2, 1, 8),
        ]);
    }
} 