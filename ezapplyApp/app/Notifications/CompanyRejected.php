<?php

namespace App\Notifications;

use App\Models\Company;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CompanyRejected extends Notification implements ShouldBroadcast
{
    use Queueable;

    public $company;
    public $reason;

    /**
     * Create a new notification instance.
     */
    public function __construct(Company $company, ?string $reason = null)
    {
        $this->company = $company;
        $this->reason = $reason;
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
        $message = (new MailMessage)
            ->subject("Company Registration Rejected - {$this->company->company_name}")
            ->line("Unfortunately, your company registration for {$this->company->company_name} has been rejected.");
        
        if ($this->reason) {
            $message->line("Reason: {$this->reason}");
        }
        
        return $message
            ->line("Please review your submission and resubmit if needed.")
            ->action('Edit Company', url('/company/register'))
            ->line('Thank you for using EZApply!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $message = "Your company {$this->company->company_name} has been rejected.";
        if ($this->reason) {
            $message .= " Reason: {$this->reason}";
        }
        
        return [
            'type' => 'company_rejected',
            'company_id' => $this->company->id,
            'company_name' => $this->company->company_name,
            'reason' => $this->reason,
            'message' => $message,
            'url' => '/company/register',
        ];
    }
}
