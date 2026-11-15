<?php

declare(strict_types=1);

/**
 * Purpose: Represents a 100% Anonymous Event Feedback submission.
 * Domain Context: Stewarded by the Nervous System (IT Team).
 *                 CRITICAL ARCHITECTURAL GUARDRAIL: Never stores or accepts `user_id`,
 *                 `ip_address`, or browser fingerprint metadata so cell members can share
 *                 unfiltered feedback with complete psychological and technical safety.
 *                 Optional pastoral contact info is stored ONLY inside `feedbacks` when
 *                 `needs_pastoral_care` is explicitly checked by the member.
 * Key Dependencies: `BelongsToCell`, `Event`, `FeedbackCategory`.
 */

namespace App\Models;

use App\Enums\FeedbackCategory;
use App\Models\Concerns\BelongsToCell;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Feedback extends Model
{
    use BelongsToCell;
    use HasFactory;

    /**
     * Explicitly bind to the `feedbacks` table name.
     */
    protected $table = 'feedbacks';

    /**
     * The attributes that are mass assignable.
     * Intentionally excludes any user identifier or network metadata.
     *
     * @var list<string>
     */
    protected $fillable = [
        'cell_id',
        'event_id',
        'rating',
        'category',
        'message',
        'needs_pastoral_care',
        'contact_name',
        'contact_info',
        'is_reviewed',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'cell_id' => 'integer',
            'event_id' => 'integer',
            'rating' => 'integer',
            'category' => FeedbackCategory::class,
            'needs_pastoral_care' => 'boolean',
            'is_reviewed' => 'boolean',
        ];
    }

    /**
     * The event this anonymous feedback belongs to.
     *
     * @return BelongsTo<Event, $this>
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}
