<?php

namespace Database\Factories;

use App\Models\Supplier;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Part>
 */
class PartFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categories = ['Engine', 'Brake', 'Suspension', 'Electrical', 'Body', 'Transmission', 'Exhaust', 'Fuel System'];
        $partTypes = [
            'Engine' => ['Piston', 'Cylinder Head', 'Valve', 'Spark Plug', 'Oil Filter', 'Gasket'],
            'Brake' => ['Brake Pad', 'Brake Disc', 'Brake Fluid', 'Brake Line', 'Caliper'],
            'Suspension' => ['Shock Absorber', 'Fork Spring', 'Swing Arm', 'Bearing'],
            'Electrical' => ['Battery', 'Starter Motor', 'Alternator', 'Wiring Harness', 'ECU'],
            'Body' => ['Fairing', 'Tank', 'Seat', 'Mirror', 'Windshield'],
            'Transmission' => ['Chain', 'Sprocket', 'Clutch Plate', 'Gear'],
            'Exhaust' => ['Muffler', 'Exhaust Pipe', 'Gasket'],
            'Fuel System' => ['Fuel Pump', 'Injector', 'Fuel Filter', 'Carburetor']
        ];

        $category = fake()->randomElement($categories);
        $partType = fake()->randomElement($partTypes[$category]);
        $supplierPrice = fake()->randomFloat(2, 10, 500);

        return [
            'CodiceRicambio' => fake()->unique()->regexify('PRT[0-9]{6}'),
            'Marca' => fake()->randomElement(['OEM', 'Bosch', 'Brembo', 'Ohlins', 'NGK', 'Akrapovic', 'K&N']),
            'Nome' => $partType,
            'Descrizione' => fake()->optional()->sentence(),
            'PrezzoFornitore' => $supplierPrice,
            'CodiceFornitore' => Supplier::factory(),
        ];
    }
} 