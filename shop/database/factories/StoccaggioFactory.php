<?php

namespace Database\Factories;

use App\Models\Warehouse;
use App\Models\Part;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Stoccaggio>
 */
class StoccaggioFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'CodiceMagazzino' => Warehouse::factory(),
            'CodiceRicambio' => Part::factory(),
            'Quantita' => fake()->numberBetween(0, 100),
            'QuantitaMinima' => fake()->numberBetween(5, 20),
        ];
    }

    /**
     * Create a low stock item (quantity below minimum).
     */
    public function lowStock(): static
    {
        return $this->state(function (array $attributes) {
            $minQuantity = fake()->numberBetween(10, 25);
            return [
                'QuantitaMinima' => $minQuantity,
                'Quantita' => fake()->numberBetween(0, $minQuantity - 1),
            ];
        });
    }

    /**
     * Create a well-stocked item.
     */
    public function wellStocked(): static
    {
        return $this->state(function (array $attributes) {
            $minQuantity = fake()->numberBetween(5, 15);
            return [
                'QuantitaMinima' => $minQuantity,
                'Quantita' => fake()->numberBetween($minQuantity + 10, $minQuantity + 50),
            ];
        });
    }

    /**
     * Create an out of stock item.
     */
    public function outOfStock(): static
    {
        return $this->state(fn (array $attributes) => [
            'Quantita' => 0,
            'QuantitaMinima' => fake()->numberBetween(5, 20),
        ]);
    }

    /**
     * For a specific warehouse and part combination.
     */
    public function forWarehouseAndPart(string $warehouseCode, string $partCode): static
    {
        return $this->state(fn (array $attributes) => [
            'CodiceMagazzino' => $warehouseCode,
            'CodiceRicambio' => $partCode,
        ]);
    }
}