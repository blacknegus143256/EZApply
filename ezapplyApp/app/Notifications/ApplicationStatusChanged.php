<?php

namespace App\Notifications;

use App\Models\Application;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ApplicationStatusChanged extends Notification implements ShouldBroadcast
{
    use Queueable;

    public $application;
    public $status;

    /**
     * Create a new notification instance.
     */
    public function __construct(Application $application, string $status)
    {
        // Load relationships if not already loaded
        if (!$application->relationLoaded('company')) {
            $application->load('company');
        }
        $this->application = $application;
        $this->status = $status;
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
        $statusLabel = ucfirst($this->status);
        $companyName = $this->application->company->company_name ?? 'Unknown Company';
        
        return (new MailMessage)
            ->subject("Application Status Updated - {$statusLabel}")
            ->line("Your application to {$companyName} has been {$this->status}.")
            ->action('View Application', url('/applicant/franchise/appliedcompanies'))
            ->line('Thank you for using EZApply!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $companyName = $this->application->company->company_name ?? 'Unknown Company';
        
        return [
            'type' => 'application_status_changed',
            'application_id' => $this->application->id,
            'company_id' => $this->application->company_id,
            'company_name' => $companyName,
            'status' => $this->status,
            'status_label' => ucfirst($this->status),
            'message' => "Your application to {$companyName} has been {$this->status}.",
            'url' => '/applicant/franchise/appliedcompanies',
        ];
    }
}
