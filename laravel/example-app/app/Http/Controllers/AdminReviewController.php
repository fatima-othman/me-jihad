<?php

namespace App\Http\Controllers;

use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminReviewController extends Controller
{
    public function index()
    {
        $reviews = Review::with(['user:id,name,email', 'project:id,name'])
            ->latest()
            ->get()
            ->map(fn (Review $review): array => $this->formatReview($review));

        $average = $reviews->count()
            ? round($reviews->avg('rating'), 1)
            : 0.0;

        return response()->json([
            'reviews' => $reviews,
            'stats' => [
                'total' => $reviews->count(),
                'published' => $reviews->where('status', 'Published')->count(),
                'pending' => $reviews->where('status', 'Pending')->count(),
                'average' => number_format($average, 1),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => ['nullable', 'exists:users,id'],
            'project_id' => ['nullable', 'exists:projects,id'],
            'report_id' => ['nullable', 'exists:reports,id'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'status' => ['nullable', Rule::in(['Published', 'Pending', 'Flagged'])],
            'text' => ['required', 'string'],
        ]);

        $review = Review::create([
            ...$validated,
            'status' => $validated['status'] ?? 'Pending',
        ]);

        return response()->json([
            'message' => 'Review created successfully',
            'review' => $this->formatReview($review->load(['user:id,name,email', 'project:id,name'])),
        ], 201);
    }

    public function update(Request $request, Review $review)
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(['Published', 'Pending', 'Flagged'])],
        ]);

        $review->update($validated);

        return response()->json([
            'message' => 'Review updated successfully',
            'review' => $this->formatReview($review->fresh()->load(['user:id,name,email', 'project:id,name'])),
        ]);
    }

    public function destroy(Review $review)
    {
        $review->delete();

        return response()->json([
            'message' => 'Review deleted successfully',
        ]);
    }

    private function formatReview(Review $review): array
    {
        return [
            'id' => $review->id,
            'user' => $review->user?->name ?: 'Unknown user',
            'email' => $review->user?->email ?: 'Unknown email',
            'project' => $review->project?->name ?: 'General feedback',
            'rating' => $review->rating,
            'status' => $review->status,
            'date' => optional($review->created_at)->toDateString(),
            'text' => $review->text,
        ];
    }
}
