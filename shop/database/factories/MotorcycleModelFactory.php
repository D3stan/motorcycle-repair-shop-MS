<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\MotorcycleModel>
 */
class MotorcycleModelFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $brands = ['Yamaha', 'Honda', 'Ducati', 'BMW', 'Kawasaki', 'Suzuki', 'Aprilia', 'KTM', 'Triumph', 'Harley-Davidson'];
        $segments = ['sport', 'touring', 'naked', 'cruiser', 'adventure', 'enduro', 'scooter'];
        
        $brand = fake()->randomElement($brands);
        $engineSize = fake()->randomElement([125, 250, 300, 500, 600, 650, 750, 900, 1000, 1200, 1300, 1400]);
        
        return [
            'brand' => $brand,
            'name' => $this->generateModelName($brand),
            'model_code' => fake()->unique()->regexify('[A-Z]{2}[0-9]{4}'),
            'engine_size' => $engineSize,
            'segment' => fake()->randomElement($segments),
            'power' => $this->calculatePower($engineSize),
        ];
    }

    private function generateModelName($brand): string
    {
        $models = [
            'Yamaha' => ['YZF-R1', 'MT-07', 'XSR900', 'Tracer 900', 'Tenere 700'],
            'Honda' => ['CBR1000RR', 'CB650R', 'Africa Twin', 'NC750X', 'Rebel 500'],
            'Ducati' => ['Panigale V4', 'Monster 821', 'Multistrada V4', 'Scrambler', 'Diavel'],
            'BMW' => ['S1000RR', 'R1250GS', 'F850GS', 'R NineT', 'K1600GT'],
            'Kawasaki' => ['Ninja ZX-10R', 'Z900', 'Versys 650', 'W800', 'Vulcan S'],
            'Suzuki' => ['GSX-R1000', 'V-Strom 650', 'SV650', 'Katana', 'Burgman 400'],
            'Aprilia' => ['RSV4', 'Tuono V4', 'Shiver 900', 'Caponord 1200', 'RS 125'],
            'KTM' => ['1290 Super Duke R', '790 Adventure', '690 Duke', '1290 Super Adventure', 'RC 390'],
            'Triumph' => ['Street Triple', 'Tiger 900', 'Bonneville T120', 'Speed Twin', 'Rocket 3'],
            'Harley-Davidson' => ['Sportster Iron 883', 'Street Glide', 'Fat Boy', 'Road King', 'Pan America'],
        ];

        return fake()->randomElement($models[$brand] ?? ['Model ' . fake()->randomNumber(3)]);
    }

    private function calculatePower($engineSize): int
    {
        // Rough power calculation based on engine size
        $basePower = $engineSize * 0.8;
        return (int) fake()->numberBetween($basePower * 0.7, $basePower * 1.3);
    }
} 