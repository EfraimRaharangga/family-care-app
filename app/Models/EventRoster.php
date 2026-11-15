<?php

declare(strict_types=1);

/**
 * Purpose: Represents a single segment/role in an Event's 90-Minute Run Sheet.
 * Domain Context: Stewarded by the Lungs (Event Team) to keep cell gatherings on time
 *                 and coordinate servant assignments across the 90-minute flow.
 * Key Dependencies: `BelongsToCell`, `Event`, `User`.
 */

namespace App\Models;

use App\Models\Concerns\BelongsToCell;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventRoster extends Model
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
        'role_name',
        'segment_title',
        'duration_minutes',
        'sort_order',
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
            'duration_minutes' => 'integer',
            'sort_order' => 'integer',
        ];
    }

    /**
     * Parent event for this run-sheet segment.
     *
     * @return BelongsTo<Event, $this>
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * Assigned cell servant (`Part` or `Vital` member).
     *
     * @return BelongsTo<User, $this>
     */
    public function servant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
