<?php

declare(strict_types=1);

/**
 * Purpose: Pest PHP Unit Tests for FC R&D Native PHP 8.3+ Domain Enums.
 * Domain Context: Verifies `UserTier`, `VitalOrgan`, `FundType`, `EventType`, and `EventStatus`
 *                 backing values, metadata helpers, Spatie RBAC mappings, and Gamut tokens.
 * Key Dependencies: `App\Enums\*`.
 */

use App\Enums\EventStatus;
use App\Enums\EventType;
use App\Enums\FundType;
use App\Enums\UserTier;
use App\Enums\VitalOrgan;

it('defines exactly 2 Journey of Belonging tiers (Part and Vital)', function (): void {
    $cases = UserTier::cases();

    expect($cases)->toHaveCount(2)
        ->and(UserTier::Part->value)->toBe('part')
        ->and(UserTier::Vital->value)->toBe('vital')
        ->and(UserTier::Part->spatieRoleName())->toBe('part')
        ->and(UserTier::Vital->spatieRoleName())->toBe('vital')
        ->and(UserTier::Part->surfaceHex())->toBe('#F1F5F9')
        ->and(UserTier::Vital->surfaceHex())->toBe('#EEF2FF');
});

it('defines all 5 Vital Organs with canonical emojis, team names, and Spatie role mappings', function (): void {
    $organs = VitalOrgan::cases();

    expect($organs)->toHaveCount(5)
        ->and(VitalOrgan::Brain->emoji())->toBe('🧠')
        ->and(VitalOrgan::Brain->teamName())->toBe('Leader')
        ->and(VitalOrgan::Brain->spatieRoleName())->toBe('vital:brain')
        ->and(VitalOrgan::Lungs->emoji())->toBe('🫁')
        ->and(VitalOrgan::Lungs->teamName())->toBe('Event Team')
        ->and(VitalOrgan::HandsAndFeet->emoji())->toBe('🤲')
        ->and(VitalOrgan::HandsAndFeet->teamName())->toBe('Hospitality Team')
        ->and(VitalOrgan::VascularSystem->emoji())->toBe('🫀')
        ->and(VitalOrgan::VascularSystem->teamName())->toBe('Treasurer')
        ->and(VitalOrgan::NervousSystem->emoji())->toBe('⚡')
        ->and(VitalOrgan::NervousSystem->teamName())->toBe('IT Team');

    foreach ($organs as $organ) {
        expect($organ->permissions())->toBeArray()->not->toBeEmpty()
            ->and($organ->surfaceHex())->toStartWith('#')
            ->and($organ->accentHex())->toStartWith('#');
    }
});

it('defines the 3 virtual fund types for FC R&D financial stewardship', function (): void {
    expect(FundType::cases())->toHaveCount(3)
        ->and(FundType::Routine->label())->toBe('Kas Rutin')
        ->and(FundType::Diaconia->label())->toBe('Dana Diakonia & Kado')
        ->and(FundType::SpecialEvent->label())->toBe('Dana Acara Khusus');
});

it('defaults standard cell gatherings to a 90-minute run sheet duration and controls feedback PIN state', function (): void {
    expect(EventType::CellGathering->defaultDurationMinutes())->toBe(90)
        ->and(EventStatus::Ongoing->acceptsFeedback())->toBeTrue()
        ->and(EventStatus::Completed->acceptsFeedback())->toBeTrue()
        ->and(EventStatus::Draft->acceptsFeedback())->toBeFalse()
        ->and(EventStatus::Cancelled->acceptsFeedback())->toBeFalse();
});
