<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $projects = Project::where('user_id', $request->user()->id)
            ->withCount('reports')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($project) {
                $project->type = $project->business_type;
                $project->country = $project->market;
                $project->reports = $project->reports_count;
                $project->lastDate = optional($project->updated_at)->toDateString();

                return $project;
            });

        return response()->json($projects);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'business_type' => 'nullable|string',
            'type' => 'nullable|string',
        ]);

        $project = Project::create([
            'user_id' => $request->user()->id,
            'name' => $request->name,
            'business_type' => $request->business_type ?? $request->type,
            'description' => $request->description,
            'stage' => $request->stage,
            'employees' => $request->employees,
            'budget' => $request->budget,
            'market' => $request->market ?? $request->country,
            'competitors' => $request->competitors,
            'language' => $request->language ?? 'English',
        ]);

        return response()->json([
            'message' => 'Project added successfully',
            'project' => $project,
        ], 201);
    }

    public function show($id)
    {
        $project = Project::where('id', $id)
            ->where('user_id', request()->user()->id)
            ->firstOrFail();

        $project->type = $project->business_type;
        $project->country = $project->market;

        return response()->json($project);
    }

    public function update(Request $request, $id)
    {
        $project = Project::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $project->fill($request->only([
            'name',
            'business_type',
            'description',
            'stage',
            'employees',
            'budget',
            'market',
            'competitors',
            'language',
        ]));

        if ($request->filled('type')) {
            $project->business_type = $request->type;
        }

        if ($request->filled('country')) {
            $project->market = $request->country;
        }

        $project->save();

        return response()->json([
            'message' => 'Project updated successfully',
            'project' => $project,
        ]);
    }

    public function destroy($id)
    {
        $project = Project::where('id', $id)
            ->where('user_id', request()->user()->id)
            ->firstOrFail();

        $project->delete();

        return response()->json(['message' => 'Project deleted']);
    }
}
