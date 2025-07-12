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
        
        // Get appointments for the current week (simplified schema)
        $appointments = Appointment::with(['user'])
            ->whereBetween('DataAppuntamento', [$startOfWeek, $endOfWeek])
            ->orderBy('DataAppuntamento')
            ->get()
            ->map(function ($appointment) {
                return [
                    'id' => $appointment->CodiceAppuntamento,
                    'appointment_date' => $appointment->DataAppuntamento->format('Y-m-d'),
                    'appointment_time' => null, // No time field in simplified schema
                    'type' => $appointment->Tipo,
                    'status' => 'scheduled', // Simplified schema - all appointments are scheduled
                    'customer' => $appointment->user->first_name . ' ' . $appointment->user->last_name,
                    'customer_email' => $appointment->user->email,
                    'customer_phone' => $appointment->user->phone,
                    'motorcycle' => 'Not linked in simplified schema', // No motorcycle link
                    'description' => $appointment->Descrizione,
                    'created_at' => $appointment->created_at->format('Y-m-d H:i'),
                ];
            });
            
        // Schedule statistics (simplified schema)
        $todayAppointments = Appointment::whereDate('DataAppuntamento', now())->count();
        $pendingAppointments = 0; // No status field in simplified schema
        $confirmedAppointments = Appointment::count(); // All appointments are considered confirmed
        $completedAppointments = 0; // No status field in simplified schema
        
        // Daily schedule for the week
        $weeklySchedule = collect(range(0, 6))->map(function ($dayOffset) use ($startOfWeek) {
            $date = $startOfWeek->copy()->addDays($dayOffset);
            $dayAppointments = Appointment::with(['user'])
                ->whereDate('DataAppuntamento', $date)
                ->get()
                ->map(function ($appointment) {
                    return [
                        'id' => $appointment->CodiceAppuntamento,
                        'time' => null, // No time field in simplified schema
                        'type' => $appointment->Tipo,
                        'status' => 'scheduled',
                        'customer' => $appointment->user->first_name . ' ' . $appointment->user->last_name,
                        'motorcycle' => 'Not linked',
                        'description' => $appointment->Descrizione,
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
        
        // Upcoming appointments (next 7 days) - simplified schema
        $upcomingAppointments = Appointment::with(['user'])
            ->where('DataAppuntamento', '>', now())
            ->where('DataAppuntamento', '<=', now()->addDays(7))
            ->orderBy('DataAppuntamento')
            ->limit(10)
            ->get()
            ->map(function ($appointment) {
                return [
                    'id' => $appointment->CodiceAppuntamento,
                    'appointment_date' => $appointment->DataAppuntamento->format('M j, Y'),
                    'appointment_time' => null, // No time field in simplified schema
                    'type' => ucfirst(str_replace('_', ' ', $appointment->Tipo)),
                    'status' => 'scheduled',
                    'customer' => $appointment->user->first_name . ' ' . $appointment->user->last_name,
                    'motorcycle' => 'Not linked',
                    'description' => $appointment->Descrizione,
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
            $query->where('DataAppuntamento', '>=', $request->date_from);
        }
        
        if ($request->filled('date_to')) {
            $query->where('DataAppuntamento', '<=', $request->date_to);
        }
        
        $appointments = $query->orderBy('DataAppuntamento', 'desc')
            ->paginate(20)
            ->withQueryString();
            
        $appointmentsData = $appointments->through(function ($appointment) {
            return [
                'id' => $appointment->CodiceAppuntamento,
                'appointment_date' => $appointment->DataAppuntamento->format('Y-m-d'),
                'appointment_time' => null, // No time field in simplified schema
                'type' => $appointment->Tipo,
                'status' => 'scheduled',
                'customer' => $appointment->user->first_name . ' ' . $appointment->user->last_name,
                'customer_email' => $appointment->user->email,
                'customer_phone' => $appointment->user->phone,
                'motorcycle' => 'Not linked in simplified schema',
                'description' => $appointment->Descrizione,
                'created_at' => $appointment->created_at->format('Y-m-d H:i'),
                'has_work_order' => false, // No direct link in simplified schema
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
        $appointment->load(['user']); // Simplified schema - no motorcycle or work order links
        
        $appointmentData = [
            'id' => $appointment->CodiceAppuntamento,
            'appointment_date' => $appointment->DataAppuntamento->format('Y-m-d'),
            'appointment_time' => null, // No time field in simplified schema
            'type' => $appointment->Tipo,
            'status' => 'scheduled', // No status field in simplified schema
            'description' => $appointment->Descrizione,
            'created_at' => $appointment->created_at->format('Y-m-d H:i'),
        ];
        
        $customer = [
            'id' => $appointment->user->id,
            'name' => $appointment->user->first_name . ' ' . $appointment->user->last_name,
            'email' => $appointment->user->email,
            'phone' => $appointment->user->phone,
            'tax_code' => $appointment->user->CF,
        ];
        
        // No motorcycle or work orders in simplified schema
        return Inertia::render('admin/schedule/appointment-show', [
            'appointment' => $appointmentData,
            'customer' => $customer,
            'motorcycle' => null, // Not available in simplified schema
            'workOrders' => [], // Not linked in simplified schema
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