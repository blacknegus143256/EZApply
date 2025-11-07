<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use App\Models\User;
use App\Models\Company;
use App\Models\CompanyOpportunity;
use App\Models\CompanyBackground;
use App\Models\CompanyRequirement;
use App\Models\CompanyMarketing;
use App\Models\CompanyDocument;

class PfaCompanySeeder extends Seeder
{
    public function run(): void
    {
        $path = database_path('seeders/data/pfa_members_combined.json');

        if (!File::exists($path)) {
            $this->command->error("❌ JSON file not found at: {$path}");
            return;
        }

        $rows = json_decode(File::get($path), true);
        $this->command->info("Found " . count($rows) . " companies in JSON.");

        foreach ($rows as $item) {
            try {
                $companyName = trim($item['name'] ?? 'Unknown Company');
                $price = $item['price'] ?? null;

                // Create or find a user for the company (unique email per company)
                $email = Str::slug($companyName) . '@pfa-demo.com';
                $user = User::firstOrCreate(
                    ['email' => $email],
                    [
                        'password' => bcrypt('password123'),
                        'credits' => 200,
                    ]
                );

                $user->assignRole('company');

                // DEFAULTS: ensure fields that might be NON-NULL in DB are present
                $defaults = [
                    'brand_name' => $companyName,
                    'city' => $item['city'] ?? $item['citymun_name'] ?? '',
                    'state_province' => $item['state_province'] ?? $item['province_name'] ?? '',
                    'zip_code' => $item['zip_code'] ?? $item['postal_code'] ?? '',
                    'region_code' => $item['region_code'] ?? '',
                    'region_name' => $item['region_name'] ?? '',
                    'province_code' => $item['province_code'] ?? '',
                    'province_name' => $item['province_name'] ?? '',
                    'citymun_code' => $item['citymun_code'] ?? '',
                    'citymun_name' => $item['citymun_name'] ?? '',
                    'barangay_code' => $item['barangay_code'] ?? '',
                    'barangay_name' => $item['barangay_name'] ?? '',
                    'postal_code' => $item['postal_code'] ?? '',
                    'country' => $item['country'] ?? 'Philippines',
                    'company_website' => $item['link'] ?? $item['company_website'] ?? null,
                    'description' => trim($item['description'] ?? ($item['COMPANY PROFILE'] ?? 'No description available.')),
                    'year_founded' => isset($item['year']) ? (int)$item['year'] : rand(1995, (int)date('Y')),
                    'num_franchise_locations' => isset($item['num_franchise_locations']) ? (int)$item['num_franchise_locations'] : rand(1, 20),
                    'status' => 'approved',
                ];

                // Ensure company_name is present (this is one of your actual DB columns)
                $companyAttrs = array_merge([
                    'user_id' => $user->id,
                    'company_name' => $companyName,
                ], $defaults);

                // Create or update the company
                $company = Company::updateOrCreate(
                    ['user_id' => $user->id, 'company_name' => $companyName],
                    $companyAttrs
                );

                // Opportunity
                CompanyOpportunity::updateOrCreate(
                    ['company_id' => $company->id],
                    [
                        'franchise_type' => $item['franchise_type'] ?? $this->guessIndustry($companyName),
                        'min_investment' => self::parseMoney($item['CAPITAL INVESTMENT'] ?? $price),
                        'franchise_fee' => self::parseMoney($item['FRANCHISE FEE'] ?? null),
                        'royalty_fee_structure' => $item['ROYALTY FEE'] ?? '5% of monthly gross sales',
                        'avg_annual_revenue' => $item['avg_annual_revenue'] ?? rand(500000, 5000000),
                        'target_markets' => $item['target_markets'] ?? 'Philippines',
                        'training_support' => $item['training_support'] ?? 'Included',
                        'franchise_term' => $item['franchise_term'] ?? '5 years renewable',
                        'unique_selling_points' => $item['unique_selling_points'] ?? 'Imported from PFA',
                    ]
                );

                // Background
                CompanyBackground::updateOrCreate(
                    ['company_id' => $company->id],
                    [
                        'industry_sector' => $item['industry_sector'] ?? $this->guessIndustry($companyName),
                        'years_in_operation' => $item['years_in_operation'] ?? rand(1, 25),
                        'total_revenue' => $item['total_revenue'] ?? rand(1000000, 20000000),
                        'awards' => $item['awards'] ?? null,
                        'company_history' => $item['company_history'] ?? $defaults['description'],
                    ]
                );

                // Requirements
                CompanyRequirement::updateOrCreate(
                    ['company_id' => $company->id],
                    [
                        'min_net_worth' => $item['min_net_worth'] ?? rand(500000, 5000000),
                        'min_liquid_assets' => $item['min_liquid_assets'] ?? rand(250000, 2000000),
                        'prior_experience' => $item['prior_experience'] ?? false,
                        'experience_type' => $item['experience_type'] ?? 'Business Management',
                        'other_qualifications' => $item['other_qualifications'] ?? null,
                    ]
                );

                // Marketing
                CompanyMarketing::updateOrCreate(
                    ['company_id' => $company->id],
                    [
                        'listing_title' => $item['listing_title'] ?? $companyName,
                        'listing_description' => $item['listing_description'] ?? $defaults['description'],
                        'logo_path' => $item['img'] ?? null,
                        'target_profile' => $item['target_profile'] ?? 'Potential Franchisees',
                        'preferred_contact_method' => $item['preferred_contact_method'] ?? 'email',
                    ]
                );

                // Documents (placeholder entries)
                CompanyDocument::updateOrCreate(
                    ['company_id' => $company->id],
                    [
                        'dti_sbc_path' => $item['dti_sbc_path'] ?? 'documents/sample_dti.pdf',
                        'bir_2303_path' => $item['bir_2303_path'] ?? 'documents/sample_bir.pdf',
                        'ipo_registration_path' => $item['ipo_registration_path'] ?? 'documents/sample_ipo.pdf',
                    ]
                );

                $this->command->info("✅ Seeded: {$companyName}");
            } catch (\Exception $e) {
                $this->command->warn("⚠️ Failed to seed company: " . ($item['name'] ?? 'unknown'));
                $this->command->warn($e->getMessage());
            }
        }

        $this->command->info("🎉 Finished seeding PFA companies!");
    }

    private static function parseMoney($value)
    {
        if (!$value) return rand(500000, 3000000);
        $clean = preg_replace('/[^0-9.]/', '', $value);
        return is_numeric($clean) ? (float)$clean : rand(500000, 3000000);
    }

    private function guessIndustry($name)
    {
        $n = strtolower($name);
        if (str_contains($n, 'coffee') || str_contains($n, 'cafe') || str_contains($n, 'bakery')) return 'Food & Beverage';
        if (str_contains($n, 'spa') || str_contains($n, 'salon') || str_contains($n, 'nail')) return 'Health & Beauty';
        if (str_contains($n, 'school') || str_contains($n, 'academy')) return 'Education';
        if (str_contains($n, 'store') || str_contains($n, 'shop')) return 'Retail';
        return 'General';
    }
}
