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
        $issueDate = fake()->dateTimeBetween('-6 months', '-1 day');
        $dueDate = (clone $issueDate)->modify('+30 days');
        
        // Generate realistic subtotal range - will be overridden when used with actual work orders
        $subtotal = fake()->randomFloat(2, 100, 1000);
        $taxRate = 0.22; // 22% VAT (Italian standard)
        $taxAmount = round($subtotal * $taxRate, 2);
        $totalAmount = round($subtotal + $taxAmount, 2);
        
        $status = fake()->randomElement(['pending', 'paid', 'overdue', 'cancelled']);
        $paidAt = $status === 'paid' ? fake()->dateTimeBetween($issueDate, '-1 day') : null;

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