<?php

namespace App\Notifications;

use App\Models\Message;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewMessageReceived extends Notification implements ShouldBroadcast
{
    use Queueable;

    public $message;

    /**
     * Create a new notification instance.
     */
    public function __construct(Message $message)
    {
        // Load relationships if not already loaded
        if (!$message->relationLoaded('sender')) {
            $message->load('sender.basicInfo');
        }
        $this->message = $message;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $sender = $this->message->sender;
        $senderName = $sender->basicInfo 
            ? "{$sender->basicInfo->first_name} {$sender->basicInfo->last_name}"
            : $sender->email;
        
        return (new MailMessage)
            ->subject("New Message from {$senderName}")
            ->line("You have received a new message from {$senderName}.")
            ->line(substr($this->message->message, 0, 100) . '...')
            ->action('View Message', url("/chat/{$this->message->sender_id}"))
            ->line('Thank you for using EZApply!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $sender = $this->message->sender;
        $senderName = $sender->basicInfo 
            ? "{$sender->basicInfo->first_name} {$sender->basicInfo->last_name}"
            : $sender->email;
        
        return [
            'type' => 'new_message_received',
            'message_id' => $this->message->id,
            'sender_id' => $this->message->sender_id,
            'sender_name' => $senderName,
            'message_preview' => substr($this->message->message, 0, 100),
            'message' => "You have received a new message from {$senderName}.",
            'url' => "/chat/{$this->message->sender_id}",
        ];
    }
}
