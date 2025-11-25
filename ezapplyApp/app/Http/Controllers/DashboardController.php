<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Company;
use App\Models\Application;
use App\Models\CreditTransaction;
use App\Models\Message;
use App\Models\Contact;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        // Get user-specific statistics based on their role
        $stats = $this->getUserStats($user);
        
        // Get recent activities based on user role
        $activities = $this->getRecentActivities($user);

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'activities' => $activities,
        ]);
    }

    private function getUserStats(User $user)
    {
        $userRole = $user->roles()->first()?->name ?? 'customer';

        switch ($userRole) {
            case 'company':
                return $this->getCompanyUserStats($user);
            case 'customer':
                return $this->getCustomerUserStats($user);
            case 'admin':
                return $this->getAdminStats();
            default:
                return $this->getDefaultStats($user);
        }
    }

    private function getCompanyUserStats(User $user)
    {
        // For company users, show their own companies and applications to their companies
        $totalCompanies = $user->companies()->count();
        $totalApplications = Application::whereHas('company', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })->count();
        $pendingApplications = Application::whereHas('company', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })->where('status', 'pending')->count();
        $approvedCompanies = $user->companies()->where('status', 'approved')->count();

        return [
            'totalCompanies' => $totalCompanies,
            'totalApplications' => $totalApplications,
            'pendingApplications' => $pendingApplications,
            'approvedCompanies' => $approvedCompanies,
            'userRole' => 'company'
        ];
    }

    private function getCustomerUserStats(User $user)
    {
        // For customer users, show their applications and related stats
        $totalApplications = $user->applications()->count();
        $pendingApplications = $user->applications()->where('status', 'pending')->count();
        $approvedApplications = $user->applications()->where('status', 'approved')->count();
        $rejectedApplications = $user->applications()->where('status', 'rejected')->count();

        return [
            'totalApplications' => $totalApplications,
            'pendingApplications' => $pendingApplications,
            'approvedApplications' => $approvedApplications,
            'rejectedApplications' => $rejectedApplications,
            'userRole' => 'customer'
        ];
    }

    private function getAdminStats()
    {
        // For admin users, show global statistics
        $totalCompanies = Company::count();
        $totalApplications = Application::count();
        $totalUsers = User::count();
        $pendingApprovals = Company::where('status', 'pending')->count();

        return [
            'totalCompanies' => $totalCompanies,
            'totalApplications' => $totalApplications,
            'totalUsers' => $totalUsers,
            'pendingApprovals' => $pendingApprovals,
            'userRole' => 'admin'
        ];
    }

    private function getDefaultStats(User $user)
    {
        // Default stats for users without specific roles (treat as customer)
        $totalApplications = $user->applications()->count();
        $pendingApplications = $user->applications()->where('status', 'pending')->count();
        $approvedApplications = $user->applications()->where('status', 'approved')->count();
        $totalCompanies = Company::where('status', 'approved')->count(); // Available companies for application

        return [
            'totalApplications' => $totalApplications,
            'pendingApplications' => $pendingApplications,
            'approvedApplications' => $approvedApplications,
            'totalCompanies' => $totalCompanies,
            'userRole' => 'customer'
        ];
    }

    private function getRecentActivities(User $user, $limit = 10)
    {
        $userRole = $user->roles()->first()?->name ?? 'customer';
        $activities = [];

        switch ($userRole) {
            case 'admin':
                $activities = $this->getAdminActivities($limit);
                break;
            case 'company':
                $activities = $this->getCompanyActivities($user, $limit);
                break;
            case 'customer':
            default:
                $activities = $this->getCustomerActivities($user, $limit);
                break;
        }

        return $activities;
    }

    private function getAdminActivities($limit)
    {
        $activities = [];

        // Recent company approvals/rejections
        $recentCompanies = Company::with('user')
            ->whereIn('status', ['approved', 'rejected'])
            ->orderBy('updated_at', 'desc')
            ->limit(5)
            ->get();

        foreach ($recentCompanies as $company) {
            $activities[] = [
                'type' => 'company_status',
                'icon' => 'Building2',
                'title' => "Company {$company->status}",
                'description' => "{$company->brand_name} was {$company->status}",
                'timestamp' => $company->updated_at,
                'color' => $company->status === 'approved' ? 'text-green-600' : 'text-red-600',
                'bgColor' => $company->status === 'approved' ? 'bg-green-100' : 'bg-red-100',
            ];
        }

        // Recent user registrations
        $recentUsers = User::orderBy('created_at', 'desc')
            ->limit(3)
            ->get();

        foreach ($recentUsers as $newUser) {
            $activities[] = [
                'type' => 'user_registered',
                'icon' => 'UserPlus',
                'title' => 'New User Registration',
                'description' => "{$newUser->email} registered",
                'timestamp' => $newUser->created_at,
                'color' => 'text-blue-600',
                'bgColor' => 'bg-blue-100',
            ];
        }

        // Recent contact inquiries
        $recentContacts = Contact::orderBy('created_at', 'desc')
            ->limit(2)
            ->get();

        foreach ($recentContacts as $contact) {
            $activities[] = [
                'type' => 'inquiry',
                'icon' => 'Mail',
                'title' => 'New Inquiry',
                'description' => "From {$contact->first_name} {$contact->last_name}",
                'timestamp' => $contact->created_at,
                'color' => 'text-purple-600',
                'bgColor' => 'bg-purple-100',
            ];
        }

        // Sort by timestamp and limit
        usort($activities, function($a, $b) {
            return strtotime($b['timestamp']) - strtotime($a['timestamp']);
        });

        return array_slice($activities, 0, $limit);
    }

    private function getCompanyActivities(User $user, $limit)
    {
        $activities = [];

        // Recent applications to their companies
        $recentApplications = Application::with(['user.basicInfo', 'company'])
            ->whereHas('company', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        foreach ($recentApplications as $application) {
            $applicantName = $application->user->basicInfo 
                ? "{$application->user->basicInfo->first_name} {$application->user->basicInfo->last_name}"
                : $application->user->email;

            $activities[] = [
                'type' => 'new_application',
                'icon' => 'FileText',
                'title' => 'New Application Received',
                'description' => "{$applicantName} applied to {$application->company->brand_name}",
                'timestamp' => $application->created_at,
                'color' => 'text-blue-600',
                'bgColor' => 'bg-blue-100',
            ];
        }

        // Application status changes
        $statusChanges = Application::with(['user.basicInfo', 'company'])
            ->whereHas('company', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->where('updated_at', '>', now()->subDays(7))
            ->whereColumn('updated_at', '>', 'created_at')
            ->orderBy('updated_at', 'desc')
            ->limit(3)
            ->get();

        foreach ($statusChanges as $application) {
            if ($application->status !== 'pending') {
                $applicantName = $application->user->basicInfo 
                    ? "{$application->user->basicInfo->first_name} {$application->user->basicInfo->last_name}"
                    : $application->user->email;

                $activities[] = [
                    'type' => 'application_status',
                    'icon' => $application->status === 'approved' ? 'CheckCircle2' : 'XCircle',
                    'title' => "Application {$application->status}",
                    'description' => "Application from {$applicantName} was {$application->status}",
                    'timestamp' => $application->updated_at,
                    'color' => $application->status === 'approved' ? 'text-green-600' : 'text-red-600',
                    'bgColor' => $application->status === 'approved' ? 'bg-green-100' : 'bg-red-100',
                ];
            }
        }

        // Credit transactions
        $creditTransactions = CreditTransaction::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(2)
            ->get();

        foreach ($creditTransactions as $transaction) {
            $activities[] = [
                'type' => 'credit_transaction',
                'icon' => 'CreditCard',
                'title' => 'Credit Transaction',
                'description' => $transaction->description ?? "Credit {$transaction->type}",
                'timestamp' => $transaction->created_at,
                'color' => 'text-indigo-600',
                'bgColor' => 'bg-indigo-100',
            ];
        }

        // Sort by timestamp and limit
        usort($activities, function($a, $b) {
            return strtotime($b['timestamp']) - strtotime($a['timestamp']);
        });

        return array_slice($activities, 0, $limit);
    }

    private function getCustomerActivities(User $user, $limit)
    {
        $activities = [];

        // Recent application status changes
        $recentApplications = Application::with('company')
            ->where('user_id', $user->id)
            ->orderBy('updated_at', 'desc')
            ->limit(5)
            ->get();

        foreach ($recentApplications as $application) {
            if ($application->status === 'pending' && $application->created_at->diffInHours(now()) < 24) {
                $activities[] = [
                    'type' => 'application_submitted',
                    'icon' => 'FileText',
                    'title' => 'Application Submitted',
                    'description' => "You applied to {$application->company->brand_name}",
                    'timestamp' => $application->created_at,
                    'color' => 'text-blue-600',
                    'bgColor' => 'bg-blue-100',
                ];
            } elseif ($application->status !== 'pending' && $application->updated_at->diffInDays(now()) < 7) {
                $activities[] = [
                    'type' => 'application_status',
                    'icon' => $application->status === 'approved' ? 'CheckCircle2' : 'XCircle',
                    'title' => "Application {$application->status}",
                    'description' => "Your application to {$application->company->brand_name} was {$application->status}",
                    'timestamp' => $application->updated_at,
                    'color' => $application->status === 'approved' ? 'text-green-600' : 'text-red-600',
                    'bgColor' => $application->status === 'approved' ? 'bg-green-100' : 'bg-red-100',
                ];
            }
        }

        // Recent messages (if any)
        $recentMessages = Message::where('receiver_id', $user->id)
            ->whereNull('read_at')
            ->orderBy('created_at', 'desc')
            ->limit(2)
            ->get();

        foreach ($recentMessages as $message) {
            $activities[] = [
                'type' => 'new_message',
                'icon' => 'MessageCircle',
                'title' => 'New Message',
                'description' => 'You have a new message',
                'timestamp' => $message->created_at,
                'color' => 'text-purple-600',
                'bgColor' => 'bg-purple-100',
            ];
        }

        // Sort by timestamp and limit
        usort($activities, function($a, $b) {
            return strtotime($b['timestamp']) - strtotime($a['timestamp']);
        });

        return array_slice($activities, 0, $limit);
    }
}
