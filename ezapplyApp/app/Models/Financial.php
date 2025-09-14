<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Financial extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'annual_income',
        'salary',
    ];

    /**
     * Get the user that owns the financial info.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
