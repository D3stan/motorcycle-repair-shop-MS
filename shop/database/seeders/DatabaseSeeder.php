<?php

namespace Database\Seeders;

use App\Models\{
    User,
    MotorcycleModel,
    Motorcycle,
    Supplier,
    Part,
    Warehouse,
    WorkSession,
    Appointment,
    WorkOrder,
    Invoice
};
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        
        // Create admin user
        $admin = User::factory()->admin()->create([
            'first_name' => 'Admin',
            'last_name' => 'User',
            'email' => 'admin@shop.com',
            'CF' => 'ADMIN001234567890',
            'phone' => '+39 123 456 7890',
        ]);

        // Create mechanics
        $mechanics = User::factory()->mechanic()->count(5)->create();

        // Create customers
        $customers = User::factory()->customer()->count(20)->create();

        // Create motorcycle models
        $motorcycleModels = MotorcycleModel::factory()->count(25)->create();

        // Create suppliers
        $suppliers = Supplier::factory()->count(8)->create();

        // Create warehouses
        $warehouses = Warehouse::factory()->count(3)->create();

        // Create parts
        $parts = Part::factory()->count(100)->create();

        // Create motorcycles for customers
        $motorcycles = collect();
        $customers->each(function ($customer) use ($motorcycleModels, &$motorcycles) {
            $customerMotorcycles = Motorcycle::factory()
                ->count(rand(1, 3))
                ->create([
                    'CF' => $customer->CF,
                    'CodiceModello' => $motorcycleModels->random()->CodiceModello,
                ]);
            $motorcycles = $motorcycles->merge($customerMotorcycles);
        });

        // Create appointments - TEMPORARY COMMENT OUT TO TEST BASIC STRUCTURE
        $appointments = collect();
        // TODO: Fix appointments after updating Appointment model and factory

        // TEMPORARY COMMENT OUT COMPLEX PARTS TO TEST BASIC STRUCTURE
        $workOrders = collect();
        $workSessions = collect();
        // TODO: Update factories and relationships after models are complete

        // Create basic test data manually for now
        $this->command->info('Creating basic test data...');

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        
        $this->command->info('Database seeded successfully!');
        $this->command->info('Admin user created: admin@shop.com (password: password)');
        $this->command->info("Created {$customers->count()} customers, {$mechanics->count()} mechanics");
        $this->command->info("Created {$motorcycles->count()} motorcycles from {$motorcycleModels->count()} models");
        $this->command->info("Created {$parts->count()} parts from {$suppliers->count()} suppliers");
        $this->command->info("Basic Italian schema structure created successfully!");
    }



    // TEMPORARY COMMENT OUT - TODO: Implement relationships after updating all factories
    /*
    private function createRelationships($workOrders, $mechanics, $parts, $motorcycleModels, $warehouses, $workSessions): void
    {
        // TODO: Update for Italian schema relationships
    }
    */
}
