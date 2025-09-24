<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ApplicantView extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'application_id',
        'paid',
    ];

    /**
     * The company user who viewed the profile
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The application that was viewed
     */
    public function application()
    {
        return $this->belongsTo(Application::class);
    }
}
