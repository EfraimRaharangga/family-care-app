<?php

declare(strict_types=1);

/**
 * Purpose: Classifies the type of FC gathering or community event.
 * Domain Context: Used by the Lungs (Event Team), Brain (Leader), and Nervous System (IT Team)
 *                 to categorize sessions (`Meet FC 5`, `Cerita Nabi-Nabi`, `Tend Maker`, `Regular`)
 *                 and segment anonymous feedback & attendance analytics.
 * Key Dependencies: `App\Models\Event`.
 */

namespace App\Enums;

enum EventType: string
{
    case MeetFc5 = 'meet_fc_5';
    case CeritaNabiNabi = 'cerita_nabi_nabi';
    case TendMaker = 'tend_maker';
    case Regular = 'regular';

    /**
     * Human-readable FC event type label.
     */
    public function label(): string
    {
        return match ($this) {
            self::MeetFc5 => 'Meet FC 5',
            self::CeritaNabiNabi => 'Cerita Nabi-Nabi',
            self::TendMaker => 'Tend Maker',
            self::Regular => 'Regular',
        };
    }

    /**
     * Default target duration in minutes (90 minutes standard for FC run sheets).
     */
    public function defaultDurationMinutes(): int
    {
        return match ($this) {
            self::Regular, self::CeritaNabiNabi, self::TendMaker => 90,
            self::MeetFc5 => 120,
        };
    }

    /**
     * Serializes all enum cases into structured options for Inertia/React select & filter controls.
     *
     * @return list<array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(
            static fn (self $case): array => [
                'value' => $case->value,
                'label' => $case->label(),
            ],
            self::cases()
        );
    }
}
