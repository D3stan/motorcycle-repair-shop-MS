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
            ->orderBy('DataAppuntamento', 'desc')
            ->orderBy('Ora', 'desc')
            ->get()
            ->map(function ($appointment) {
                return [
                    'id' => $appointment->CodiceAppuntamento,
                    'appointment_date' => $appointment->DataAppuntamento->format('Y-m-d'),
                    'appointment_time' => substr($appointment->Ora, 0, 5), // Extract HH:MM from time string
                    'type' => ucfirst(str_replace('_', ' ', $appointment->Tipo)),
                    'status' => $appointment->Stato,
                    'motorcycle' => [
                        'id' => $appointment->motorcycle->NumTelaio,
                        'brand' => $appointment->motorcycle->motorcycleModel->Marca,
                        'model' => $appointment->motorcycle->motorcycleModel->Nome,
                        'plate' => $appointment->motorcycle->Targa,
                    ],
                    'notes' => $appointment->Note,
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
            'Ora' => 'required|date_format:H:i',
            'Tipo' => 'required|in:maintenance,dyno_testing',
            'Note' => 'nullable|string|max:1000',
        ]);

        // Ensure the motorcycle belongs to the authenticated user
        $motorcycle = $request->user()->motorcycles()->where('NumTelaio', $validated['NumTelaio'])->firstOrFail();

        $appointment = $request->user()->appointments()->create([
            'NumTelaio' => $validated['NumTelaio'],
            'DataAppuntamento' => $validated['DataAppuntamento'],
            'Ora' => $validated['Ora'],
            'Tipo' => $validated['Tipo'],
            'Stato' => 'pending',
            'Note' => $validated['Note'],
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

        // Only allow updates if appointment is not completed
        if ($appointment->Stato === 'completed') {
            return redirect()->route('appointments')->with('error', 'Cannot modify completed appointments.');
        }

        $validated = $request->validate([
            'DataAppuntamento' => 'required|date|after:today',
            'Ora' => 'required|date_format:H:i',
            'Tipo' => 'required|in:maintenance,dyno_testing',
            'Note' => 'nullable|string|max:1000',
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
        if ($appointment->CF !== $request->user()->CF) {
            abort(403, 'Unauthorized action.');
        }

        // Only allow cancellation if appointment is not completed
        if ($appointment->Stato === 'completed') {
            return redirect()->route('appointments')->with('error', 'Cannot cancel completed appointments.');
        }

        // Update status to cancelled instead of deleting
        $appointment->update(['Stato' => 'cancelled']);

        return redirect()->route('appointments')->with('success', 'Appointment cancelled successfully!');
    }
} 