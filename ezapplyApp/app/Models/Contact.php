<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Contact extends Model
{
    protected $fillable = [
        'email',
        'first_name',
        'last_name',
        'message',
        'status',
    ];
}
