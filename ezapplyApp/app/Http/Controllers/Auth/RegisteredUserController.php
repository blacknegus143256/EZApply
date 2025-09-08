<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        // Get all available roles from DB
        $roles = Role::pluck('name');

        return Inertia::render('auth/register', [
            'roles' => $roles,
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'first_name'       => ['required', 'string', 'max:255'],
            'last_name'        => ['required', 'string', 'max:255'],
            'email'            => ['required', 'string', 'email', 'max:255', 'unique:'.User::class],
            'phone_number'     => ['required', 'string', 'max:20'],
            'password'         => ['required', 'confirmed', Rules\Password::defaults()],
            'users_address.region_code' => ['required', 'string'],
            'users_address.region_name' => ['required', 'string'],
            'users_address.province_code' => ['required', 'string'],
            'users_address.province_name' => ['required', 'string'],
            'users_address.citymun_code' => ['required', 'string'],
            'users_address.citymun_name' => ['required', 'string'],
            'users_address.barangay_code' => ['required', 'string'],
            'users_address.barangay_name' => ['required', 'string'],
            'role'             => ['required', 'string', 'exists:roles,name'],
        ]);

        // Find the role model from DB
        $role = Role::where('name', $validated['role'])->first();

        // Create user
        $user = User::create([
            'first_name'   => $validated['first_name'],
            'last_name'    => $validated['last_name'],
            'email'        => $validated['email'],
            'phone_number' => $validated['phone_number'] ?? null,
            'password'   => Hash::make($validated['password']),
            'role_id'    => $role ? $role->id : null, // Store role_id in users table
        ]);

        
        $addressData = $request->input('users_address');
        $user->address()->create($addressData);

        // Assign role using Spatie (updates model_has_roles table)
        if ($role) {
            $user->assignRole($role->name);
        }
        event(new Registered($user));

        Auth::login($user);

        // Redirect based on role
        if ($user->hasRole('customer')) {
            return redirect()->intended('/easy-apply');
        }

        return redirect()->intended(route('dashboard', absolute: false));
    }
}
