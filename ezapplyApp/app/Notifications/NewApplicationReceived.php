<?php

namespace App\Notifications;

use App\Models\Application;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewApplicationReceived extends Notification implements ShouldBroadcast
{
    use Queueable;

    public $application;

    /**
     * Create a new notification instance.
     */
    public function __construct(Application $application)
    {
        // Load relationships if not already loaded
        if (!$application->relationLoaded('user')) {
            $application->load('user.basicInfo');
        }
        if (!$application->relationLoaded('company')) {
            $application->load('company');
        }
        $this->application = $application;
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
        $applicantName = $this->application->user->basicInfo 
            ? "{$this->application->user->basicInfo->first_name} {$this->application->user->basicInfo->last_name}"
            : $this->application->user->email;
        $companyName = $this->application->company->company_name ?? 'Your Company';
        
        return (new MailMessage)
            ->subject("New Application Received - {$companyName}")
            ->line("You have received a new application from {$applicantName}.")
            ->action('View Application', url('/company-applicants'))
            ->line('Thank you for using EZApply!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $applicantName = $this->application->user->basicInfo 
            ? "{$this->application->user->basicInfo->first_name} {$this->application->user->basicInfo->last_name}"
            : $this->application->user->email;
        $companyName = $this->application->company->company_name ?? 'Your Company';
        
        return [
            'type' => 'new_application_received',
            'application_id' => $this->application->id,
            'company_id' => $this->application->company_id,
            'company_name' => $companyName,
            'applicant_name' => $applicantName,
            'applicant_id' => $this->application->user_id,
            'message' => "You have received a new application from {$applicantName}.",
            'url' => '/company-applicants',
        ];
    }
}
