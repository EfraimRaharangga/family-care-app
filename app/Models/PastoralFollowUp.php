<?php

declare(strict_types=1);

/**
 * Purpose: Represents a Pastoral Care Follow-Up ticket for an absent or hurting member.
 * Domain Context: Stewarded jointly by Hands & Feet (Hospitality Team) and Brain (Leader).
 * Key Dependencies: `BelongsToCell`, `User`, `Event`.
 */

namespace App\Models;

use App\Models\Concerns\BelongsToCell;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PastoralFollowUp extends Model
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
        'member_id',
        'assigned_to',
        'triggered_by_event_id',
        'reason',
        'status',
        'notes',
        'resolved_at',
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
            'member_id' => 'integer',
            'assigned_to' => 'integer',
            'triggered_by_event_id' => 'integer',
            'resolved_at' => 'datetime',
        ];
    }

    /**
     * The cell member receiving pastoral care.
     *
     * @return BelongsTo<User, $this>
     */
    public function member(): BelongsTo
    {
        return $this->belongsTo(User::class, 'member_id');
    }

    /**
     * The Hands & Feet or Brain servant assigned to reach out.
     *
     * @return BelongsTo<User, $this>
     */
    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Optional event whose absence triggered this follow-up.
     *
     * @return BelongsTo<Event, $this>
     */
    public function triggeredByEvent(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'triggered_by_event_id');
    }
}
