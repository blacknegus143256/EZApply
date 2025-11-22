<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function show(): Response
    {
        return Inertia::render('Notifications/NotificationCenter');
    }

    public function index(Request $request)
    {
        $user = Auth::user();
        $limit = $request->input('limit', 100); // Increased limit for notification center
        
        $notifications = $user->notifications()
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'data' => $notification->data,
                    'read_at' => $notification->read_at?->toISOString(),
                    'created_at' => $notification->created_at->toISOString(),
                ];
            });

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $user->unreadNotifications()->count(),
        ]);
    }

    public function unreadCount()
    {
        $user = Auth::user();
        return response()->json([
            'unread_count' => $user->unreadNotifications()->count(),
        ]);
    }

    public function markAsRead(Request $request, $id)
    {
        $user = Auth::user();
        $notification = $user->notifications()->find($id);
        
        if ($notification) {
            $notification->markAsRead();
        }

        return response()->json(['success' => true]);
    }

    public function markAllAsRead()
    {
        $user = Auth::user();
        $user->unreadNotifications->markAsRead();

        return response()->json(['success' => true]);
    }
}
