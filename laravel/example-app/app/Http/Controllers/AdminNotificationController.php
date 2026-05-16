<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminNotificationController extends Controller
{
    public function index()
    {
        $notifications = Notification::latest()
            ->get()
            ->map(fn (Notification $notification): array => $this->formatNotification($notification));

        return response()->json([
            'notifications' => $notifications,
            'stats' => [
                'total' => $notifications->count(),
                'unread' => $notifications->where('status', 'Unread')->count(),
                'alerts' => $notifications->where('type', 'Alert')->count(),
                'system' => $notifications->where('type', 'System')->count(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string'],
            'type' => ['nullable', Rule::in(['User', 'Report', 'Alert', 'System'])],
            'is_read' => ['sometimes', 'boolean'],
        ]);

        $notification = Notification::create([
            ...$validated,
            'type' => $validated['type'] ?? 'System',
        ]);

        return response()->json([
            'message' => 'Notification created successfully',
            'notification' => $this->formatNotification($notification),
        ], 201);
    }

    public function update(Request $request, Notification $notification)
    {
        $validated = $request->validate([
            'is_read' => ['sometimes', 'boolean'],
            'type' => ['sometimes', Rule::in(['User', 'Report', 'Alert', 'System'])],
        ]);

        $notification->update($validated);

        return response()->json([
            'message' => 'Notification updated successfully',
            'notification' => $this->formatNotification($notification->fresh()),
        ]);
    }

    public function markAllRead()
    {
        Notification::query()->update(['is_read' => true]);

        return response()->json([
            'message' => 'All notifications marked as read',
        ]);
    }

    public function destroy(Notification $notification)
    {
        $notification->delete();

        return response()->json([
            'message' => 'Notification deleted successfully',
        ]);
    }

    private function formatNotification(Notification $notification): array
    {
        return [
            'id' => $notification->id,
            'title' => $notification->title,
            'message' => $notification->message,
            'type' => $notification->type ?: 'System',
            'status' => $notification->is_read ? 'Read' : 'Unread',
            'time' => optional($notification->created_at)->toISOString(),
        ];
    }
}
