<?php

declare(strict_types=1);

/**
 * Purpose: Tracks a member's attendance status (`present`, `excused`, `absent`) for an Event.
 * Domain Context: Stewarded by Hands & Feet (Hospitality Team) and consumed by
 *                 `ShepherdRadarService` to identify members needing pastoral care.
 * Key Dependencies: `BelongsToCell`, `Event`, `User`.
 */

namespace App\Models;

use App\Models\Concerns\BelongsToCell;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventAttendance extends Model
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
        'event_id',
        'user_id',
        'status',
        'checked_in_at',
        'notes',
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
            'user_id' => 'integer',
            'checked_in_at' => 'datetime',
        ];
    }

    /**
     * Event for this attendance check-in.
     *
     * @return BelongsTo<Event, $this>
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * Member whose attendance is recorded.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
