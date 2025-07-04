<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AppointmentController extends Controller
{
    /**
     * Show the appointments page.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // TODO: Uncomment when database tables are created

        // Get user's appointments
        // $appointments = $user->appointments()
        //     ->with('motorcycle')
        //     ->orderBy('appointment_date', 'desc')
        //     ->orderBy('appointment_time', 'desc')
        //     ->get()
        //     ->map(function ($appointment) {
        //         return [
        //             'id' => $appointment->id,
        //             'appointment_date' => $appointment->appointment_date->format('Y-m-d'),
        //             'appointment_time' => $appointment->appointment_time->format('H:i'),
        //             'type' => ucfirst(str_replace('_', ' ', $appointment->type)),
        //             'status' => $appointment->status,
        //             'motorcycle' => [
        //                 'id' => $appointment->motorcycle->id,
        //                 'brand' => $appointment->motorcycle->brand,
        //                 'model' => $appointment->motorcycle->model,
        //                 'plate' => $appointment->motorcycle->plate,
        //             ],
        //             'notes' => $appointment->notes,
        //         ];
        //     });

        // Placeholder data for demo
        $appointments = collect([
            [
                'id' => 1,
                'appointment_date' => '2024-01-15',
                'appointment_time' => '10:00',
                'type' => 'Maintenance',
                'status' => 'confirmed',
                'motorcycle' => [
                    'id' => 1,
                    'brand' => 'Ducati',
                    'model' => 'Monster 821',
                    'plate' => 'AB123CD',
                ],
                'notes' => 'Oil change and general inspection needed',
            ],
            [
                'id' => 2,
                'appointment_date' => '2024-01-20',
                'appointment_time' => '14:30',
                'type' => 'Dyno Testing',
                'status' => 'pending',
                'motorcycle' => [
                    'id' => 2,
                    'brand' => 'Yamaha',
                    'model' => 'MT-07',
                    'plate' => 'EF456GH',
                ],
                'notes' => 'Performance tuning session',
            ],
            [
                'id' => 3,
                'appointment_date' => '2024-01-08',
                'appointment_time' => '09:00',
                'type' => 'Maintenance',
                'status' => 'completed',
                'motorcycle' => [
                    'id' => 1,
                    'brand' => 'Ducati',
                    'model' => 'Monster 821',
                    'plate' => 'AB123CD',
                ],
                'notes' => 'Brake system check',
            ],
        ]);

        // Separate upcoming and past appointments
        $upcomingAppointments = $appointments->filter(function ($appointment) {
            return in_array($appointment['status'], ['pending', 'confirmed', 'in_progress']);
        });

        $pastAppointments = $appointments->filter(function ($appointment) {
            return in_array($appointment['status'], ['completed', 'cancelled']);
        });

        // Get user's motorcycles for booking form
        // $motorcycles = $user->motorcycles()
        //     ->orderBy('brand')
        //     ->orderBy('model')
        //     ->get()
        //     ->map(function ($motorcycle) {
        //         return [
        //             'id' => $motorcycle->id,
        //             'label' => $motorcycle->brand . ' ' . $motorcycle->model . ' (' . $motorcycle->plate . ')',
        //         ];
        //     });

        // Placeholder motorcycles for booking form
        $motorcycles = collect([
            [
                'id' => 1,
                'label' => 'Ducati Monster 821 (AB123CD)',
            ],
            [
                'id' => 2,
                'label' => 'Yamaha MT-07 (EF456GH)',
            ],
        ]);

        return Inertia::render('appointments', [
            'upcomingAppointments' => $upcomingAppointments->values()->all(),
            'pastAppointments' => $pastAppointments->values()->all(),
            'motorcycles' => $motorcycles->values()->all(),
        ]);
    }

    /**
     * Store a newly created appointment.
     */
    public function store(Request $request)
    {
        // TODO: Uncomment when database tables are created
        
        // $validated = $request->validate([
        //     'motorcycle_id' => 'required|exists:motorcycles,id',
        //     'appointment_date' => 'required|date|after:today',
        //     'appointment_time' => 'required|date_format:H:i',
        //     'type' => 'required|in:maintenance,dyno_testing',
        //     'notes' => 'nullable|string|max:1000',
        // ]);

        // Ensure the motorcycle belongs to the authenticated user
        // $motorcycle = $request->user()->motorcycles()->findOrFail($validated['motorcycle_id']);

        // $appointment = $request->user()->appointments()->create([
        //     'motorcycle_id' => $validated['motorcycle_id'],
        //     'appointment_date' => $validated['appointment_date'],
        //     'appointment_time' => $validated['appointment_time'],
        //     'type' => $validated['type'],
        //     'status' => 'pending',
        //     'notes' => $validated['notes'],
        // ]);

        return redirect()->route('appointments')->with('success', 'Appointment functionality disabled - database tables not created yet.');
    }

    /**
     * Update the specified appointment.
     */
    public function update(Request $request, Appointment $appointment)
    {
        // TODO: Uncomment when database tables are created
        
        // Ensure the appointment belongs to the authenticated user
        // if ($appointment->user_id !== $request->user()->id) {
        //     abort(403, 'Unauthorized action.');
        // }

        // Only allow updates if appointment is not completed
        // if ($appointment->status === 'completed') {
        //     return redirect()->route('appointments')->with('error', 'Cannot modify completed appointments.');
        // }

        // $validated = $request->validate([
        //     'appointment_date' => 'required|date|after:today',
        //     'appointment_time' => 'required|date_format:H:i',
        //     'type' => 'required|in:maintenance,dyno_testing',
        //     'notes' => 'nullable|string|max:1000',
        // ]);

        // $appointment->update($validated);

        return redirect()->route('appointments')->with('success', 'Appointment functionality disabled - database tables not created yet.');
    }

    /**
     * Cancel/delete the specified appointment.
     */
    public function destroy(Request $request, Appointment $appointment)
    {
        // TODO: Uncomment when database tables are created
        
        // Ensure the appointment belongs to the authenticated user
        // if ($appointment->user_id !== $request->user()->id) {
        //     abort(403, 'Unauthorized action.');
        // }

        // Only allow cancellation if appointment is not completed
        // if ($appointment->status === 'completed') {
        //     return redirect()->route('appointments')->with('error', 'Cannot cancel completed appointments.');
        // }

        // Update status to cancelled instead of deleting
        // $appointment->update(['status' => 'cancelled']);

        return redirect()->route('appointments')->with('success', 'Appointment functionality disabled - database tables not created yet.');
    }
} 