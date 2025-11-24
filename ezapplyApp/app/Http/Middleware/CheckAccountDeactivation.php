<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckAccountDeactivation
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check()) {
            $user = Auth::user();

            // Check if user has requested deactivation (grace period)
            if ($user->hasRequestedDeactivation() && !$user->isDeactivated()) {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                return redirect('/login')->withErrors([
                    'email' => 'Your account deactivation has been requested. Please contact support if you wish to cancel this request.'
                ]);
            }

            // Check if user is deactivated - redirect to reactivation page
            if ($user->isDeactivated()) {
                // Allow access to reactivation page and logout route
                if ($request->routeIs('reactivation.*') || $request->routeIs('logout')) {
                    return $next($request);
                }

                // Redirect to reactivation page
                return redirect()->route('reactivation.show');
            }
        }

        return $next($request);
    }
}
