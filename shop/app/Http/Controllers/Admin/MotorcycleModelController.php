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
            ->orderBy('brand')
            ->orderBy('name')
            ->paginate(20);

        $modelsData = $motorcycleModels->through(function ($model) {
            return [
                'id' => $model->id,
                'brand' => $model->brand,
                'name' => $model->name,
                'model_code' => $model->model_code,
                'engine_size' => $model->engine_size,
                'segment' => $model->segment,
                'power' => $model->power,
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
            'model_code' => 'required|string|max:255|unique:motorcycle_models,model_code',
            'engine_size' => 'required|integer|min:50|max:2500',
            'segment' => 'required|string|in:sport,touring,naked,cruiser,adventure,enduro,scooter',
            'power' => 'required|integer|min:5|max:300',
        ]);

        $model = MotorcycleModel::create($validated);

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
            'id' => $motorcycle->id,
            'brand' => $motorcycle->brand,
            'name' => $motorcycle->name,
            'model_code' => $motorcycle->model_code,
            'engine_size' => $motorcycle->engine_size,
            'segment' => $motorcycle->segment,
            'power' => $motorcycle->power,
            'created_at' => $motorcycle->created_at->format('Y-m-d H:i'),
        ];

        $motorcycles = $motorcycle->motorcycles->map(function ($bike) {
            return [
                'id' => $bike->id,
                'license_plate' => $bike->license_plate,
                'registration_year' => $bike->registration_year,
                'vin' => $bike->vin,
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
                'id' => $motorcycle->id,
                'brand' => $motorcycle->brand,
                'name' => $motorcycle->name,
                'model_code' => $motorcycle->model_code,
                'engine_size' => $motorcycle->engine_size,
                'segment' => $motorcycle->segment,
                'power' => $motorcycle->power,
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
            'model_code' => 'required|string|max:255|unique:motorcycle_models,model_code,' . $motorcycle->id,
            'engine_size' => 'required|integer|min:50|max:2500',
            'segment' => 'required|string|in:sport,touring,naked,cruiser,adventure,enduro,scooter',
            'power' => 'required|integer|min:5|max:300',
        ]);

        $motorcycle->update($validated);

        return redirect()->route('admin.motorcycles.show', $motorcycle)
            ->with('success', 'Motorcycle model updated successfully!');
    }

    /**
     * Remove the specified motorcycle model.
     */
    public function destroy(MotorcycleModel $motorcycle): RedirectResponse
    {
        // Check if any motorcycles use this model
        $motorcyclesCount = $motorcycle->motorcycles()->count();

        if ($motorcyclesCount > 0) {
            return redirect()->route('admin.motorcycles.index')
                ->with('error', 'Cannot delete motorcycle model that is in use by motorcycles.');
        }

        $motorcycle->delete();

        return redirect()->route('admin.motorcycles.index')
            ->with('success', 'Motorcycle model deleted successfully!');
    }
} 