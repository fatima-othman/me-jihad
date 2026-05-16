<?php

namespace App\Http\Controllers;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminProjectController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'name' => ['required', 'string', 'max:255'],
            'business_type' => ['nullable', 'string', 'max:255'],
            'business_name' => ['nullable', 'string', 'max:255'],
            'industry' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'stage' => ['nullable', 'string', 'max:255'],
            'employees' => ['nullable', 'string', 'max:255'],
            'budget' => ['nullable', 'string', 'max:255'],
            'market' => ['nullable', 'string'],
            'competitors' => ['nullable', 'string'],
            'language' => ['nullable', 'string', 'in:Arabic,English'],
        ]);

        $validated['business_type'] = $validated['business_type'] ?? $validated['industry'] ?? 'General';
        $validated['language'] = $validated['language'] ?? 'English';
        unset($validated['business_name'], $validated['industry']);

        $project = Project::create($validated);

        return response()->json([
            'message' => 'Project created successfully.',
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
                'business_name' => $project->name,
                'business_type' => $project->business_type,
                'industry' => $project->business_type,
                'description' => $project->description,
                'stage' => $project->stage,
                'employees' => $project->employees,
                'budget' => $project->budget,
                'market' => $project->market,
                'competitors' => $project->competitors,
                'language' => $project->language,
                'owner_name' => $project->user?->name,
                'owner_email' => $project->user?->email,
                'reports_count' => 0,
            ],
        ], 201);
    }
}
