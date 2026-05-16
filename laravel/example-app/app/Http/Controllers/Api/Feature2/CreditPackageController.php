<?php

namespace App\Http\Controllers\Api\Feature2;

use App\Http\Controllers\Controller;
use App\Models\CreditPackage;
use Illuminate\Http\Request;

class CreditPackageController extends Controller
{
    public function index()
    {
        return response()->json(
            CreditPackage::query()
                ->where('is_active', true)
                ->orderBy('credits')
                ->get()
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'credits' => ['required', 'integer', 'min:1'],
            'price' => ['required', 'numeric', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $package = CreditPackage::create($data);

        return response()->json($package, 201);
    }

    public function show(CreditPackage $creditPackage)
    {
        return response()->json($creditPackage);
    }

    public function update(Request $request, CreditPackage $creditPackage)
    {
        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'credits' => ['sometimes', 'required', 'integer', 'min:1'],
            'price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $creditPackage->update($data);

        return response()->json($creditPackage);
    }

    public function destroy(CreditPackage $creditPackage)
    {
        $creditPackage->delete();

        return response()->json(['message' => 'Credit package deleted successfully.']);
    }
}
