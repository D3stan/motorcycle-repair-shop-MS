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
        $amount = fake()->randomFloat(2, 100, 2000);

        return [
            'CodiceFattura' => fake()->unique()->regexify('INV[0-9]{6}'),
            'Importo' => $amount,
            'Data' => $issueDate,
            'Note' => fake()->optional()->sentence(),
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
} 