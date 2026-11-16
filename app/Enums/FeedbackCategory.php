<?php

declare(strict_types=1);

/**
 * Purpose: Categorizes 100% Anonymous Member Feedback in FC.
 * Domain Context: Used by the Nervous System (IT Team) and Brain (Leader) to route
 *                 anonymous feedback into actionable evaluation buckets (`Materi`,
 *                 `Hospitality / Suasana`, `Acara & Games`, `Lainnya`).
 * Key Dependencies: `App\Models\Feedback`.
 */

namespace App\Enums;

enum FeedbackCategory: string
{
    case Materi = 'materi';
    case Hospitality = 'hospitality';
    case AcaraGames = 'acara_games';
    case Lainnya = 'lainnya';

    /**
     * Human-readable Indonesian category label.
     */
    public function label(): string
    {
        return match ($this) {
            self::Materi => 'Materi',
            self::Hospitality => 'Hospitality / Suasana',
            self::AcaraGames => 'Acara & Games',
            self::Lainnya => 'Lainnya',
        };
    }

    /**
     * Brief helper subtitle displayed on the mobile-first guest feedback pill selector.
     */
    public function description(): string
    {
        return match ($this) {
            self::Materi => 'Pesan firman, kedalaman diskusi & relevansi topik',
            self::Hospitality => 'Sambutan, konsumsi, kehangatan & kenyamanan ruang',
            self::AcaraGames => 'Alur 90 menit, worship, icebreaker & dinamika acara',
            self::Lainnya => 'Masukan umum, ide kreatif, atau saran lainnya',
        };
    }

    /**
     * Serializes all enum cases into structured options for Inertia/React components.
     *
     * @return list<array{value: string, label: string, description: string}>
     */
    public static function options(): array
    {
        return array_map(
            static fn (self $case): array => [
                'value' => $case->value,
                'label' => $case->label(),
                'description' => $case->description(),
            ],
            self::cases()
        );
    }
}
