<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\User;
use App\Services\FirebaseService;
use App\Notifications\NewMessageReceived;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MessageController extends Controller
{
    protected $firebaseService;

    public function __construct(FirebaseService $firebaseService)
    {
        $this->firebaseService = $firebaseService;
    }

    public function store(Request $request, User $user)
    {
        $request->validate([
            'message' => 'required|string|max:2000',
        ]);

        $message = Message::create([
            'sender_id' => Auth::id(),
            'receiver_id' => $user->id,
            'message' => $request->message,
        ]);

        // Load sender relationship for notification
        $message->load('sender.basicInfo');

        // Send message to Firebase Realtime Database
        try {
            $this->firebaseService->sendMessage([
                'id' => $message->id,
                'sender_id' => $message->sender_id,
                'receiver_id' => $message->receiver_id,
                'message' => $message->message,
                'created_at' => $message->created_at->toISOString(),
            ], Auth::id(), $user->id);
        } catch (\Exception $e) {
            \Log::error('Failed to send message to Firebase: ' . $e->getMessage());
            // Continue even if Firebase fails - message is still saved in database
        }

        // Notify receiver of new message (only if they're not viewing the chat)
        $user->notify(new NewMessageReceived($message));

        return redirect()->back();
    }

    public function index(Request $request, User $user)
{
    $authUser = $request->user();
    
    // Load the basicInfo relationship
    $user->load('basicInfo');

    $messages = Message::where(function ($query) use ($authUser, $user) {
            $query->where('sender_id', $authUser->id)
                  ->where('receiver_id', $user->id);
        })
        ->orWhere(function ($query) use ($authUser, $user) {
            $query->where('sender_id', $user->id)
                  ->where('receiver_id', $authUser->id);
        })
        ->orderBy('created_at')
        ->get();

    return Inertia::render('Chat/Chat-page', [
        'messages' => $messages,
        'auth' => ['user' => $authUser],
        'otherUser' => [
            'id' => $user->id,
            'first_name' => $user->basicInfo?->first_name ?? '',
            'last_name' => $user->basicInfo?->last_name ?? '',
            'email' => $user->email,
        ],
    ]);
}
public function viewChats()
{
    $authUser = Auth::user();

    $messages = Message::where('sender_id', $authUser->id)
        ->orWhere('receiver_id', $authUser->id)
        ->orderBy('created_at', 'desc')
        ->get();

    $chats = collect();
    foreach ($messages as $msg) {
        $otherUserId = $msg->sender_id === $authUser->id ? $msg->receiver_id : $msg->sender_id;

        if ($chats->contains('userId', $otherUserId)) continue;

        $otherUser = User::with('basicInfo')->find($otherUserId);

        $chats->push([
            'userId' => $otherUser->id,
            'email' => $otherUser->email,
            'first_name' => $otherUser->basicInfo?->first_name ?? '',
            'last_name' => $otherUser->basicInfo?->last_name ?? '',
            'lastMessage' => $msg->message,
            'lastMessageAt' => $msg->created_at,
        ]);
    }

    return Inertia::render('Chat/Chat-list', [
        'chats' => $chats->values(),
    ]);
}
}
