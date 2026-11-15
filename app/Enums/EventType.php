<?php

declare(strict_types=1);

/**
 * Purpose: Classifies the type of FC R&D gathering or community event.
 * Domain Context: Used by the Lungs (Event Team) to structure the 90-minute run sheet
 *                 and by the Nervous System (IT Team) to segment attendance & feedback analytics.
 * Key Dependencies: Event model.
 */

namespace App\Enums;

enum EventType: string
{
    case CellGathering = 'cell_gathering';
    case Fellowship = 'fellowship';
    case Outreach = 'outreach';
    case Retreat = 'retreat';
    case Special = 'special';

    /**
     * Human-readable event category label.
     */
    public function label(): string
    {
        return match ($this) {
            self::CellGathering => 'Weekly Cell Gathering',
            self::Fellowship => 'Community Fellowship',
            self::Outreach => 'Welcome & Outreach Night',
            self::Retreat => 'Cell Retreat / Camp',
            self::Special => 'Special Celebration',
        };
    }

    /**
     * Default target duration in minutes (90 minutes standard for FC R&D run sheets).
     */
    public function defaultDurationMinutes(): int
    {
        return match ($this) {
            self::CellGathering, self::Fellowship, self::Outreach => 90,
            self::Special => 120,
            self::Retreat => 240,
        };
    }
}
