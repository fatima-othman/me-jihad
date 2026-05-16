<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Review;
use Illuminate\Http\Request;

class UserReviewController extends Controller
{
    public function index(Request $request)
    {
        $reviews = Review::query()
            ->where('user_id', $request->user()->id)
            ->whereNotNull('project_id')
            ->latest()
            ->get(['id', 'project_id', 'rating', 'status', 'text', 'created_at', 'updated_at']);

        return response()->json([
            'reviews' => $reviews,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_id' => ['required', 'integer'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'text' => ['nullable', 'string'],
        ]);

        $project = Project::query()
            ->where('id', $validated['project_id'])
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $reviewText = trim((string) ($validated['text'] ?? ''));
        if ($reviewText === '') {
            $reviewText = sprintf('Rated %s with %d stars.', $project->name, (int) $validated['rating']);
        }

        $review = Review::query()->updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'project_id' => $project->id,
            ],
            [
                'rating' => (int) $validated['rating'],
                'status' => 'Pending',
                'text' => $reviewText,
                'report_id' => null,
            ]
        );

        return response()->json([
            'message' => 'Review saved successfully',
            'review' => $review,
        ]);
    }
}

