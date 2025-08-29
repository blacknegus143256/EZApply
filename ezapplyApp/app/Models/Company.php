<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_name',
        'brand_name',
        'hq_address',
        'city',
        'state_province',
        'zip_code',
        'country',
        'company_website',
        'description',
        'year_founded',
        'num_franchise_locations',
    ];

    // Relationships (1–1)
    public function opportunity() { return $this->hasOne(CompanyOpportunity::class); }
    public function background()  { return $this->hasOne(CompanyBackground::class); }
    public function requirements(){ return $this->hasOne(CompanyRequirement::class); }
    public function marketing()   { return $this->hasOne(CompanyMarketing::class); }
}
