<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
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
            'address'          => ['required', 'string', 'max:255'],
            'password'         => ['required', 'confirmed', Rules\Password::defaults()],
            'role'             => ['required', 'in:customer,company'],

        ]);


        $user = User::create([
            'first_name' => $validated['first_name'],
            'last_name'  => $validated['last_name'],
            'email'      => $validated['email'],
            'phone_number' => $validated['phone_number'] ?? null,
            'address' => $validated['address'] ?? null,
            'password'   => Hash::make($validated['password']),
            'role'       => $validated['role'],
        ]);

        event(new Registered($user));

        Auth::login($user);
        if ($user->role === 'customer') {
        return redirect()->intended('/easy-apply');
    }
        return redirect()->intended(route('dashboard', absolute: false));
    }
    }
