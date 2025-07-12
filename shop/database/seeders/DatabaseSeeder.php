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

        // Create STOCCAGGI relationships (Parts in Warehouses) with Quantita
        $parts->each(function ($part) use ($warehouses) {
            $randomWarehouses = $warehouses->random(rand(1, 2));
            foreach ($randomWarehouses as $warehouse) {
                DB::table('STOCCAGGI')->insert([
                    'CodiceMagazzino' => $warehouse->CodiceMagazzino,
                    'CodiceRicambio' => $part->CodiceRicambio,
                    'Quantita' => rand(0, 50),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        });

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

        // Create appointments
        $appointments = collect();
        $customers->take(15)->each(function ($customer) use ($motorcycles, &$appointments) {
            $customerMotorcycles = $motorcycles->where('CF', $customer->CF);
            if ($customerMotorcycles->isNotEmpty()) {
                $appointmentData = Appointment::factory()
                    ->count(rand(1, 2))
                    ->make([
                        'CF' => $customer->CF,
                        'NumTelaio' => $customerMotorcycles->random()->NumTelaio,
                    ]);
                
                foreach ($appointmentData as $appointment) {
                    $createdAppointment = Appointment::create($appointment->toArray());
                    $appointments->push($createdAppointment);
                }
            }
        });

        // Create work orders
        $workOrders = collect();
        $customers->take(12)->each(function ($customer) use ($motorcycles, $appointments, &$workOrders) {
            $customerMotorcycles = $motorcycles->where('CF', $customer->CF);
            if ($customerMotorcycles->isNotEmpty()) {
                $motorcycle = $customerMotorcycles->random();
                $appointment = $appointments->where('CF', $customer->CF)->where('NumTelaio', $motorcycle->NumTelaio)->first();
                
                $workOrderData = WorkOrder::factory()
                    ->count(rand(1, 2))
                    ->make([
                        'CF' => $customer->CF,
                        'NumTelaio' => $motorcycle->NumTelaio,
                        'CodiceAppuntamento' => $appointment?->CodiceAppuntamento ?? null,
                    ]);
                
                foreach ($workOrderData as $workOrder) {
                    $createdWorkOrder = WorkOrder::create($workOrder->toArray());
                    $workOrders->push($createdWorkOrder);
                }
            }
        });

        // Create work sessions for some work orders
        $workSessions = collect();
        $workOrders->take(8)->each(function ($workOrder) use (&$workSessions) {
            $sessionData = WorkSession::factory()
                ->count(rand(1, 3))
                ->make([
                    'NumTelaio' => $workOrder->NumTelaio,
                ]);
            
            foreach ($sessionData as $session) {
                $createdSession = WorkSession::create($session->toArray());
                $workSessions->push($createdSession);
            }
        });

        // Assign mechanics to work orders (SVOLGIMENTI table)
        $workOrders->each(function ($workOrder) use ($mechanics) {
            $assignedMechanics = $mechanics->random(rand(1, 2));
            $mechanicData = [];
            
            foreach ($assignedMechanics as $mechanic) {
                $mechanicData[$mechanic->CF] = [
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            
            $workOrder->mechanics()->attach($mechanicData);
        });

        // Assign mechanics to work sessions (AFFIANCAMENTI table)
        $workSessions->each(function ($workSession) use ($mechanics) {
            $assignedMechanics = $mechanics->random(rand(1, 2));
            $mechanicData = [];
            
            foreach ($assignedMechanics as $mechanic) {
                $mechanicData[$mechanic->CF] = [
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            
            $workSession->mechanics()->attach($mechanicData);
        });

        // Create UTILIZZI relationships (Parts used in Work Orders)
        $workOrders->each(function ($workOrder) use ($parts) {
            $usedParts = $parts->random(rand(0, 5));
            foreach ($usedParts as $part) {
                DB::table('UTILIZZI')->insert([
                    'CodiceRicambio' => $part->CodiceRicambio,
                    'CodiceIntervento' => $workOrder->CodiceIntervento,
                    'Quantita' => rand(1, 5),
                    'Prezzo' => $part->PrezzoVendita,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        });

        // Create invoices for completed work orders
        $completedWorkOrders = $workOrders->where('Stato', 'completed');
        $completedWorkOrders->each(function ($workOrder) {
            Invoice::factory()->create([
                'CF' => $workOrder->CF,
                'CodiceIntervento' => $workOrder->CodiceIntervento,
                'CodiceSessione' => null, // Will be linked to sessions later if needed
            ]);
        });

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        
        $this->command->info('Database seeded successfully!');
        $this->command->info('Admin user created: admin@shop.com (password: password)');
        $this->command->info("Created {$customers->count()} customers, {$mechanics->count()} mechanics");
        $this->command->info("Created {$motorcycles->count()} motorcycles from {$motorcycleModels->count()} models");
        $this->command->info("Created {$parts->count()} parts from {$suppliers->count()} suppliers");
        $this->command->info("Created {$appointments->count()} appointments");
        $this->command->info("Created {$workOrders->count()} work orders");
        $this->command->info("Created {$workSessions->count()} work sessions");
        $this->command->info("Italian schema structure populated successfully!");
    }
}
