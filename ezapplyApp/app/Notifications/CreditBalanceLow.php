<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CreditBalanceLow extends Notification implements ShouldBroadcast
{
    use Queueable;

    public $balance;
    public $threshold;

    /**
     * Create a new notification instance.
     */
    public function __construct(int $balance, int $threshold = 5)
    {
        $this->balance = $balance;
        $this->threshold = $threshold;
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
        return (new MailMessage)
            ->subject("Low Credit Balance Alert")
            ->line("Your credit balance is running low!")
            ->line("Current balance: {$this->balance} credits")
            ->line("Please top up your credits to continue viewing applicant profiles.")
            ->action('Add Credits', url('/credit-balance'))
            ->line('Thank you for using EZApply!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'credit_balance_low',
            'balance' => $this->balance,
            'threshold' => $this->threshold,
            'message' => "Your credit balance is low ({$this->balance} credits remaining). Top up now to continue viewing applicant profiles.",
            'url' => '/credit-balance',
        ];
    }
}
