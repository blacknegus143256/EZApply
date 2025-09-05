<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsersTableSeeder extends Seeder
{
    public function run(): void
    {
        // for admin
        $admin = User::create([
            'first_name' => 'System',
            'last_name'  => 'Admin',
            'email'      => 'admin@example.com',
            'phone_number' => '09112223333',
            'address'    => 'HQ',
            'password'   => Hash::make('password123'),
        ]);
        $admin->assignRole('super_admin');

        // for customer
        $customer = User::create([
            'first_name' => 'Sample',
            'last_name'  => 'Customer',
            'email'      => 'customer@sample.com',
            'phone_number' => '09123456789',
            'address'    => 'Sample Location',
            'password'   => Hash::make('password123'),
        ]);
        $customer->assignRole('customer');

        // for company
        $company = User::create([
            'first_name' => 'Sample',
            'last_name'  => 'Company',
            'email'      => 'Company@sample.com',
            'phone_number' => '09123456789',
            'address'    => 'Sample Location',
            'password'   => Hash::make('password123'),
        ]);
        $company->assignRole('company');
    }
}
