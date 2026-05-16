<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $projects = $request->user()->projects()->latest()->get();

        return response()->json($projects);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        $project = $request->user()->projects()->create($data);

        return response()->json($project, 201);
    }

    public function show(Request $request, Project $project)
    {
        abort_unless($project->user_id === $request->user()->id, 404);

        return response()->json($project);
    }

    public function update(Request $request, Project $project)
    {
        abort_unless($project->user_id === $request->user()->id, 404);

        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        $project->update($data);

        return response()->json($project);
    }

    public function destroy(Request $request, Project $project)
    {
        abort_unless($project->user_id === $request->user()->id, 404);

        $project->delete();

        return response()->json(['message' => 'Project deleted successfully.']);
    }
}
