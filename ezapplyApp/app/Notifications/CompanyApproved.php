<?php

namespace App\Notifications;

use App\Models\Company;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CompanyApproved extends Notification implements ShouldBroadcast
{
    use Queueable;

    public $company;

    /**
     * Create a new notification instance.
     */
    public function __construct(Company $company)
    {
        $this->company = $company;
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
            ->subject("Company Approved - {$this->company->company_name}")
            ->line("Congratulations! Your company {$this->company->company_name} has been approved.")
            ->line("Your company is now live and visible to applicants.")
            ->action('View Company', url('/my-companies'))
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
            'type' => 'company_approved',
            'company_id' => $this->company->id,
            'company_name' => $this->company->company_name,
            'message' => "Congratulations! Your company {$this->company->company_name} has been approved and is now live.",
            'url' => '/my-companies',
        ];
    }
}
