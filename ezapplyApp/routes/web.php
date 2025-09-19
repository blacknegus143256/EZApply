<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Controllers\CompanyController;

use App\Http\Controllers\PsgcController;
use App\Http\Controllers\Auth\RegisteredUserController;
use Illuminate\Http\Request;

use App\Http\Controllers\PermissionController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;

use App\Http\Controllers\ApplicationController;;
use App\Http\Controllers\CompanyRequestController;

// use App\Http\Controllers\MessageController; // temporarily disabled
use App\Http\Controllers\AffiliationController;
use App\Http\Controllers\BasicInfoController;
use App\Http\Controllers\FinancialController;
use App\Http\Controllers\CustomerAttachmentController;
use App\Http\Controllers\MessageController;




Route::post('/register', [RegisteredUserController::class, 'store']);

 //Landing Page Routes
 Route::get('/', function () {
    return Inertia::render('Landing/easyApply');
})->name('home');
 Route::get('/list-companies', function (){
    return Inertia::render('Landing/all-companies');
})->name('easy-apply-companies');

    Route::get('/companies', [CompanyController::class, 'index'])->name('companies.index');
    Route::get('/companies/{id}', [CompanyController::class, 'show'])->name('companies.show');




Route::middleware(['auth', 'verified'])->group(function () {
    Route::put('/companies/{company}/status', [CompanyController::class, 'updateStatus'])
    ->name('companies.update-status');
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    Route::get('applicant/basicinfo', [BasicInfoController::class, 'index'])->name('applicant.basicinfo');
    Route::post('applicant/basicinfo', [BasicInfoController::class, 'store'])->name('applicant.basicinfo.store');
    
    Route::get('applicant/affiliations', [AffiliationController::class, 'index'])->name('applicant.affiliations');
    Route::post('applicant/affiliations', [AffiliationController::class, 'store'])->name('applicant.affiliations.store');
    
    Route::get('applicant/financial', [FinancialController::class, 'index'])->name('applicant.financial');
    Route::post('applicant/financial', [FinancialController::class, 'store'])->name('applicant.financial.store');
    
    Route::get('applicant/attachments', [CustomerAttachmentController::class, 'index'])->name('applicant.attachments');
    Route::post('applicant/attachments', [CustomerAttachmentController::class, 'store'])->name('applicant.attachments.store');
    Route::delete('applicant/attachments/{attachment}', [CustomerAttachmentController::class, 'destroy'])->name('applicant.attachments.destroy');
    
    Route::get('applicant/franchise', function () {
        return Inertia::render('Applicant/FranchiseForm');
    })->name('applicant.franchise');
Route::get('/applicant/franchise/appliedcompanies', [ApplicationController::class, 'index'])
    ->name('applicant.applied_companies');


   
    Route::get('company/register', function () {
        return Inertia::render('Company/FranchiseRegister');
    })->name('company.register');

    Route::post('/companies', [CompanyController::class, 'store'])->name('companies.store');

    Route::post('/applicant/applications', [ApplicationController::class, 'store'])
        ->name('applicant.applications.store');
    Route::get('//my-registered-companies', [CompanyController::class, 'myCompanies'])->name('companies.my');

    // Route::get('/applicant/messages/{company}', [MessageController::class, 'create'])
    //     ->name('applicant.messages.create');
    // Route::post('/applicant/messages', [MessageController::class, 'store'])
    //     ->name('applicant.messages.store');


});
Route::prefix('psgc')->group(function () {
    Route::get('/regions', [PsgcController::class, 'regions'])->name('psgc.regions');
    Route::get('/regions/{region}/provinces', [PsgcController::class, 'provinces'])->name('psgc.provinces');
    Route::get('/provinces/{province}/cities-municipalities', [PsgcController::class, 'cities'])->name('psgc.cities');
    Route::get('/cities-municipalities/{city}/barangays', [PsgcController::class, 'barangays'])->name('psgc.barangays');



});

// Admin routes
Route::middleware(['auth', 'verified'])->group(function () {
    //Chatbox
    Route::get('/chat/{user}', [MessageController::class, 'index'])->name('chat.index');
    Route::post('/chat/{user}', [MessageController::class, 'store'])->name('messages.store');
    Route::get('/view-chats', [MessageController::class, 'viewChats'])->name('chat.view');



    //Company
    Route::get('/company-applicants', [CompanyController::class, 'companyApplicants'])->name('company.applicants');
    Route::put('/company/applicants/{id}/status', [CompanyController::class, 'updateApplicantStatus']);



    //Permissions
    Route::get('/permissions', [PermissionController::class, 'index'])->name('permissions.index');
    Route::post('/permissions', [PermissionController::class, 'store'])->name('permissions.store');
    Route::put('/permissions/{permission}', [PermissionController::class, 'update'])->name('permissions.update');
    Route::delete('/permissions/{permission}', [PermissionController::class, 'destroy'])->name('permissions.destroy');

    //Roles
    Route::get('/roles', [RoleController::class, 'index'])->name('roles.index');
    Route::get('/roles/create', [RoleController::class, 'create'])->name('roles.create');
    Route::post('/roles', [RoleController::class, 'store'])->name('roles.store');
    Route::get('/roles/{role}/edit', [RoleController::class, 'edit'])->name('roles.edit');
    Route::put('/roles/{role}', [RoleController::class, 'update'])->name('roles.update');
    Route::delete('/roles/{role}', [RoleController::class, 'destroy'])->name('roles.destroy');

    //Users
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::get('/users/create', [UserController::class, 'create'])->name('users.create');
    Route::post('/users', [UserController::class, 'store'])->name('users.store');
    Route::get('/users/{user}/edit', [UserController::class, 'edit'])->name('users.edit');
    Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
    

    
    //Company Requests
    Route::get('/company-requests', [CompanyRequestController::class, 'index'])->name('company.requests');
    Route::post('/company-requests/{id}/approve', [CompanyRequestController::class, 'approveCompany'])->name('company.approve');
    Route::post('/company-requests/{id}/reject', [CompanyRequestController::class, 'rejectCompany'])->name('company.reject');
    
    

});

Route::get('/easy-apply', function () {
    return Inertia::render('Landing/easyApply', [
        'user' => Auth::user(),
    ]);
});


require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
