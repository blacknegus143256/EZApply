<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Auth;
use App\Mail\ContactNotification;
use Inertia\Inertia;

class ContactController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        


        $inquiries = Contact::orderBy('created_at', 'desc')->get();
        return Inertia::render('Admin/Inquiries', [
            'inquiries' => $inquiries,
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $user = $request->user();
        

        $contact = Contact::findOrFail($id);
        $validated = $request->validate([
            'status' => 'required|in:unread,read',
        ]);
        $contact->update($validated);
        return response()->json(['message' => 'Inquiry status updated.', 'success' => true]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|max:255',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'message' => 'required|string|min:10',
        ]);

        $contact = Contact::create($validated);

        $adminEmail = config('app.admin_email') ?? 'admin@example.com';
        Mail::to($adminEmail)->send(new ContactNotification($contact));


        return response()->json([
            'message' => 'Your inquiry has been sent successfully. We will get back to you soon!',
            'success' => true,
        ]);
    }
}
