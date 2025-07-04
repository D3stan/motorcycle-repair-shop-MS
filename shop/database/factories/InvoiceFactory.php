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
        $issueDate = fake()->dateTimeBetween('-6 months', 'now');
        $dueDate = (clone $issueDate)->modify('+30 days');
        $subtotal = fake()->randomFloat(2, 100, 1000);
        $taxRate = 0.22; // 22% VAT (Italian standard)
        $taxAmount = $subtotal * $taxRate;
        $totalAmount = $subtotal + $taxAmount;
        
        $status = fake()->randomElement(['pending', 'paid', 'overdue', 'cancelled']);
        $paidAt = $status === 'paid' ? fake()->dateTimeBetween($issueDate, 'now') : null;

        return [
            'user_id' => User::factory()->customer(),
            'work_order_id' => WorkOrder::factory()->completed(),
            'invoice_number' => fake()->unique()->regexify('INV[0-9]{6}'),
            'issue_date' => $issueDate->format('Y-m-d'),
            'due_date' => $dueDate->format('Y-m-d'),
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'total_amount' => $totalAmount,
            'status' => $status,
            'paid_at' => $paidAt,
        ];
    }

    /**
     * Create a paid invoice.
     */
    public function paid(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'paid',
            'paid_at' => fake()->dateTimeBetween($attributes['issue_date'] ?? '-6 months', 'now'),
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