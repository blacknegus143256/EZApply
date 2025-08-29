<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;


use App\Http\Controllers\FranchiseInformationController;


Route::middleware(['auth'])->group(function () {
    Route::post('/franchise-information', [FranchiseInformationController::class, 'store'])->name('franchise.store');
});

Route::get('/', function () {
    return Inertia::render('easyApply');
})->name('home');

Route::get('/applicant/franchise', function () {
    return Inertia::render('Applicant/FranchiseForm');
})->name('applicant.franchise');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    
    Route::get('applicant/franchise', function () {
        return Inertia::render('Applicant/FranchiseForm');
    })->name('applicant.franchise');
});

Route::get('/easy-apply', function () {
    return Inertia::render('Landing/easyApply', [
        'user' => Auth::user(),
    ]);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
