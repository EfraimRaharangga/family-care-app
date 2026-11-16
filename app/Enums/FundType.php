<?php

declare(strict_types=1);

/**
 * Purpose: Categorizes virtual fund buckets managed by the Vascular System (Treasurer).
 * Domain Context: FC separates cell cash into virtual envelopes (Kas Rutin,
 *                 Dana Diakonia & Kado, Dana Acara Khusus) without needing multiple bank accounts.
 * Key Dependencies: FinanceFund model, LedgerBalanceService, DatabaseSeeder.
 */

namespace App\Enums;

enum FundType: string
{
    case Routine = 'routine';
    case Diaconia = 'diaconia';
    case SpecialEvent = 'special_event';

    /**
     * Canonical Indonesian fund name used by FC.
     */
    public function label(): string
    {
        return match ($this) {
            self::Routine => 'Kas Rutin',
            self::Diaconia => 'Dana Diakonia & Kado',
            self::SpecialEvent => 'Dana Acara Khusus',
        };
    }

    /**
     * URL/database-safe slug for the virtual fund.
     */
    public function defaultSlug(): string
    {
        return match ($this) {
            self::Routine => 'kas-rutin',
            self::Diaconia => 'dana-diakonia-kado',
            self::SpecialEvent => 'dana-acara-khusus',
        };
    }

    /**
     * Explains the financial stewardship purpose of each virtual fund.
     */
    public function description(): string
    {
        return match ($this) {
            self::Routine => 'Weekly fellowship consumption, worship supplies, and routine cell operational needs.',
            self::Diaconia => 'Birthday gifts, hospital visits, bereavement support, and member care allocations.',
            self::SpecialEvent => 'Retreats, outreach gatherings, Christmas/Easter celebrations, and special initiatives.',
        };
    }

    /**
     * Quiet neutral header banner hex (`#F8FAFC`) adhering to `docs/DESIGN_SYSTEM.md`.
     */
    public function bannerHex(): string
    {
        return '#F8FAFC';
    }
}
