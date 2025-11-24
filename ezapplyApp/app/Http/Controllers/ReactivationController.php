<?php

namespace App\Http\Controllers;

use App\Models\ReactivationRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ReactivationController extends Controller
{
    /**
     * Show reactivation request page for deactivated users
     */
    public function show(Request $request): Response
    {
        // Check if user is logged in and deactivated
        if (!Auth::check() || !Auth::user()->isDeactivated()) {
            return redirect('/login')->withErrors([
                'email' => 'You must be logged in with a deactivated account to request reactivation.'
            ]);
        }

        $user = Auth::user();
        
        // Check if there's a pending request
        $pendingRequest = ReactivationRequest::where('user_id', $user->id)
            ->where('status', 'pending')
            ->first();

        return Inertia::render('Auth/AccountReactivation', [
            'user' => $user,
            'pendingRequest' => $pendingRequest,
        ]);
    }

    /**
     * Submit a reactivation request
     */
    public function store(Request $request)
    {
        $request->validate([
            'reason' => 'nullable|string|max:1000',
        ]);

        $user = Auth::user();

        if (!$user->isDeactivated()) {
            return redirect()->back()->withErrors([
                'message' => 'Your account is not deactivated.'
            ]);
        }

        // Check if there's already a pending request
        $existingRequest = ReactivationRequest::where('user_id', $user->id)
            ->where('status', 'pending')
            ->first();

        if ($existingRequest) {
            return redirect()->back()->withErrors([
                'message' => 'You already have a pending reactivation request. Please wait for admin review.'
            ]);
        }

        // Create reactivation request
        ReactivationRequest::create([
            'user_id' => $user->id,
            'email' => $user->email,
            'reason' => $request->reason,
            'status' => 'pending',
        ]);

        return redirect()->back()->with('success', 'Your reactivation request has been submitted. An admin will review it shortly.');
    }

    /**
     * Show reactivation requests for admin
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $statusFilter = $request->input('status');
        $typeFilter = $request->input('type', 'all'); // 'all', 'reactivation', 'deactivation'

        // Get reactivation requests
        $reactivationRequestsQuery = ReactivationRequest::with([
            'user' => function ($query) {
                $query->with('basicInfo');
            },
            'reviewedBy'
        ])
            ->orderBy('created_at', 'desc');

        // Get users pending deactivation (in grace period)
        $pendingDeactivationQuery = User::with('basicInfo')
            ->whereNotNull('deactivation_requested_at')
            ->where('is_deactivated', false)
            ->orderBy('deactivation_requested_at', 'desc');

        // Search filter for reactivation requests
        if ($search) {
            $reactivationRequestsQuery->where(function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                  ->orWhereHas('user.basicInfo', function ($query) use ($search) {
                      $query->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%");
                  });
            });

            // Search filter for pending deactivations
            $pendingDeactivationQuery->where(function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                  ->orWhereHas('basicInfo', function ($query) use ($search) {
                      $query->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%");
                  });
            });
        }

        // Status filter for reactivation requests
        if ($statusFilter && $statusFilter !== 'all') {
            $reactivationRequestsQuery->where('status', $statusFilter);
        }

        // Type filter
        $reactivationRequests = collect();
        $pendingDeactivations = collect();

        if ($typeFilter === 'all' || $typeFilter === 'reactivation') {
            $reactivationRequests = $reactivationRequestsQuery->get();
        }

        if ($typeFilter === 'all' || $typeFilter === 'deactivation') {
            $pendingDeactivations = $pendingDeactivationQuery->get();
        }

        // Combine and transform data
        $combinedData = collect();

        // Add pending deactivations as "pending_deactivation" type
        foreach ($pendingDeactivations as $user) {
            $combinedData->push([
                'id' => 'deactivation_' . $user->id,
                'type' => 'deactivation',
                'user_id' => $user->id,
                'email' => $user->email,
                'reason' => null,
                'status' => 'pending_deactivation',
                'reviewed_by' => null,
                'reviewed_at' => null,
                'admin_notes' => null,
                'created_at' => $user->deactivation_requested_at->toDateTimeString(),
                'deactivation_scheduled_at' => $user->deactivation_scheduled_at ? $user->deactivation_scheduled_at->toDateTimeString() : null,
                'user' => [
                    'id' => $user->id,
                    'email' => $user->email,
                    'basicInfo' => $user->basicInfo ? [
                        'first_name' => $user->basicInfo->first_name,
                        'last_name' => $user->basicInfo->last_name,
                    ] : null,
                ],
                'reviewedBy' => null,
            ]);
        }

        // Add reactivation requests
        foreach ($reactivationRequests as $req) {
            $combinedData->push([
                'id' => $req->id,
                'type' => 'reactivation',
                'user_id' => $req->user_id,
                'email' => $req->email,
                'reason' => $req->reason,
                'status' => $req->status,
                'reviewed_by' => $req->reviewed_by,
                'reviewed_at' => $req->reviewed_at ? $req->reviewed_at->toDateTimeString() : null,
                'admin_notes' => $req->admin_notes,
                'created_at' => $req->created_at->toDateTimeString(),
                'deactivation_scheduled_at' => null,
                'user' => $req->user ? [
                    'id' => $req->user->id,
                    'email' => $req->user->email,
                    'basicInfo' => $req->user->basicInfo ? [
                        'first_name' => $req->user->basicInfo->first_name,
                        'last_name' => $req->user->basicInfo->last_name,
                    ] : null,
                ] : null,
                'reviewedBy' => $req->reviewedBy ? [
                    'id' => $req->reviewedBy->id,
                    'email' => $req->reviewedBy->email,
                ] : null,
            ]);
        }

        // Sort by created_at descending
        $combinedData = $combinedData->sortByDesc('created_at')->values();

        // Paginate manually
        $page = $request->input('page', 1);
        $perPage = 15;
        $total = $combinedData->count();
        $items = $combinedData->slice(($page - 1) * $perPage, $perPage)->values();

        // Create pagination structure
        $paginatedData = [
            'data' => $items->toArray(),
            'total' => $total,
            'from' => $total > 0 ? (($page - 1) * $perPage) + 1 : 0,
            'to' => min($page * $perPage, $total),
            'current_page' => (int) $page,
            'last_page' => (int) ceil($total / $perPage),
            'per_page' => $perPage,
            'links' => $this->generatePaginationLinks($page, ceil($total / $perPage), $request->fullUrlWithQuery([])),
        ];

        return Inertia::render('Admin/ReactivationRequests', [
            'requests' => $paginatedData,
            'filters' => $request->only(['search', 'status', 'type']),
        ]);
    }

    /**
     * Generate pagination links
     */
    private function generatePaginationLinks($currentPage, $lastPage, $baseUrl)
    {
        $links = [];
        
        // Parse base URL to get query parameters
        $parsedUrl = parse_url($baseUrl);
        $queryParams = [];
        if (isset($parsedUrl['query'])) {
            parse_str($parsedUrl['query'], $queryParams);
        }
        $basePath = $parsedUrl['path'] ?? '/admin/reactivation-requests';
        
        // Previous link
        $prevParams = $queryParams;
        if ($currentPage > 1) {
            $prevParams['page'] = $currentPage - 1;
        }
        $links[] = [
            'url' => $currentPage > 1 ? $basePath . '?' . http_build_query($prevParams) : null,
            'label' => '&laquo; Previous',
            'active' => false,
        ];

        // Page number links
        for ($i = 1; $i <= $lastPage; $i++) {
            $pageParams = $queryParams;
            $pageParams['page'] = $i;
            $links[] = [
                'url' => $basePath . '?' . http_build_query($pageParams),
                'label' => (string) $i,
                'active' => $i == $currentPage,
            ];
        }

        // Next link
        $nextParams = $queryParams;
        if ($currentPage < $lastPage) {
            $nextParams['page'] = $currentPage + 1;
        }
        $links[] = [
            'url' => $currentPage < $lastPage ? $basePath . '?' . http_build_query($nextParams) : null,
            'label' => 'Next &raquo;',
            'active' => false,
        ];

        return $links;
    }

    /**
     * Approve a reactivation request
     */
    public function approve(Request $request, $id)
    {
        $reactivationRequest = ReactivationRequest::findOrFail($id);

        if ($reactivationRequest->status !== 'pending') {
            return redirect()->back()->withErrors([
                'message' => 'This request has already been processed.'
            ]);
        }

        $user = User::findOrFail($reactivationRequest->user_id);

        // Reactivate the account
        $user->is_deactivated = false;
        $user->deactivation_requested_at = null;
        $user->deactivation_scheduled_at = null;
        $user->save();

        // Update reactivation request
        $reactivationRequest->status = 'approved';
        $reactivationRequest->reviewed_by = $request->user()->id;
        $reactivationRequest->reviewed_at = now();
        $reactivationRequest->admin_notes = $request->admin_notes ?? null;
        $reactivationRequest->save();

        return redirect()->back()->with('success', 'Account reactivated successfully.');
    }

    /**
     * Reject a reactivation request
     */
    public function reject(Request $request, $id)
    {
        $reactivationRequest = ReactivationRequest::findOrFail($id);

        if ($reactivationRequest->status !== 'pending') {
            return redirect()->back()->withErrors([
                'message' => 'This request has already been processed.'
            ]);
        }

        $request->validate([
            'admin_notes' => 'required|string|max:500',
        ]);

        // Update reactivation request
        $reactivationRequest->status = 'rejected';
        $reactivationRequest->reviewed_by = $request->user()->id;
        $reactivationRequest->reviewed_at = now();
        $reactivationRequest->admin_notes = $request->admin_notes;
        $reactivationRequest->save();

        return redirect()->back()->with('success', 'Reactivation request rejected.');
    }
}
