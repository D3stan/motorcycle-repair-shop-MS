<?php

namespace Database\Seeders;

use App\Models\{
    User,
    MotorcycleModel,
    Motorcycle,
    Supplier,
    Part,
    Warehouse,
    Stoccaggio,
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

        // Create STOCCAGGI relationships (Parts in Warehouses) using factory
        $stoccaggi = collect();
        $parts->each(function ($part) use ($warehouses, &$stoccaggi) {
            // Each part is stored in 1-2 random warehouses
            $randomWarehouses = $warehouses->random(rand(1, 2));
            foreach ($randomWarehouses as $warehouse) {
                // Create different stock scenarios
                $stockType = fake()->randomElement(['wellStocked', 'lowStock', 'outOfStock']);
                $weights = ['wellStocked' => 70, 'lowStock' => 25, 'outOfStock' => 5];
                $stockType = fake()->randomElement(array_merge(
                    array_fill(0, $weights['wellStocked'], 'wellStocked'),
                    array_fill(0, $weights['lowStock'], 'lowStock'),
                    array_fill(0, $weights['outOfStock'], 'outOfStock')
                ));
                
                $stoccaggio = Stoccaggio::factory()
                    ->forWarehouseAndPart($warehouse->CodiceMagazzino, $part->CodiceRicambio)
                    ->{$stockType}()
                    ->create();
                    
                $stoccaggi->push($stoccaggio);
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
        $customers->take(15)->each(function ($customer) use (&$appointments) {
            $appointmentData = Appointment::factory()
                ->count(rand(1, 2))
                ->make([
                    'CF' => $customer->CF,
                ]);
            
            foreach ($appointmentData as $appointment) {
                $createdAppointment = Appointment::create($appointment->toArray());
                $appointments->push($createdAppointment);
            }
        });

        // Create work orders
        $workOrders = collect();
        $customers->take(12)->each(function ($customer) use ($motorcycles, &$workOrders) {
            $customerMotorcycles = $motorcycles->where('CF', $customer->CF);
            if ($customerMotorcycles->isNotEmpty()) {
                $motorcycle = $customerMotorcycles->random();
                
                $workOrderData = WorkOrder::factory()
                    ->count(rand(1, 2))
                    ->make([
                        'NumTelaio' => $motorcycle->NumTelaio,
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
                // Calculate selling price as markup over supplier price
                $sellingPrice = $part->PrezzoFornitore * fake()->randomFloat(2, 1.2, 2.5);
                
                DB::table('UTILIZZI')->insert([
                    'CodiceRicambio' => $part->CodiceRicambio,
                    'CodiceIntervento' => $workOrder->CodiceIntervento,
                    'Quantita' => rand(1, 5),
                    'Prezzo' => $sellingPrice,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        });

        // Create invoices for completed work (orders, sessions, or both)
        $completedWorkOrders = $workOrders->where('Stato', 'completed');
        $completedWorkSessions = $workSessions->where('Stato', 'completed');
        $invoices = collect();

        // Scenario 1: Invoice for work order only (60% of completed work orders)
        $workOrderOnlyInvoices = $completedWorkOrders->random(min($completedWorkOrders->count(), (int)($completedWorkOrders->count() * 0.6)));
        $workOrderOnlyInvoices->each(function ($workOrder, $index) use ($motorcycles, &$invoices) {
            $motorcycle = $motorcycles->where('NumTelaio', $workOrder->NumTelaio)->first();
            if ($motorcycle) {
                // Mix of current month and recent months invoices
                $isCurrentMonth = $index < 3 || fake()->boolean(40); // First 3 + 40% chance for current month
                $invoiceDate = $isCurrentMonth 
                    ? fake()->dateTimeBetween(now()->startOfMonth(), now())
                    : fake()->dateTimeBetween('-3 months', now());
                    
                $invoice = Invoice::factory()->create([
                    'CF' => $motorcycle->CF,
                    'CodiceIntervento' => $workOrder->CodiceIntervento,
                    'CodiceSessione' => null,
                    'Data' => $invoiceDate,
                ]);
                $invoices->push($invoice);
            }
        });

        // Scenario 2: Invoice for work session only (40% of completed work sessions)
        $workSessionOnlyInvoices = $completedWorkSessions->random(min($completedWorkSessions->count(), (int)($completedWorkSessions->count() * 0.4)));
        $workSessionOnlyInvoices->each(function ($workSession, $index) use ($motorcycles, &$invoices) {
            $motorcycle = $motorcycles->where('NumTelaio', $workSession->NumTelaio)->first();
            if ($motorcycle) {
                // Mix of current month and recent months invoices
                $isCurrentMonth = $index < 2 || fake()->boolean(40); // First 2 + 40% chance for current month
                $invoiceDate = $isCurrentMonth 
                    ? fake()->dateTimeBetween(now()->startOfMonth(), now())
                    : fake()->dateTimeBetween('-3 months', now());
                    
                $invoice = Invoice::factory()->create([
                    'CF' => $motorcycle->CF,
                    'CodiceIntervento' => null,
                    'CodiceSessione' => $workSession->CodiceSessione,
                    'Data' => $invoiceDate,
                ]);
                $invoices->push($invoice);
            }
        });

        // Scenario 3: Invoice for both work order and session (for same motorcycle)
        // Find completed work orders and sessions for the same motorcycle
        $remainingWorkOrders = $completedWorkOrders->diff($workOrderOnlyInvoices);
        $remainingWorkSessions = $completedWorkSessions->diff($workSessionOnlyInvoices);
        
        $combinedInvoices = collect();
        $remainingWorkOrders->each(function ($workOrder, $index) use ($remainingWorkSessions, $motorcycles, &$invoices, &$combinedInvoices) {
            // Find a work session for the same motorcycle
            $matchingSession = $remainingWorkSessions->where('NumTelaio', $workOrder->NumTelaio)->first();
            if ($matchingSession && fake()->boolean(30)) { // 30% chance of combined invoice
                $motorcycle = $motorcycles->where('NumTelaio', $workOrder->NumTelaio)->first();
                if ($motorcycle) {
                    // Mix of current month and recent months invoices
                    $isCurrentMonth = $index < 1 || fake()->boolean(30); // First 1 + 30% chance for current month
                    $invoiceDate = $isCurrentMonth 
                        ? fake()->dateTimeBetween(now()->startOfMonth(), now())
                        : fake()->dateTimeBetween('-3 months', now());
                        
                    $invoice = Invoice::factory()->create([
                        'CF' => $motorcycle->CF,
                        'CodiceIntervento' => $workOrder->CodiceIntervento,
                        'CodiceSessione' => $matchingSession->CodiceSessione,
                        'Data' => $invoiceDate,
                    ]);
                    $invoices->push($invoice);
                    $combinedInvoices->push(['workOrder' => $workOrder, 'session' => $matchingSession]);
                }
            }
        });

        // Create some guaranteed current month invoices for better demo data
        $customers->take(5)->each(function ($customer) use ($motorcycles, &$invoices) {
            $customerMotorcycles = $motorcycles->where('CF', $customer->CF);
            if ($customerMotorcycles->isNotEmpty()) {
                $motorcycle = $customerMotorcycles->first();
                
                // Create a guaranteed current month invoice
                $invoice = Invoice::factory()->create([
                    'CF' => $customer->CF,
                    'CodiceIntervento' => null,
                    'CodiceSessione' => null,
                    'Data' => fake()->dateTimeBetween(now()->startOfMonth(), now()),
                    'Importo' => fake()->randomFloat(2, 200, 1500), // Higher amounts for visibility
                ]);
                $invoices->push($invoice);
            }
        });

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        
        // Calculate invoice statistics
        $workOrderOnlyCount = $workOrderOnlyInvoices->count();
        $workSessionOnlyCount = $workSessionOnlyInvoices->count();
        $combinedCount = $combinedInvoices->count();
        $totalInvoices = $invoices->count();
        
        // Calculate stock statistics
        $wellStockedCount = $stoccaggi->filter(function ($stoccaggio) {
            return $stoccaggio->Quantita > $stoccaggio->QuantitaMinima + 10;
        })->count();
        $lowStockCount = $stoccaggi->filter(function ($stoccaggio) {
            return $stoccaggio->Quantita <= $stoccaggio->QuantitaMinima && $stoccaggio->Quantita > 0;
        })->count();
        $outOfStockCount = $stoccaggi->filter(function ($stoccaggio) {
            return $stoccaggio->Quantita === 0;
        })->count();
        
        $this->command->info('Database seeded successfully!');
        $this->command->info('Admin user created: admin@shop.com (password: password)');
        $this->command->info("Created {$customers->count()} customers, {$mechanics->count()} mechanics");
        $this->command->info("Created {$motorcycles->count()} motorcycles from {$motorcycleModels->count()} models");
        $this->command->info("Created {$parts->count()} parts from {$suppliers->count()} suppliers");
        $this->command->info("Created {$warehouses->count()} warehouses");
        $this->command->info("Created {$stoccaggi->count()} warehouse-part relationships (STOCCAGGI):");
        $this->command->info("  - {$wellStockedCount} well stocked");
        $this->command->info("  - {$lowStockCount} low stock");
        $this->command->info("  - {$outOfStockCount} out of stock");
        $this->command->info("Created {$appointments->count()} appointments");
        $this->command->info("Created {$workOrders->count()} work orders");
        $this->command->info("Created {$workSessions->count()} work sessions");
        $this->command->info("Created {$totalInvoices} invoices:");
        $this->command->info("  - {$workOrderOnlyCount} for work orders only");
        $this->command->info("  - {$workSessionOnlyCount} for work sessions only");
        $this->command->info("  - {$combinedCount} for both work orders and sessions");
        $this->command->info("Italian schema structure populated successfully!");
    }
}
