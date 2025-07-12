<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\WorkOrder;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Invoice>
 */
class InvoiceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $issueDate = fake()->dateTimeBetween('-1 year', 'now');
        $dueDate = (clone $issueDate)->modify('+30 days');
        $amount = fake()->randomFloat(2, 100, 2000);

        return [
            'CodiceFattura' => fake()->unique()->regexify('INV[0-9]{6}'),
            'DataEmissione' => $issueDate,
            'DataScadenza' => $dueDate,
            'Importo' => $amount,
            'Stato' => fake()->randomElement(['pending', 'paid', 'overdue']),
            'DataPagamento' => fake()->boolean(70) ? fake()->dateTimeBetween($issueDate, 'now') : null,
            'CF' => User::factory()->customer(),
            'CodiceIntervento' => WorkOrder::factory(),
            'CodiceSessione' => null, // Will be set manually when needed
        ];
    }

    /**
     * Create an invoice from a work order with proper totals.
     */
    public function forWorkOrder(WorkOrder $workOrder): static
    {
        $amount = fake()->randomFloat(2, 100, 2000);

        return $this->state([
            'CF' => $workOrder->user->CF,
            'CodiceIntervento' => $workOrder->CodiceIntervento,
            'Importo' => $amount,
        ]);
    }

    /**
     * Create a paid invoice.
     */
    public function paid(): static
    {
        return $this->state(fn (array $attributes) => [
            'Stato' => 'paid',
            'DataPagamento' => fake()->dateTimeBetween($attributes['DataEmissione'] ?? '-6 months', '-1 day'),
        ]);
    }

    /**
     * Create an overdue invoice.
     */
    public function overdue(): static
    {
        return $this->state(fn (array $attributes) => [
            'Stato' => 'overdue',
            'DataScadenza' => fake()->dateTimeBetween('-2 months', '-1 day')->format('Y-m-d'),
            'DataPagamento' => null,
        ]);
    }
} 