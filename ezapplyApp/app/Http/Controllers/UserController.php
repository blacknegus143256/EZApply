<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $users = User::with('roles') // eager load roles using Spatie
            ->latest()
            ->paginate(5)
            ->withQueryString()
            ->through(fn($user) => [
                'id'          => $user->id,
                'first_name'  => $user->first_name,
                'last_name'   => $user->last_name,
                'email'       => $user->email,
                'phone_number'=> $user->phone_number,
                'address'     => $user->address,
                'roles'       => $user->roles->pluck('name')->join(', ') ?: '—', // show role names
                'created_at'  => $user->created_at->format('d-m-Y'),
            ]);

        return Inertia::render('Users/index', [
            'users' => $users
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Users/create', [
            'roles' => Role::all()->pluck('name')
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'first_name'            => 'required|string|max:255',
            'last_name'             => 'required|string|max:255',
            'email'                 => 'required|email|unique:users,email',
            'phone_number'          => 'required|string|max:255',
            'address'               => 'required|string|max:255',
            'roles'                 => 'array',
            'roles.*'               => 'string|exists:roles,name',
            'password'              => 'required|string|max:255',
            'password_confirmation' => 'required|string|max:255|same:password',
        ]);

        // Create user
        $user = User::create([
            'first_name'   => $request->first_name,
            'last_name'    => $request->last_name,
            'email'        => $request->email,
            'phone_number' => $request->phone_number,
            'address'      => $request->address,
            'password'     => bcrypt($request->password),
        ]);

        if ($request->has('roles') && count($request->roles) > 0) {
            // Assign multiple roles via Spatie
            $user->syncRoles($request->roles);
        }

        return to_route('users.index')->with('message', 'User Created Successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user)
    {
        //
        return Inertia::render('Users/edit', [
            'user' => $user->load('roles'),
            'roles' => Role::all()->pluck('name')
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        //
        $request->validate([
            'first_name'            => 'required|string|max:255',
            'last_name'             => 'required|string|max:255',
            'email'                 => 'required|email|unique:users,email,' .$user->id,
            'phone_number'          => 'required|string|max:255',
            'address'               => 'required|string|max:255',
            'roles'                 => 'array',
            'roles.*'               => 'string|exists:roles,name',

        ]);


        $user->first_name = $request->first_name;
        $user->last_name = $request->last_name;
        $user->email = $request->email;
        $user->phone_number = $request->phone_number;
        $user->address = $request->address;
        $user->save();

        if ($request->has('roles')){
            $user->syncRoles($request->roles);
            
        }

        return to_route('users.index')->with('message', 'User Updated Successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        //
        $user->delete();
        return to_route('users.index')->with('message', 'User Deleted Successfully');
    }
}
