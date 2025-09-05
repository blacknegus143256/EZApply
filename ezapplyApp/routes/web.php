<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Controllers\CompanyController;


use App\Http\Controllers\FranchiseInformationController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;

Route::middleware(['auth'])->group(function () {
    Route::post('/franchise-information', [FranchiseInformationController::class, 'store'])->name('franchise.store');
});

Route::get('/', function () {
    return Inertia::render('Landing/easyApply');
})->name('home');

Route::get('/applicant/franchise', function () {
    return Inertia::render('Applicant/FranchiseForm');
})->name('applicant.franchise');

Route::middleware(['auth','verified'])->group(function () {
    Route::post('/companies', [CompanyController::class, 'store'])->name('companies.store');
});



Route::get('/companies', [CompanyController::class, 'index'])->name('companies.index');
Route::get('/companies/{id}', [CompanyController::class, 'show'])->name('companies.show');
Route::post('/companies', [CompanyController::class, 'store'])->name('companies.store');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('applicant/franchise', function () {
        return Inertia::render('Applicant/FranchiseForm');
    })->name('applicant.franchise');
    Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('company/register', function () {
        return Inertia::render('Company/FranchiseRegister');
    })->name('company.register');
    });


    //Permissions
    Route::get('/permission', [PermissionController::class, 'index'])->name('permission.index');
    Route::post('/permission', [PermissionController::class, 'store'])->name('permission.store');
    Route::put('/permission/{permission}', [PermissionController::class, 'update'])->name('permission.update');
    Route::delete('/permission/{permission}', [PermissionController::class, 'destroy'])->name('permission.destroy');


    //Roles
    Route::get('/roles', [RoleController::class, 'index'])->name('role.index');
    Route::get('/roles/create', [RoleController::class, 'create'])->name('role.create');
    Route::post('/roles', [RoleController::class, 'store'])->name('role.store');
    Route::get('/roles/{role}/edit', [RoleController::class, 'edit'])->name('role.edit');
    Route::put('/roles/{role}', [RoleController::class, 'update'])->name('role.update');
    Route::delete('/roles/{role}', [RoleController::class, 'destroy'])->name('role.destroy');


    //Users
    Route::get('/users', [UserController::class, 'index'])->name('user.index');
    Route::get('/users/create', [UserController::class, 'create'])->name('user.create');
    Route::post('/users', [UserController::class, 'store'])->name('user.store');
    Route::get('/users/{user}/edit', [UserController::class, 'edit'])->name('user.edit');
    Route::put('/users/{user}', [UserController::class, 'update'])->name('user.update');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('user.destroy');
    


});

Route::get('/easy-apply', function () {
    return Inertia::render('Landing/easyApply', [
        'user' => Auth::user(),
    ]);
});


require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
