<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'company_id',
        'desired_location',
        'preferred_date',
        'status',
        'is_cancelled',
        'cancelled_at',
    ];

    protected $casts = [
        'preferred_date' => 'date',
        'is_cancelled' => 'boolean',
        'cancelled_at' => 'datetime',
    ];

    // relationships
    public function user()
    {
        return $this->belongsTo(User::class,'user_id');
    }    

    public function company()
    {
        return $this->belongsTo(Company::class,'company_id');
    }
}
