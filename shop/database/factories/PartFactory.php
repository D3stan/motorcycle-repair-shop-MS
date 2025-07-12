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
        $brands = ['OEM', 'Brembo', 'Ohlins', 'NGK', 'Pirelli', 'Akrapovic', 'K&N', 'Puig'];
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
        $partName = fake()->randomElement($partTypes[$category]);
        $supplierPrice = fake()->randomFloat(2, 5, 500);
        
        return [
            'CodiceRicambio' => fake()->unique()->regexify('[A-Z]{2}[0-9]{8}'),
            'Marca' => fake()->randomElement($brands),
            'Nome' => $partName,
            'Descrizione' => fake()->optional()->sentence(),
            'PrezzoFornitore' => $supplierPrice,
            'PrezzoVendita' => $supplierPrice * fake()->randomFloat(2, 1.2, 2.5), // 20-150% markup
            'Categoria' => $category,
            'QuantitaDisponibile' => fake()->numberBetween(0, 100),
            'ScortaMinima' => fake()->numberBetween(1, 20),
            'CodiceFornitore' => Supplier::factory(),
        ];
    }
} 