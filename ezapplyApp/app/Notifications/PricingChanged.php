<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PricingChanged extends Notification implements ShouldBroadcast
{
    use Queueable;

    public $oldPackageCost;
    public $newPackageCost;

    /**
     * Create a new notification instance.
     */
    public function __construct(float $oldPackageCost, float $newPackageCost)
    {
        $this->oldPackageCost = $oldPackageCost;
        $this->newPackageCost = $newPackageCost;
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
        $changes = [];
        if ($this->oldPackageCost != $this->newPackageCost) {
            $changes[] = "Package Cost: ₱{$this->oldPackageCost} → ₱{$this->newPackageCost}";
        }

        return (new MailMessage)
            ->subject("Pricing Update - EZ Apply")
            ->line("The pricing for purchasing applicant packages has been updated.")
            ->lines($changes)
            ->action('View Credits', url('/credit-balance'))
            ->line('Please review the new pricing before making purchases.')
            ->line('Thank you for using EZApply!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $changes = [];
        if ($this->oldPackageCost != $this->newPackageCost) {
            $changes[] = "Package Cost: ₱{$this->oldPackageCost} → ₱{$this->newPackageCost}";
        }

        return [
            'type' => 'pricing_changed',
            'old_package_cost' => $this->oldPackageCost,
            'new_package_cost' => $this->newPackageCost,
            'message' => 'Pricing has been updated. ' . implode('. ', $changes),
            'url' => '/credit-balance',
        ];
    }
}

