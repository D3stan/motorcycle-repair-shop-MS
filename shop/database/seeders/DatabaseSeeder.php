<?php

namespace Database\Seeders;

use App\Models\{
    User,
    MotorcycleModel,
    Motorcycle,
    Supplier,
    Part,
    Warehouse,
    Status,
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
        
        // Create predefined statuses first
        $this->createStatuses();
        
        // Create admin user
        $admin = User::factory()->admin()->create([
            'first_name' => 'Admin',
            'last_name' => 'User',
            'email' => 'admin@shop.com',
            'tax_code' => 'ADMIN001234567890',
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
                    'user_id' => $customer->id,
                    'motorcycle_model_id' => $motorcycleModels->random()->id,
                ]);
            $motorcycles = $motorcycles->merge($customerMotorcycles);
        });

        // Create appointments
        $appointments = collect();
        $motorcycles->take(30)->each(function ($motorcycle) use (&$appointments) {
            $motorcycleAppointments = Appointment::factory()
                ->count(rand(1, 4))
                ->state(function () {
                    // Ensure most appointments are in the past
                    $appointmentDate = fake()->dateTimeBetween('-4 months', '-1 day');
                    $status = fake()->randomElement(['completed', 'completed', 'completed', 'cancelled', 'pending']); // Bias toward completed
                    
                    return [
                        'appointment_date' => $appointmentDate->format('Y-m-d'),
                        'status' => $status,
                    ];
                })
                ->create([
                    'user_id' => $motorcycle->user_id,
                    'motorcycle_id' => $motorcycle->id,
                ]);
            $appointments = $appointments->merge($motorcycleAppointments);
        });

        // Create work orders
        $workOrders = collect();
        $motorcycles->take(25)->each(function ($motorcycle) use ($appointments, &$workOrders) {
            $motorcycleWorkOrders = WorkOrder::factory()
                ->count(rand(1, 3))
                ->state(function () {
                    // Ensure completed work orders have dates in the past
                    $startDate = fake()->dateTimeBetween('-6 months', '-1 week');
                    $status = fake()->randomElement(['pending', 'in_progress', 'completed', 'cancelled']);
                    
                    return [
                        'started_at' => in_array($status, ['in_progress', 'completed']) ? $startDate : null,
                        'completed_at' => $status === 'completed' ? fake()->dateTimeBetween($startDate, '-1 day') : null,
                        'status' => $status,
                    ];
                })
                ->create([
                    'user_id' => $motorcycle->user_id,
                    'motorcycle_id' => $motorcycle->id,
                    'appointment_id' => $appointments->where('motorcycle_id', $motorcycle->id)->random()->id ?? null,
                ]);
            $workOrders = $workOrders->merge($motorcycleWorkOrders);
        });

        // Create work sessions
        $workSessions = WorkSession::factory()
            ->count(40)
            ->state(function () {
                // Ensure all work sessions are in the past
                $startTime = fake()->dateTimeBetween('-6 months', '-1 day');
                $hoursWorked = fake()->randomFloat(2, 0.5, 8);
                $endTime = (clone $startTime)->modify("+{$hoursWorked} hours");
                
                return [
                    'start_time' => $startTime,
                    'end_time' => fake()->boolean(90) ? $endTime : null, // 90% completed sessions
                ];
            })
            ->create();

        // Create invoices for completed work orders
        $completedWorkOrders = $workOrders->where('status', 'completed');
        $completedWorkOrders->each(function ($workOrder) {
            Invoice::factory()
                ->state(function () use ($workOrder) {
                    // Ensure invoice dates are in the past, after work completion
                    $issueDate = fake()->dateTimeBetween($workOrder->completed_at ?? '-6 months', '-1 day');
                    $dueDate = (clone $issueDate)->modify('+30 days');
                    $status = fake()->randomElement(['paid', 'paid', 'pending', 'overdue']); // Bias toward paid
                    
                    return [
                        'issue_date' => $issueDate->format('Y-m-d'),
                        'due_date' => $dueDate->format('Y-m-d'),
                        'status' => $status,
                        'paid_at' => $status === 'paid' ? fake()->dateTimeBetween($issueDate, '-1 day') : null,
                    ];
                })
                ->create([
                    'user_id' => $workOrder->user_id,
                    'work_order_id' => $workOrder->id,
                ]);
        });

        // Create relationships
        $this->createRelationships($workOrders, $mechanics, $parts, $motorcycleModels, $warehouses, $workSessions);

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $this->command->info('Database seeded successfully!');
        $this->command->info('Admin user created: admin@shop.com (password: password)');
        $this->command->info("Created {$customers->count()} customers, {$mechanics->count()} mechanics");
        $this->command->info("Created {$motorcycles->count()} motorcycles from {$motorcycleModels->count()} models");
        $this->command->info("Created {$parts->count()} parts from {$suppliers->count()} suppliers");
        $this->command->info("Created {$workOrders->count()} work orders and {$appointments->count()} appointments");
    }

    private function createStatuses(): void
    {
        $statuses = [
            ['name' => 'Pending', 'description' => 'Work order created, waiting to be assigned', 'color' => '#FFC107', 'sort_order' => 1],
            ['name' => 'Assigned', 'description' => 'Work order assigned to mechanic', 'color' => '#17A2B8', 'sort_order' => 2],
            ['name' => 'In Progress', 'description' => 'Work is currently being performed', 'color' => '#007BFF', 'sort_order' => 3],
            ['name' => 'Waiting Parts', 'description' => 'Work paused waiting for parts', 'color' => '#FD7E14', 'sort_order' => 4],
            ['name' => 'Quality Check', 'description' => 'Work completed, undergoing quality check', 'color' => '#6F42C1', 'sort_order' => 5],
            ['name' => 'Completed', 'description' => 'Work order completed successfully', 'color' => '#28A745', 'sort_order' => 6],
            ['name' => 'Cancelled', 'description' => 'Work order cancelled', 'color' => '#DC3545', 'sort_order' => 7],
        ];

        foreach ($statuses as $status) {
            Status::create(array_merge($status, ['type' => 'work_order', 'is_active' => true]));
        }
    }

    private function createRelationships($workOrders, $mechanics, $parts, $motorcycleModels, $warehouses, $workSessions): void
    {
        // Assign mechanics to work orders
        $workOrders->each(function ($workOrder) use ($mechanics) {
            if (rand(1, 100) <= 80) { // 80% of work orders have assigned mechanics
                $assignedMechanics = $mechanics->random(rand(1, 2));
                $workOrder->mechanics()->attach($assignedMechanics->pluck('id')->toArray(), [
                    'assigned_at' => $workOrder->created_at,
                    'started_at' => $workOrder->started_at,
                    'completed_at' => $workOrder->completed_at,
                ]);
            }
        });

        // Assign parts to work orders (UTILIZZO relationship)
        $workOrders->each(function ($workOrder) use ($parts) {
            if (rand(1, 100) <= 70) { // 70% of work orders use parts
                $usedParts = $parts->random(rand(1, 5));
                $usedParts->each(function ($part) use ($workOrder) {
                    $quantity = rand(1, 3);
                    $unitPrice = $part->selling_price ?? $part->supplier_price * 1.5;
                    $workOrder->parts()->attach($part->id, [
                        'quantity' => $quantity,
                        'unit_price' => $unitPrice,
                        'total_price' => $quantity * $unitPrice,
                    ]);
                });
            }
        });

        // Assign parts to motorcycle models (APPARTENENZA relationship)
        $motorcycleModels->each(function ($model) use ($parts) {
            $compatibleParts = $parts->random(rand(5, 15));
            $model->parts()->attach($compatibleParts->pluck('id')->toArray(), [
                'is_compatible' => true,
            ]);
        });

        // Assign parts to warehouses (STOCCAGGIO relationship)
        $parts->each(function ($part) use ($warehouses) {
            $warehousesToStock = $warehouses->random(rand(1, 2));
            $warehousesToStock->each(function ($warehouse) use ($part) {
                $warehouse->parts()->attach($part->id, [
                    'quantity' => rand(0, 20),
                    'location_in_warehouse' => 'Shelf ' . chr(65 + rand(0, 25)) . '-' . rand(1, 20),
                ]);
            });
        });

        // Assign mechanics to work sessions (AFFIANCAMENTO relationship)
        $workSessions->each(function ($session) use ($mechanics) {
            $assignedMechanics = $mechanics->random(rand(1, 3));
            $assignedMechanics->each(function ($mechanic, $index) use ($session) {
                $role = $index === 0 ? 'primary' : 'assistant';
                $session->mechanics()->attach($mechanic->id, ['role' => $role]);
            });
        });
    }
}
