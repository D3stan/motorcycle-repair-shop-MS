<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Status>
 */
class StatusFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $workOrderStatuses = [
            ['name' => 'Pending', 'description' => 'Work order created, waiting to be assigned', 'color' => '#FFC107'],
            ['name' => 'Assigned', 'description' => 'Work order assigned to mechanic', 'color' => '#17A2B8'],
            ['name' => 'In Progress', 'description' => 'Work is currently being performed', 'color' => '#007BFF'],
            ['name' => 'Waiting Parts', 'description' => 'Work paused waiting for parts', 'color' => '#FD7E14'],
            ['name' => 'Quality Check', 'description' => 'Work completed, undergoing quality check', 'color' => '#6F42C1'],
            ['name' => 'Completed', 'description' => 'Work order completed successfully', 'color' => '#28A745'],
            ['name' => 'Cancelled', 'description' => 'Work order cancelled', 'color' => '#DC3545'],
        ];

        $status = fake()->randomElement($workOrderStatuses);

        return [
            'name' => $status['name'],
            'description' => $status['description'],
            'color' => $status['color'],
            'type' => 'work_order',
            'is_active' => true,
            'sort_order' => fake()->numberBetween(1, 10),
        ];
    }
} 