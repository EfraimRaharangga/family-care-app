<?php

declare(strict_types=1);

/**
 * Purpose: Represents the 5 biological organ metaphors branching off the "Vital" tier.
 * Domain Context: FC R&D distributes cell leadership and operations across 5 specialized
 *                 organ teams rather than concentrating burden on a single person.
 * Key Dependencies: Used by User model casts, Spatie RBAC seeding, and OrganIcon UI components.
 */

namespace App\Enums;

enum VitalOrgan: string
{
    case Brain = 'brain';
    case Lungs = 'lungs';
    case HandsAndFeet = 'hands_and_feet';
    case VascularSystem = 'vascular_system';
    case NervousSystem = 'nervous_system';

    /**
     * Full display name combining organ metaphor and functional role.
     */
    public function label(): string
    {
        return match ($this) {
            self::Brain => 'Brain (Leader)',
            self::Lungs => 'Lungs (Event Team)',
            self::HandsAndFeet => 'Hands & Feet (Hospitality Team)',
            self::VascularSystem => 'Vascular System (Treasurer)',
            self::NervousSystem => 'Nervous System (IT Team)',
        };
    }

    /**
     * Functional ministry team title.
     */
    public function teamName(): string
    {
        return match ($this) {
            self::Brain => 'Leader',
            self::Lungs => 'Event Team',
            self::HandsAndFeet => 'Hospitality Team',
            self::VascularSystem => 'Treasurer',
            self::NervousSystem => 'IT Team',
        };
    }

    /**
     * Canonical organ emoji icon.
     */
    public function emoji(): string
    {
        return match ($this) {
            self::Brain => '🧠',
            self::Lungs => '🫁',
            self::HandsAndFeet => '🤲',
            self::VascularSystem => '🫀',
            self::NervousSystem => '⚡',
        };
    }

    /**
     * Core operational mandate for the organ within FC R&D.
     */
    public function description(): string
    {
        return match ($this) {
            self::Brain => 'Vision, teaching, & pastoral care.',
            self::Lungs => 'Managing the rhythm and flow of the event to keep everything on schedule (90-minute run sheet).',
            self::HandsAndFeet => 'Welcoming newcomers and reaching out to those who are absent.',
            self::VascularSystem => 'Managing funds and allocating gifts/diaconate support.',
            self::NervousSystem => 'Processing data, analytics, & anonymous feedback channels.',
        };
    }

    /**
     * Spatie Role identifier corresponding to this Vital Organ.
     */
    public function spatieRoleName(): string
    {
        return 'vital:' . $this->value;
    }

    /**
     * Granular Spatie permissions granted to members of this Vital Organ.
     *
     * @return list<string>
     */
    public function permissions(): array
    {
        return match ($this) {
            self::Brain => [
                'members.view',
                'members.manage',
                'events.view',
                'events.manage',
                'pastoral.view',
                'pastoral.manage',
                'finance.view',
                'feedback.view_analytics',
            ],
            self::Lungs => [
                'events.view',
                'events.manage',
                'rosters.manage',
            ],
            self::HandsAndFeet => [
                'members.view',
                'attendance.manage',
                'pastoral.view',
                'pastoral.manage',
            ],
            self::VascularSystem => [
                'finance.view',
                'finance.manage',
                'transactions.record',
            ],
            self::NervousSystem => [
                'members.view',
                'members.manage',
                'events.view',
                'feedback.manage_pins',
                'feedback.view_analytics',
                'system.health',
            ],
        };
    }

    /**
     * Uniform Calm Editorial Neutral surface hex (`#F8FAFC`) to prevent rainbow card clutter.
     */
    public function surfaceHex(): string
    {
        return '#F8FAFC';
    }

    /**
     * Restrained Slate & Muted Indigo accent hex code for organ metadata.
     */
    public function accentHex(): string
    {
        return match ($this) {
            self::Brain => '#4F46E5',
            default => '#1E293B',
        };
    }
}
