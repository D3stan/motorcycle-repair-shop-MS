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
        $this->command->info("Created {$mechanics->count()} mechanics with CFs: " . $mechanics->pluck('CF')->implode(', '));

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
                
                // Create 1-2 work orders per customer
                $numWorkOrders = rand(1, 2);
                for ($i = 0; $i < $numWorkOrders; $i++) {
                    try {
                        $createdWorkOrder = WorkOrder::factory()->create([
                            'NumTelaio' => $motorcycle->NumTelaio,
                        ]);
                        $workOrders->push($createdWorkOrder);
                    } catch (\Exception $e) {
                        $this->command->error("Failed to create work order: " . $e->getMessage());
                    }
                }
            }
        });

        // Create work sessions for some work orders
        $workSessions = collect();
        $workOrders->take(8)->each(function ($workOrder) use (&$workSessions) {
            // Create 1-3 work sessions per selected work order
            $numSessions = rand(1, 3);
            for ($i = 0; $i < $numSessions; $i++) {
                $createdSession = WorkSession::factory()->create([
                    'NumTelaio' => $workOrder->NumTelaio,
                ]);
                $workSessions->push($createdSession);
            }
        });

        // Assign mechanics to work orders (SVOLGIMENTI table)  
        $mechanicsAssigned = 0;
        $this->command->info("About to assign mechanics to work orders. Mechanics count: {$mechanics->count()}, Work orders count: {$workOrders->count()}");
        
        $command = $this->command;
        $workOrders->each(function ($workOrder) use ($mechanics, &$mechanicsAssigned, $command) {
            // Ensure we have mechanics to assign
            if ($mechanics->isEmpty()) {
                $command->warn("No mechanics available for assignment!");
                return;
            }
            
            $numMechanics = rand(1, min(2, $mechanics->count()));
            $assignedMechanics = $mechanics->random($numMechanics);
            
            // Convert to collection if single item
            if (!$assignedMechanics instanceof \Illuminate\Support\Collection) {
                $assignedMechanics = collect([$assignedMechanics]);
            }
            
            // Prepare data for pivot table
            $mechanicCFs = [];
            foreach ($assignedMechanics as $mechanic) {
                $mechanicCFs[] = $mechanic->CF;
            }
            
            // Attach mechanics using sync to avoid duplicates
            try {
                $syncResult = $workOrder->mechanics()->sync($mechanicCFs);
                $mechanicsAssigned++;
                
                // Debug info for first few work orders
                if ($mechanicsAssigned <= 3) {
                    $command->info("Work Order {$workOrder->CodiceIntervento}: Assigned mechanics " . implode(', ', $mechanicCFs));
                }
            } catch (\Exception $e) {
                $command->error("Failed to assign mechanics to work order {$workOrder->CodiceIntervento}: " . $e->getMessage());
            }
        });

        // Assign mechanics to work sessions (AFFIANCAMENTI table)
        $workSessions->each(function ($workSession) use ($mechanics) {
            // Ensure we have mechanics to assign
            if ($mechanics->isEmpty()) {
                return;
            }
            
            $numMechanics = rand(1, min(2, $mechanics->count()));
            $assignedMechanics = $mechanics->random($numMechanics);
            
            // Convert to collection if single item
            if (!$assignedMechanics instanceof \Illuminate\Support\Collection) {
                $assignedMechanics = collect([$assignedMechanics]);
            }
            
            // Prepare data for pivot table
            $mechanicCFs = [];
            foreach ($assignedMechanics as $mechanic) {
                $mechanicCFs[] = $mechanic->CF;
            }
            
            // Attach mechanics using sync to avoid duplicates
            $workSession->mechanics()->sync($mechanicCFs);
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
                    
                $invoice = Invoice::factory()->forWorkOrder($workOrder)->create([
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
                        
                    $invoice = Invoice::factory()->forWorkOrder($workOrder)->create([
                        'CodiceSessione' => $matchingSession->CodiceSessione,
                        'Data' => $invoiceDate,
                    ]);
                    $invoices->push($invoice);
                    $combinedInvoices->push(['workOrder' => $workOrder, 'session' => $matchingSession]);
                }
            }
        });

        // Create additional current month invoices linked to existing work
        $remainingCompletedWorkOrders = $completedWorkOrders->diff($workOrderOnlyInvoices)->diff($combinedInvoices->pluck('workOrder'));
        $remainingCompletedWorkSessions = $completedWorkSessions->diff($workSessionOnlyInvoices)->diff($combinedInvoices->pluck('session'));
        
        // Add more current month work order invoices
        $remainingCompletedWorkOrders->take(3)->each(function ($workOrder, $index) use ($motorcycles, &$invoices) {
            $motorcycle = $motorcycles->where('NumTelaio', $workOrder->NumTelaio)->first();
            if ($motorcycle) {
                $invoice = Invoice::factory()->forWorkOrder($workOrder)->create([
                    'CodiceSessione' => null,
                    'Data' => fake()->dateTimeBetween(now()->startOfMonth(), now()),
                ]);
                $invoices->push($invoice);
            }
        });
        
        // Add more current month work session invoices  
        $remainingCompletedWorkSessions->take(2)->each(function ($workSession, $index) use ($motorcycles, &$invoices) {
            $motorcycle = $motorcycles->where('NumTelaio', $workSession->NumTelaio)->first();
            if ($motorcycle) {
                $invoice = Invoice::factory()->create([
                    'CF' => $motorcycle->CF,
                    'CodiceIntervento' => null,
                    'CodiceSessione' => $workSession->CodiceSessione,
                    'Data' => fake()->dateTimeBetween(now()->startOfMonth(), now()),
                    'Importo' => fake()->randomFloat(2, 200, 1500),
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
        $this->command->info("Assigned mechanics to {$mechanicsAssigned} work orders");
        
        // Verify the assignments by checking the database directly
        $svolgimentiCount = DB::table('SVOLGIMENTI')->count();
        $this->command->info("SVOLGIMENTI table has {$svolgimentiCount} records");
        
        // Check a sample work order
        $sampleWorkOrder = $workOrders->first();
        if ($sampleWorkOrder) {
            $sampleMechanics = $sampleWorkOrder->mechanics()->get();
            $this->command->info("Sample work order {$sampleWorkOrder->CodiceIntervento} has {$sampleMechanics->count()} mechanics assigned");
        }
        $this->command->info("Created {$totalInvoices} invoices:");
        $this->command->info("  - {$workOrderOnlyCount} for work orders only");
        $this->command->info("  - {$workSessionOnlyCount} for work sessions only");
        $this->command->info("  - {$combinedCount} for both work orders and sessions");
        $this->command->info("Italian schema structure populated successfully!");
    }
}
