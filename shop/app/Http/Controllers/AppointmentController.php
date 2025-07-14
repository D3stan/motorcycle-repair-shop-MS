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

        // Get user's appointments (simplified schema - no motorcycle link)
        $appointments = $user->appointments()
            ->orderBy('DataAppuntamento', 'desc')
            ->get()
            ->map(function ($appointment) {
                return [
                    'id' => $appointment->CodiceAppuntamento,
                    'appointment_date' => $appointment->DataAppuntamento->format('Y-m-d'),
                    'appointment_time' => '09:00', // Default time since not stored separately
                    'type' => $appointment->Tipo, // Send raw type value for form population
                    'type_display' => ucfirst(str_replace('_', ' ', $appointment->Tipo)), // Formatted for display
                    'description' => $appointment->Descrizione,
                    'status' => $appointment->Stato,
                    'notes' => $appointment->Descrizione ?? '', // Use description as notes
                ];
            });

        // Separate upcoming and past appointments based on date
        $today = now()->toDateString();
        $upcomingAppointments = $appointments->filter(function ($appointment) use ($today) {
            return $appointment['appointment_date'] >= $today;
        });

        $pastAppointments = $appointments->filter(function ($appointment) use ($today) {
            return $appointment['appointment_date'] < $today;
        });

        return Inertia::render('appointments', [
            'upcomingAppointments' => $upcomingAppointments->values()->all(),
            'pastAppointments' => $pastAppointments->values()->all(),
        ]);
    }

    /**
     * Store a newly created appointment.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'appointment_date' => 'required|date|after:today',
            'appointment_time' => 'nullable|date_format:H:i',
            'type' => 'required|in:maintenance,dyno_testing',
            'notes' => 'nullable|string|max:1000',
        ]);

        // Generate a unique appointment code
        $appointmentCode = 'APP' . date('Ymd') . str_pad(random_int(1, 9999), 4, '0', STR_PAD_LEFT);
        
        // Ensure the code is unique
        while (Appointment::where('CodiceAppuntamento', $appointmentCode)->exists()) {
            $appointmentCode = 'APP' . date('Ymd') . str_pad(random_int(1, 9999), 4, '0', STR_PAD_LEFT);
        }

        // Create description including time if provided
        $description = $validated['notes'] ?? 'Appointment for ' . ucfirst(str_replace('_', ' ', $validated['type']));
        if (!empty($validated['appointment_time'])) {
            $description .= ' at ' . $validated['appointment_time'];
        }

        $appointment = Appointment::create([
            'CodiceAppuntamento' => $appointmentCode,
            'DataAppuntamento' => $validated['appointment_date'],
            'Descrizione' => $description,
            'Tipo' => $validated['type'],
            'Stato' => 'pending',
            'CF' => $request->user()->CF,
        ]);

        return redirect()->route('appointments')->with('success', 'Appointment booked successfully!');
    }

    /**
     * Update the specified appointment.
     */
    public function update(Request $request, Appointment $appointment)
    {
        // Ensure the appointment belongs to the authenticated user
        if ($appointment->CF !== $request->user()->CF) {
            abort(403, 'Unauthorized action.');
        }

        // Check if appointment can be edited (not accepted)                                                      
        if ($appointment->Stato === 'accepted') {                                                                 
            return back()->withErrors(['appointment' => 'Cannot edit accepted appointments.']);                   
        }

        $validated = $request->validate([
            'appointment_date' => 'required|date|after_or_equal:today',
            'appointment_time' => 'required|date_format:H:i',
            'type' => 'required|in:maintenance,dyno_testing',
            'notes' => 'nullable|string|max:1000',
        ]);

        // Create description including time if provided
        $description = $validated['notes'] ?? $appointment->Descrizione;
        if (!empty($validated['appointment_time'])) {
            $description .= ' at ' . $validated['appointment_time'];
        }

        $appointment->update([
            'DataAppuntamento' => $validated['appointment_date'],
            'Descrizione' => $description,
            'Tipo' => $validated['type'],
        ]);

        return redirect()->route('appointments')->with('success', 'Appointment updated successfully!');
    }

    /**
     * Cancel/delete the specified appointment.
     */
    public function destroy(Request $request, Appointment $appointment)
    {
        // Ensure the appointment belongs to the authenticated user
        if ($appointment->CF !== $request->user()->CF) {
            abort(403, 'Unauthorized action.');
        }

        // Check if appointment can be cancelled (not accepted)
        if ($appointment->Stato === 'accepted') {
            return back()->withErrors(['appointment' => 'Cannot cancel accepted appointments.']);
        }

        // In simplified schema, we just delete the appointment
        $appointment->delete();

        return redirect()->route('appointments')->with('success', 'Appointment cancelled successfully!');
    }
} 