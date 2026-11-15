<?php

declare(strict_types=1);

/**
 * Purpose: Represents an FC R&D Cell Event or Gathering.
 * Domain Context: Stewarded by Lungs (Event Team), Brain (Leader), and Nervous System (IT Team).
 *                 Connects the 90-minute run sheet (`EventRoster`), daily 4-digit PIN anonymous
 *                 feedback (`Feedback`), and member attendance (`EventAttendance`).
 * Key Dependencies: `BelongsToCell`, `EventType`, `EventStatus`.
 */

namespace App\Models;

use App\Enums\EventStatus;
use App\Enums\EventType;
use App\Models\Concerns\BelongsToCell;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Event extends Model
{
    use BelongsToCell;
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'cell_id',
        'title',
        'type',
        'status',
        'scheduled_at',
        'duration_minutes',
        'location',
        'feedback_pin',
        'pin_expires_at',
        'notes',
        'created_by',
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
            'type' => EventType::class,
            'status' => EventStatus::class,
            'scheduled_at' => 'datetime',
            'duration_minutes' => 'integer',
            'pin_expires_at' => 'datetime',
            'created_by' => 'integer',
        ];
    }

    /**
     * Determine whether this event's 4-digit feedback PIN is currently active and unexpired.
     */
    public function isPinActive(): bool
    {
        return ! empty($this->feedback_pin)
            && $this->pin_expires_at !== null
            && $this->pin_expires_at->isFuture();
    }

    // =========================================================================
    // DOMAIN RELATIONSHIPS
    // =========================================================================

    /**
     * The Vital member who created this event.
     *
     * @return BelongsTo<User, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * 100% anonymous feedback entries submitted for this event.
     *
     * @return HasMany<Feedback, $this>
     */
    public function feedbacks(): HasMany
    {
        return $this->hasMany(Feedback::class);
    }

    /**
     * Ordered 90-minute run sheet segments and servant assignments.
     *
     * @return HasMany<EventRoster, $this>
     */
    public function rosters(): HasMany
    {
        return $this->hasMany(EventRoster::class)->orderBy('sort_order');
    }

    /**
     * Member attendance records for this event.
     *
     * @return HasMany<EventAttendance, $this>
     */
    public function attendances(): HasMany
    {
        return $this->hasMany(EventAttendance::class);
    }

    /**
     * Financial transactions associated with this event (e.g., offerings or consumption).
     *
     * @return HasMany<Transaction, $this>
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }
}
