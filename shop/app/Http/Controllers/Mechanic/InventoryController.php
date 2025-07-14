<?php

namespace App\Http\Controllers\Mechanic;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Part;

class InventoryController extends Controller
{
    /**
     * Display the parts inventory.
     */
    public function index(Request $request)
    {
        $parts = Part::with('supplier')
            ->orderBy('Nome', 'asc')
            ->paginate(20);

        return Inertia::render('mechanic/Inventory', [
            'parts' => $parts,
        ]);
    }
}
