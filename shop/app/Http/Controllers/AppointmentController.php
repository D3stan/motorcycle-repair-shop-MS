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

        // Get user's appointments with motorcycle information
        $appointments = $user->appointments()
            ->with(['motorcycle', 'motorcycle.motorcycleModel'])
            ->orderBy('appointment_date', 'desc')
            ->orderBy('appointment_time', 'desc')
            ->get()
            ->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'appointment_date' => $appointment->appointment_date->format('Y-m-d'),
                    'appointment_time' => substr($appointment->appointment_time, 0, 5), // Extract HH:MM from time string
                    'type' => ucfirst(str_replace('_', ' ', $appointment->type)),
                    'status' => $appointment->status,
                    'motorcycle' => [
                        'id' => $appointment->motorcycle->id,
                        'brand' => $appointment->motorcycle->motorcycleModel->brand,
                        'model' => $appointment->motorcycle->motorcycleModel->name,
                        'plate' => $appointment->motorcycle->license_plate,
                    ],
                    'notes' => $appointment->notes,
                ];
            });

        // Separate upcoming and past appointments
        $upcomingAppointments = $appointments->filter(function ($appointment) {
            return in_array($appointment['status'], ['pending', 'confirmed', 'in_progress']);
        });

        $pastAppointments = $appointments->filter(function ($appointment) {
            return in_array($appointment['status'], ['completed', 'cancelled']);
        });

        // Get user's motorcycles for booking form
        $motorcycles = $user->motorcycles()
            ->with('motorcycleModel')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($motorcycle) {
                return [
                    'id' => $motorcycle->id,
                    'label' => $motorcycle->motorcycleModel->brand . ' ' . $motorcycle->motorcycleModel->name . ' (' . $motorcycle->license_plate . ')',
                ];
            });

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
        $validated = $request->validate([
            'motorcycle_id' => 'required|exists:motorcycles,id',
            'appointment_date' => 'required|date|after:today',
            'appointment_time' => 'required|date_format:H:i',
            'type' => 'required|in:maintenance,dyno_testing',
            'notes' => 'nullable|string|max:1000',
        ]);

        // Ensure the motorcycle belongs to the authenticated user
        $motorcycle = $request->user()->motorcycles()->findOrFail($validated['motorcycle_id']);

        $appointment = $request->user()->appointments()->create([
            'motorcycle_id' => $validated['motorcycle_id'],
            'appointment_date' => $validated['appointment_date'],
            'appointment_time' => $validated['appointment_time'],
            'type' => $validated['type'],
            'status' => 'pending',
            'notes' => $validated['notes'],
        ]);

        return redirect()->route('appointments')->with('success', 'Appointment booked successfully!');
    }

    /**
     * Update the specified appointment.
     */
    public function update(Request $request, Appointment $appointment)
    {
        // Ensure the appointment belongs to the authenticated user
        if ($appointment->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized action.');
        }

        // Only allow updates if appointment is not completed
        if ($appointment->status === 'completed') {
            return redirect()->route('appointments')->with('error', 'Cannot modify completed appointments.');
        }

        $validated = $request->validate([
            'appointment_date' => 'required|date|after:today',
            'appointment_time' => 'required|date_format:H:i',
            'type' => 'required|in:maintenance,dyno_testing',
            'notes' => 'nullable|string|max:1000',
        ]);

        $appointment->update($validated);

        return redirect()->route('appointments')->with('success', 'Appointment updated successfully!');
    }

    /**
     * Cancel/delete the specified appointment.
     */
    public function destroy(Request $request, Appointment $appointment)
    {
        // Ensure the appointment belongs to the authenticated user
        if ($appointment->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized action.');
        }

        // Only allow cancellation if appointment is not completed
        if ($appointment->status === 'completed') {
            return redirect()->route('appointments')->with('error', 'Cannot cancel completed appointments.');
        }

        // Update status to cancelled instead of deleting
        $appointment->update(['status' => 'cancelled']);

        return redirect()->route('appointments')->with('success', 'Appointment cancelled successfully!');
    }
} 