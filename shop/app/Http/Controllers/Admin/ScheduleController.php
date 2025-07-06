<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\User;
use App\Models\Motorcycle;
use App\Models\WorkOrder;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class ScheduleController extends Controller
{
    /**
     * Display the schedule dashboard with calendar view and appointment management.
     */
    public function index(Request $request): Response
    {
        $currentDate = $request->date ? Carbon::parse($request->date) : now();
        $startOfWeek = $currentDate->copy()->startOfWeek();
        $endOfWeek = $currentDate->copy()->endOfWeek();
        
        // Get appointments for the current week
        $appointments = Appointment::with(['user', 'motorcycle.motorcycleModel'])
            ->whereBetween('appointment_date', [$startOfWeek, $endOfWeek])
            ->orderBy('appointment_date')
            ->orderBy('appointment_time')
            ->get()
            ->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'appointment_date' => $appointment->appointment_date->format('Y-m-d'),
                    'appointment_time' => $appointment->appointment_time,
                    'type' => $appointment->type,
                    'status' => $appointment->status,
                    'customer' => $appointment->user->first_name . ' ' . $appointment->user->last_name,
                    'customer_email' => $appointment->user->email,
                    'customer_phone' => $appointment->user->phone,
                    'motorcycle' => $appointment->motorcycle->motorcycleModel->brand . ' ' . 
                                   $appointment->motorcycle->motorcycleModel->name . ' (' . 
                                   $appointment->motorcycle->license_plate . ')',
                    'notes' => $appointment->notes,
                    'created_at' => $appointment->created_at->format('Y-m-d H:i'),
                ];
            });
            
        // Schedule statistics
        $todayAppointments = Appointment::whereDate('appointment_date', now())->count();
        $pendingAppointments = Appointment::where('status', 'pending')->count();
        $confirmedAppointments = Appointment::where('status', 'confirmed')->count();
        $completedAppointments = Appointment::where('status', 'completed')->count();
        
        // Daily schedule for the week
        $weeklySchedule = collect(range(0, 6))->map(function ($dayOffset) use ($startOfWeek) {
            $date = $startOfWeek->copy()->addDays($dayOffset);
            $dayAppointments = Appointment::with(['user', 'motorcycle.motorcycleModel'])
                ->whereDate('appointment_date', $date)
                ->orderBy('appointment_time')
                ->get()
                ->map(function ($appointment) {
                    return [
                        'id' => $appointment->id,
                        'time' => $appointment->appointment_time,
                        'type' => $appointment->type,
                        'status' => $appointment->status,
                        'customer' => $appointment->user->first_name . ' ' . $appointment->user->last_name,
                        'motorcycle' => $appointment->motorcycle->motorcycleModel->brand . ' ' . 
                                       $appointment->motorcycle->motorcycleModel->name,
                        'plate' => $appointment->motorcycle->license_plate,
                    ];
                });
                
            return [
                'date' => $date->format('Y-m-d'),
                'day_name' => $date->format('l'),
                'day_number' => $date->format('j'),
                'appointments' => $dayAppointments,
                'appointment_count' => $dayAppointments->count(),
            ];
        });
        
        // Available time slots (example: 8:00 to 18:00, 1-hour slots)
        $availableTimeSlots = collect(range(8, 17))->map(function ($hour) {
            return sprintf('%02d:00', $hour);
        });
        
        // Upcoming appointments (next 7 days)
        $upcomingAppointments = Appointment::with(['user', 'motorcycle.motorcycleModel'])
            ->where('appointment_date', '>', now())
            ->where('appointment_date', '<=', now()->addDays(7))
            ->orderBy('appointment_date')
            ->orderBy('appointment_time')
            ->limit(10)
            ->get()
            ->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'appointment_date' => $appointment->appointment_date->format('M j, Y'),
                    'appointment_time' => $appointment->appointment_time,
                    'type' => ucfirst(str_replace('_', ' ', $appointment->type)),
                    'status' => $appointment->status,
                    'customer' => $appointment->user->first_name . ' ' . $appointment->user->last_name,
                    'motorcycle' => $appointment->motorcycle->motorcycleModel->brand . ' ' . 
                                   $appointment->motorcycle->motorcycleModel->name,
                    'plate' => $appointment->motorcycle->license_plate,
                ];
            });

        return Inertia::render('admin/schedule/index', [
            'currentDate' => $currentDate->format('Y-m-d'),
            'weeklySchedule' => $weeklySchedule,
            'appointments' => $appointments,
            'statistics' => [
                'today_appointments' => $todayAppointments,
                'pending_appointments' => $pendingAppointments,
                'confirmed_appointments' => $confirmedAppointments,
                'completed_appointments' => $completedAppointments,
            ],
            'availableTimeSlots' => $availableTimeSlots,
            'upcomingAppointments' => $upcomingAppointments,
        ]);
    }

    /**
     * Display all appointments with filtering and search.
     */
    public function appointments(Request $request): Response
    {
        $query = Appointment::with(['user', 'motorcycle.motorcycleModel']);
        
        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', function ($userQuery) use ($search) {
                    $userQuery->where('first_name', 'like', "%{$search}%")
                             ->orWhere('last_name', 'like', "%{$search}%")
                             ->orWhere('email', 'like', "%{$search}%");
                })
                ->orWhereHas('motorcycle', function ($motorcycleQuery) use ($search) {
                    $motorcycleQuery->where('license_plate', 'like', "%{$search}%");
                });
            });
        }
        
        if ($request->filled('date_from')) {
            $query->where('appointment_date', '>=', $request->date_from);
        }
        
        if ($request->filled('date_to')) {
            $query->where('appointment_date', '<=', $request->date_to);
        }
        
        $appointments = $query->orderBy('appointment_date', 'desc')
            ->orderBy('appointment_time', 'desc')
            ->paginate(20)
            ->withQueryString();
            
        $appointmentsData = $appointments->through(function ($appointment) {
            return [
                'id' => $appointment->id,
                'appointment_date' => $appointment->appointment_date->format('Y-m-d'),
                'appointment_time' => $appointment->appointment_time,
                'type' => $appointment->type,
                'status' => $appointment->status,
                'customer' => $appointment->user->first_name . ' ' . $appointment->user->last_name,
                'customer_email' => $appointment->user->email,
                'customer_phone' => $appointment->user->phone,
                'motorcycle' => $appointment->motorcycle->motorcycleModel->brand . ' ' . 
                               $appointment->motorcycle->motorcycleModel->name . ' (' . 
                               $appointment->motorcycle->license_plate . ')',
                'notes' => $appointment->notes,
                'created_at' => $appointment->created_at->format('Y-m-d H:i'),
                'has_work_order' => $appointment->workOrders()->exists(),
            ];
        });

        return Inertia::render('admin/schedule/appointments', [
            'appointments' => $appointmentsData,
            'filters' => $request->only(['status', 'type', 'search', 'date_from', 'date_to']),
        ]);
    }

    /**
     * Display the specified appointment details.
     */
    public function show(Appointment $appointment): Response
    {
        $appointment->load(['user', 'motorcycle.motorcycleModel', 'workOrders']);
        
        $appointmentData = [
            'id' => $appointment->id,
            'appointment_date' => $appointment->appointment_date->format('Y-m-d'),
            'appointment_time' => $appointment->appointment_time,
            'type' => $appointment->type,
            'status' => $appointment->status,
            'notes' => $appointment->notes,
            'created_at' => $appointment->created_at->format('Y-m-d H:i'),
        ];
        
        $customer = [
            'id' => $appointment->user->id,
            'name' => $appointment->user->first_name . ' ' . $appointment->user->last_name,
            'email' => $appointment->user->email,
            'phone' => $appointment->user->phone,
            'tax_code' => $appointment->user->tax_code,
        ];
        
        $motorcycle = [
            'id' => $appointment->motorcycle->id,
            'brand' => $appointment->motorcycle->motorcycleModel->brand,
            'model' => $appointment->motorcycle->motorcycleModel->name,
            'year' => $appointment->motorcycle->registration_year,
            'plate' => $appointment->motorcycle->license_plate,
            'vin' => $appointment->motorcycle->vin,
            'engine_size' => $appointment->motorcycle->motorcycleModel->engine_size,
        ];
        
        $workOrders = $appointment->workOrders->map(function ($workOrder) {
            return [
                'id' => $workOrder->id,
                'description' => $workOrder->description,
                'status' => $workOrder->status,
                'started_at' => $workOrder->started_at?->format('Y-m-d'),
                'completed_at' => $workOrder->completed_at?->format('Y-m-d'),
                'total_cost' => (float) $workOrder->total_cost,
            ];
        });

        return Inertia::render('admin/schedule/appointment-show', [
            'appointment' => $appointmentData,
            'customer' => $customer,
            'motorcycle' => $motorcycle,
            'workOrders' => $workOrders,
        ]);
    }

    /**
     * Show the form for creating a new appointment.
     */
    public function create(): Response
    {
        // Get all customers with their motorcycles
        $customers = User::where('type', 'customer')
            ->with(['motorcycles.motorcycleModel'])
            ->orderBy('first_name')
            ->get()
            ->map(function ($customer) {
                return [
                    'id' => $customer->id,
                    'name' => $customer->first_name . ' ' . $customer->last_name,
                    'email' => $customer->email,
                    'motorcycles' => $customer->motorcycles->map(function ($motorcycle) {
                        return [
                            'id' => $motorcycle->id,
                            'name' => $motorcycle->motorcycleModel->brand . ' ' . 
                                    $motorcycle->motorcycleModel->name . ' (' . 
                                    $motorcycle->license_plate . ')',
                            'plate' => $motorcycle->license_plate,
                            'year' => $motorcycle->registration_year,
                        ];
                    }),
                ];
            });

        return Inertia::render('admin/schedule/appointment-create', [
            'customers' => $customers,
        ]);
    }

    /**
     * Store a newly created appointment.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'motorcycle_id' => 'required|exists:motorcycles,id',
            'appointment_date' => 'required|date|after_or_equal:today',
            'appointment_time' => 'required|date_format:H:i',
            'type' => 'required|in:maintenance,dyno_testing,inspection',
            'notes' => 'nullable|string|max:1000',
        ]);

        // Check if the time slot is available
        $existingAppointment = Appointment::where('appointment_date', $validated['appointment_date'])
            ->where('appointment_time', $validated['appointment_time'])
            ->first();

        if ($existingAppointment) {
            return back()->withErrors(['appointment_time' => 'This time slot is already booked.']);
        }

        $appointment = Appointment::create([
            ...$validated,
            'status' => 'confirmed',
        ]);

        return redirect()->route('admin.schedule.show', $appointment)
            ->with('success', 'Appointment created successfully!');
    }

    /**
     * Show the form for editing the specified appointment.
     */
    public function edit(Appointment $appointment): Response
    {
        $appointment->load(['user', 'motorcycle.motorcycleModel']);
        
        // Get all customers with their motorcycles
        $customers = User::where('type', 'customer')
            ->with(['motorcycles.motorcycleModel'])
            ->orderBy('first_name')
            ->get()
            ->map(function ($customer) {
                return [
                    'id' => $customer->id,
                    'name' => $customer->first_name . ' ' . $customer->last_name,
                    'email' => $customer->email,
                    'motorcycles' => $customer->motorcycles->map(function ($motorcycle) {
                        return [
                            'id' => $motorcycle->id,
                            'name' => $motorcycle->motorcycleModel->brand . ' ' . 
                                    $motorcycle->motorcycleModel->name . ' (' . 
                                    $motorcycle->license_plate . ')',
                            'plate' => $motorcycle->license_plate,
                            'year' => $motorcycle->registration_year,
                        ];
                    }),
                ];
            });

        return Inertia::render('admin/schedule/appointment-edit', [
            'appointment' => [
                'id' => $appointment->id,
                'user_id' => $appointment->user_id,
                'motorcycle_id' => $appointment->motorcycle_id,
                'appointment_date' => $appointment->appointment_date->format('Y-m-d'),
                'appointment_time' => $appointment->appointment_time,
                'type' => $appointment->type,
                'status' => $appointment->status,
                'notes' => $appointment->notes,
            ],
            'customers' => $customers,
        ]);
    }

    /**
     * Update the specified appointment.
     */
    public function update(Request $request, Appointment $appointment): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'motorcycle_id' => 'required|exists:motorcycles,id',
            'appointment_date' => 'required|date',
            'appointment_time' => 'required|date_format:H:i',
            'type' => 'required|in:maintenance,dyno_testing,inspection',
            'status' => 'required|in:pending,confirmed,in_progress,completed,cancelled',
            'notes' => 'nullable|string|max:1000',
        ]);

        // Check if the time slot is available (excluding current appointment)
        $existingAppointment = Appointment::where('appointment_date', $validated['appointment_date'])
            ->where('appointment_time', $validated['appointment_time'])
            ->where('id', '!=', $appointment->id)
            ->first();

        if ($existingAppointment) {
            return back()->withErrors(['appointment_time' => 'This time slot is already booked.']);
        }

        $appointment->update($validated);

        return redirect()->route('admin.schedule.show', $appointment)
            ->with('success', 'Appointment updated successfully!');
    }

    /**
     * Remove the specified appointment.
     */
    public function destroy(Appointment $appointment): RedirectResponse
    {
        // Check if appointment has associated work orders
        if ($appointment->workOrders()->exists()) {
            return back()->with('error', 'Cannot delete appointment with associated work orders.');
        }

        $appointment->delete();

        return redirect()->route('admin.schedule.appointments')
            ->with('success', 'Appointment deleted successfully!');
    }

    /**
     * Create a work order from an appointment.
     */
    public function createWorkOrder(Appointment $appointment): RedirectResponse
    {
        // Check if work order already exists for this appointment
        if ($appointment->workOrders()->exists()) {
            return back()->with('error', 'Work order already exists for this appointment.');
        }

        $workOrder = WorkOrder::create([
            'user_id' => $appointment->user_id,
            'motorcycle_id' => $appointment->motorcycle_id,
            'appointment_id' => $appointment->id,
            'description' => 'Work order created from appointment: ' . ucfirst(str_replace('_', ' ', $appointment->type)),
            'status' => 'pending',
            'labor_cost' => 0,
            'parts_cost' => 0,
            'total_cost' => 0,
        ]);

        // Update appointment status
        $appointment->update(['status' => 'in_progress']);

        return redirect()->route('admin.work-orders.show', $workOrder)
            ->with('success', 'Work order created successfully from appointment!');
    }
} 