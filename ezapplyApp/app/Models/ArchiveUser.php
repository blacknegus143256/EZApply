<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ArchiveUser extends Model
{
    use HasFactory;

    protected $fillable = [
        'original_user_id',
        'email',
        'user_data',
        'basic_info_data',
        'address_data',
        'financial_data',
        'affiliations_data',
        'attachments_data',
        'applications_data',
        'company_data',
        'archived_at',
        'archived_by',
        'restored_at',
        'restored_by',
    ];

    protected $casts = [
        'user_data' => 'array',
        'basic_info_data' => 'array',
        'address_data' => 'array',
        'financial_data' => 'array',
        'affiliations_data' => 'array',
        'attachments_data' => 'array',
        'applications_data' => 'array',
        'company_data' => 'array',
        'archived_at' => 'datetime',
        'restored_at' => 'datetime',
    ];

    /**
     * Get the admin who archived the user
     */
    public function archivedBy()
    {
        return $this->belongsTo(User::class, 'archived_by');
    }

    /**
     * Get the admin who restored the user
     */
    public function restoredBy()
    {
        return $this->belongsTo(User::class, 'restored_by');
    }
}
