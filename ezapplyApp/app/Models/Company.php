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
        'city',
        'state_province',
        'zip_code',
        'country',
        'company_website',
        'description',
        'year_founded',
        'num_franchise_locations',
        'user_id', 
    ];

    // Relationships (1–1)
    public function opportunity() { return $this->hasOne(CompanyOpportunity::class); }
    public function background()  { return $this->hasOne(CompanyBackground::class); }
    public function requirements(){ return $this->hasOne(CompanyRequirement::class); }
    public function marketing()   { return $this->hasOne(CompanyMarketing::class); }
    public function user()        { return $this->belongsTo(User::class); }

    public function applications()
{
    return $this->hasMany(Application::class);
}

public function applicants()
{
    return $this->belongsToMany(User::class, 'applications');
}
}
