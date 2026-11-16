<?php

declare(strict_types=1);

/**
 * Purpose: Tracks the lifecycle state of an FC event.
 * Domain Context: Controls whether anonymous feedback PIN submission and attendance check-in are open.
 * Key Dependencies: Event model, GenerateEventPinAction.
 */

namespace App\Enums;

enum EventStatus: string
{
    case Draft = 'draft';
    case Upcoming = 'upcoming';
    case Ongoing = 'ongoing';
    case Completed = 'completed';
    case Cancelled = 'cancelled';

    /**
     * Human-readable status badge label.
     */
    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draft',
            self::Upcoming => 'Upcoming',
            self::Ongoing => 'Live / Ongoing',
            self::Completed => 'Completed',
            self::Cancelled => 'Cancelled',
        };
    }

    /**
     * Determines whether anonymous feedback submissions via PIN are currently accepted.
     */
    public function acceptsFeedback(): bool
    {
        // Allow feedback during live events and after completion so members can submit post-gathering reflections
        return in_array($this, [self::Ongoing, self::Completed], true);
    }
}
