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
                    'type' => ucfirst(str_replace('_', ' ', $appointment->Tipo)),
                    'description' => $appointment->Descrizione,
                    'status' => 'scheduled', // Simplified schema - all appointments are scheduled
                    'motorcycle' => null, // Appointments don't link to motorcycles in simplified schema
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

        // Get user's motorcycles for booking form
        $motorcycles = $user->motorcycles()
            ->with('motorcycleModel')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($motorcycle) {
                return [
                    'id' => $motorcycle->NumTelaio,
                    'label' => $motorcycle->motorcycleModel->Marca . ' ' . $motorcycle->motorcycleModel->Nome . ' (' . $motorcycle->Targa . ')',
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
            'NumTelaio' => 'required|exists:MOTO,NumTelaio',
            'DataAppuntamento' => 'required|date|after:today',
            'Ora' => 'nullable|date_format:H:i',
            'Tipo' => 'required|in:maintenance,dyno_testing',
            'Note' => 'nullable|string|max:1000',
        ]);

        // Ensure the motorcycle belongs to the authenticated user
        $motorcycle = $request->user()->motorcycles()->where('NumTelaio', $validated['NumTelaio'])->firstOrFail();

        // Generate a unique appointment code
        $appointmentCode = 'APP' . date('Ymd') . str_pad(random_int(1, 9999), 4, '0', STR_PAD_LEFT);
        
        // Ensure the code is unique
        while (Appointment::where('CodiceAppuntamento', $appointmentCode)->exists()) {
            $appointmentCode = 'APP' . date('Ymd') . str_pad(random_int(1, 9999), 4, '0', STR_PAD_LEFT);
        }

        // Create description including time if provided
        $description = $validated['Note'] ?? 'Appointment for ' . $motorcycle->motorcycleModel->Marca . ' ' . $motorcycle->motorcycleModel->Nome;
        if (!empty($validated['Ora'])) {
            $description .= ' at ' . $validated['Ora'];
        }

        $appointment = Appointment::create([
            'CodiceAppuntamento' => $appointmentCode,
            'DataAppuntamento' => $validated['DataAppuntamento'],
            'Descrizione' => $description,
            'Tipo' => $validated['Tipo'],
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

        $validated = $request->validate([
            'appointment_date' => 'required|date|after:today',
            'appointment_time' => 'required|date_format:H:i',
            'type' => 'required|in:maintenance,dyno_testing',
            'description' => 'nullable|string|max:1000',
        ]);

        $appointment->update([
            'DataAppuntamento' => $validated['appointment_date'],
            'Descrizione' => $validated['description'] ?? $appointment->Descrizione,
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

        // In simplified schema, we just delete the appointment
        $appointment->delete();

        return redirect()->route('appointments')->with('success', 'Appointment cancelled successfully!');
    }
} 