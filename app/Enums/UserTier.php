<?php

declare(strict_types=1);

/**
 * Purpose: Defines the "Journey of Belonging" membership tiers for FC R&D members.
 * Domain Context: Every cell member is categorized as either "Part" (general member)
 *                 or "Vital" (core servant assigned to one of the 5 Vital Organs).
 * Key Dependencies: Synced directly with Spatie Permission base roles.
 */

namespace App\Enums;

enum UserTier: string
{
    case Part = 'part';
    case Vital = 'vital';

    /**
     * Human-readable display label for UI badges and tables.
     */
    public function label(): string
    {
        return match ($this) {
            self::Part => 'Part (Member)',
            self::Vital => 'Vital (Core Servant)',
        };
    }

    /**
     * Short badge title for compact editorial pills.
     */
    public function shortLabel(): string
    {
        return match ($this) {
            self::Part => 'PART',
            self::Vital => 'VITAL',
        };
    }

    /**
     * Explains the spiritual and community expectation of the tier.
     */
    public function description(): string
    {
        return match ($this) {
            self::Part => 'Cell member actively participating in fellowship and spiritual growth within the Journey of Belonging.',
            self::Vital => 'Core servant actively stewarding one of the 5 Vital Organs to sustain and grow the cell community.',
        };
    }

    /**
     * Returns the corresponding Spatie role name for RBAC enforcement.
     */
    public function spatieRoleName(): string
    {
        return $this->value;
    }

    /**
     * Calm Editorial Neutral surface hex code (`#F1F5F9` Slate for Part, `#EEF2FF` Soft Indigo for Vital).
     */
    public function surfaceHex(): string
    {
        return match ($this) {
            self::Part => '#F1F5F9',
            self::Vital => '#EEF2FF',
        };
    }
}
