<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MotorcycleModel;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class MotorcycleModelController extends Controller
{
    /**
     * Display a listing of motorcycle models.
     */
    public function index(): Response
    {
        $motorcycleModels = MotorcycleModel::withCount('motorcycles')
            ->orderBy('Marca')
            ->orderBy('Nome')
            ->paginate(20);

        $modelsData = $motorcycleModels->through(function ($model) {
            return [
                'id' => $model->CodiceModello,
                'brand' => $model->Marca,
                'name' => $model->Nome,
                'model_code' => $model->CodiceModello,
                'engine_size' => $model->Cilindrata,
                'segment' => $model->Segmento,
                'power' => $model->Potenza,
                'motorcycles_count' => $model->motorcycles_count,
                'created_at' => $model->created_at->format('Y-m-d'),
            ];
        });

        return Inertia::render('admin/motorcycles/index', [
            'motorcycleModels' => $modelsData,
        ]);
    }

    /**
     * Show the form for creating a new motorcycle model.
     */
    public function create(): Response
    {
        return Inertia::render('admin/motorcycles/create');
    }

    /**
     * Store a newly created motorcycle model.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'brand' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'model_code' => 'required|string|max:255|unique:MODELLI,CodiceModello',
            'engine_size' => 'required|integer|min:50|max:2500',
            'segment' => 'required|string|in:sport,touring,naked,cruiser,adventure,enduro,scooter',
            'power' => 'required|integer|min:5|max:300',
        ]);

        $model = MotorcycleModel::create([
            'Marca' => $validated['brand'],
            'Nome' => $validated['name'],
            'CodiceModello' => $validated['model_code'],
            'Cilindrata' => $validated['engine_size'],
            'Segmento' => $validated['segment'],
            'Potenza' => $validated['power'],
        ]);

        return redirect()->route('admin.motorcycles.index')
            ->with('success', 'Motorcycle model created successfully!');
    }

    /**
     * Display the specified motorcycle model.
     */
    public function show(MotorcycleModel $motorcycle): Response
    {
        $motorcycle->load(['motorcycles.user']);

        $modelData = [
            'id' => $motorcycle->CodiceModello,
            'brand' => $motorcycle->Marca,
            'name' => $motorcycle->Nome,
            'model_code' => $motorcycle->CodiceModello,
            'engine_size' => $motorcycle->Cilindrata,
            'segment' => $motorcycle->Segmento,
            'power' => $motorcycle->Potenza,
            'created_at' => $motorcycle->created_at->format('Y-m-d H:i'),
        ];

        $motorcycles = $motorcycle->motorcycles->map(function ($bike) {
            return [
                'id' => $bike->NumTelaio,
                'license_plate' => $bike->Targa,
                'registration_year' => $bike->AnnoImmatricolazione,
                'vin' => $bike->NumTelaio,
                'owner' => $bike->user->first_name . ' ' . $bike->user->last_name,
                'owner_email' => $bike->user->email,
            ];
        });

        return Inertia::render('admin/motorcycles/show', [
            'motorcycleModel' => $modelData,
            'motorcycles' => $motorcycles,
        ]);
    }

    /**
     * Show the form for editing the specified motorcycle model.
     */
    public function edit(MotorcycleModel $motorcycle): Response
    {
        return Inertia::render('admin/motorcycles/edit', [
            'motorcycleModel' => [
                'id' => $motorcycle->CodiceModello,
                'brand' => $motorcycle->Marca,
                'name' => $motorcycle->Nome,
                'model_code' => $motorcycle->CodiceModello,
                'engine_size' => $motorcycle->Cilindrata,
                'segment' => $motorcycle->Segmento,
                'power' => $motorcycle->Potenza,
            ],
        ]);
    }

    /**
     * Update the specified motorcycle model.
     */
    public function update(Request $request, MotorcycleModel $motorcycle): RedirectResponse
    {
        $validated = $request->validate([
            'brand' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'model_code' => 'required|string|max:255|unique:MODELLI,CodiceModello,' . $motorcycle->CodiceModello . ',CodiceModello',
            'engine_size' => 'required|integer|min:50|max:2500',
            'segment' => 'required|string|in:sport,touring,naked,cruiser,adventure,enduro,scooter',
            'power' => 'required|integer|min:5|max:300',
        ]);

        $motorcycle->update([
            'Marca' => $validated['brand'],
            'Nome' => $validated['name'],
            'CodiceModello' => $validated['model_code'],
            'Cilindrata' => $validated['engine_size'],
            'Segmento' => $validated['segment'],
            'Potenza' => $validated['power'],
        ]);

        return redirect()->route('admin.motorcycles.show', $motorcycle)
            ->with('success', 'Motorcycle model updated successfully!');
    }

    /**
     * Remove the specified motorcycle model.
     */
    public function destroy(MotorcycleModel $motorcycle): RedirectResponse
    {
        // Check if model has any motorcycles
        if ($motorcycle->motorcycles()->count() > 0) {
            return redirect()->route('admin.motorcycles.index')
                ->with('error', 'Cannot delete motorcycle model that has associated motorcycles.');
        }

        $motorcycle->delete();

        return redirect()->route('admin.motorcycles.index')
            ->with('success', 'Motorcycle model deleted successfully!');
    }
} 