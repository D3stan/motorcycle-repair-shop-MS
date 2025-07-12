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
        $subtotal = round((float) $workOrder->total_cost, 2);
        $taxRate = 0.22; // 22% VAT (Italian standard)
        $taxAmount = round($subtotal * $taxRate, 2);
        $totalAmount = round($subtotal + $taxAmount, 2);

        return $this->state([
            'user_id' => $workOrder->motorcycle->user_id,
            'work_order_id' => $workOrder->id,
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'total_amount' => $totalAmount,
        ]);
    }

    /**
     * Create a paid invoice.
     */
    public function paid(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'paid',
            'paid_at' => fake()->dateTimeBetween($attributes['issue_date'] ?? '-6 months', '-1 day'),
        ]);
    }

    /**
     * Create an overdue invoice.
     */
    public function overdue(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'overdue',
            'due_date' => fake()->dateTimeBetween('-2 months', '-1 day')->format('Y-m-d'),
            'paid_at' => null,
        ]);
    }
} 