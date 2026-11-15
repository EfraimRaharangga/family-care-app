<?php

declare(strict_types=1);

/**
 * Purpose: Pest PHP Feature Tests for Phase 0 Architecture, RBAC, Multi-Tenancy & Showcase Routes.
 * Domain Context: Verifies Enum casting on Eloquent models, `cell_id` tenant scoping,
 *                 Spatie Role/Permission assignments, 100% technical anonymity on `feedbacks`,
 *                 `SoftDeletes` + `LogsActivity` on `transactions`, and `/` & `/design-system` routes.
 * Key Dependencies: `DatabaseSeeder`, `LedgerBalanceService`, `GenerateEventPinAction`.
 */

use App\Actions\GenerateEventPinAction;
use App\Enums\EventStatus;
use App\Enums\EventType;
use App\Enums\FundType;
use App\Enums\UserTier;
use App\Enums\VitalOrgan;
use App\Models\Cell;
use App\Models\Event;
use App\Models\FinanceFund;
use App\Models\Scopes\CellScope;
use App\Models\Transaction;
use App\Models\User;
use App\Services\LedgerBalanceService;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Support\Facades\Schema;
use Spatie\Activitylog\Models\Activity;

beforeEach(function (): void {
    CellScope::setCurrentCellId(null);
});

it('seeds FC R&D cell, whitelisted members across Part and 5 Vital Organs, and 3 virtual funds', function (): void {
    $this->seed(DatabaseSeeder::class);

    $cell = Cell::query()->where('slug', 'fc-rnd')->first();
    expect($cell)->not->toBeNull()
        ->and($cell->name)->toBe('FC R&D');

    $users = User::query()->forCell($cell->id)->get();
    expect($users)->toHaveCount(10);

    // Verify Enum casting on User model
    $brainUser = User::query()->where('email', 'brain@fcrnd.local')->firstOrFail();
    expect($brainUser->tier)->toBe(UserTier::Vital)
        ->and($brainUser->vital_organ)->toBe(VitalOrgan::Brain)
        ->and($brainUser->hasRole('vital'))->toBeTrue()
        ->and($brainUser->hasRole('vital:brain'))->toBeTrue()
        ->and($brainUser->can('pastoral.manage'))->toBeTrue();

    // Verify all 3 virtual funds exist and cast FundType enum properly
    $funds = FinanceFund::query()->forCell($cell->id)->get();
    expect($funds)->toHaveCount(3)
        ->and($funds->pluck('type')->all())->toContain(
            FundType::Routine,
            FundType::Diaconia,
            FundType::SpecialEvent
        );
});

it('enforces Soft Multi-Tenancy (cell_id) isolation via CellScope', function (): void {
    $cellA = Cell::query()->create([
        'name' => 'FC R&D',
        'slug' => 'fc-rnd',
        'is_active' => true,
    ]);

    $cellB = Cell::query()->create([
        'name' => 'FC Harvest',
        'slug' => 'fc-harvest',
        'is_active' => true,
    ]);

    CellScope::setCurrentCellId($cellA->id);
    FinanceFund::query()->create([
        'name' => 'Kas Rutin A',
        'slug' => 'kas-rutin',
        'type' => FundType::Routine,
        'cached_balance' => 500000,
    ]);

    CellScope::setCurrentCellId($cellB->id);
    FinanceFund::query()->create([
        'name' => 'Kas Rutin B',
        'slug' => 'kas-rutin',
        'type' => FundType::Routine,
        'cached_balance' => 900000,
    ]);

    // When scoped to Cell A, only Cell A records are visible
    CellScope::setCurrentCellId($cellA->id);
    expect(FinanceFund::query()->count())->toBe(1)
        ->and(FinanceFund::query()->firstOrFail()->name)->toBe('Kas Rutin A');
});

it('guarantees 100% technical anonymity on the feedbacks table with zero user_id or IP columns', function (): void {
    expect(Schema::hasTable('feedbacks'))->toBeTrue()
        ->and(Schema::hasColumn('feedbacks', 'user_id'))->toBeFalse()
        ->and(Schema::hasColumn('feedbacks', 'ip_address'))->toBeFalse()
        ->and(Schema::hasColumn('feedbacks', 'user_agent'))->toBeFalse()
        ->and(Schema::hasColumn('feedbacks', 'fingerprint'))->toBeFalse();
});

it('enforces SoftDeletes and Spatie Activitylog audit trails on financial transactions', function (): void {
    $this->seed(DatabaseSeeder::class);

    $cell = Cell::query()->where('slug', 'fc-rnd')->firstOrFail();
    $treasurer = User::query()->where('email', 'treasurer@fcrnd.local')->firstOrFail();
    $fund = FinanceFund::query()->forCell($cell->id)->where('slug', 'kas-rutin')->firstOrFail();

    $ledgerService = app(LedgerBalanceService::class);
    $initialBalance = (float) $fund->cached_balance;

    $tx = $ledgerService->recordTransaction([
        'cell_id' => $cell->id,
        'finance_fund_id' => $fund->id,
        'recorded_by' => $treasurer->id,
        'direction' => 'in',
        'amount' => 250000.00,
        'category' => 'Special Offering',
        'description' => 'Persembahan Syukur Anggota',
        'transaction_date' => now()->toDateString(),
        'reference_note' => 'TEST-AUDIT-01',
    ]);

    $fund->refresh();
    expect((float) $fund->cached_balance)->toBe($initialBalance + 250000.00);

    // Voiding soft-deletes the transaction (never hard-deleted) and recalculates cached_balance
    $ledgerService->voidTransaction($tx);

    $fund->refresh();
    expect((float) $fund->cached_balance)->toBe($initialBalance)
        ->and(Transaction::withTrashed()->find($tx->id))->not->toBeNull()
        ->and(Transaction::withTrashed()->find($tx->id)?->trashed())->toBeTrue()
        ->and(Activity::query()->where('subject_type', Transaction::class)->where('subject_id', $tx->id)->count())
        ->toBeGreaterThanOrEqual(2);
});

it('blocks non-whitelisted users from logging in', function (): void {
    $cell = Cell::query()->create([
        'name' => 'FC R&D',
        'slug' => 'fc-rnd',
        'is_active' => true,
    ]);

    $blockedUser = User::factory()->inCell($cell)->create([
        'email' => 'unwhitelisted@fcrnd.local',
        'is_whitelisted' => false,
    ]);

    $response = $this->post('/login', [
        'email' => $blockedUser->email,
        'password' => 'password',
    ]);

    $response->assertSessionHasErrors('email');
    $this->assertGuest();
});

it('renders the Phase 0 System Health & Codecademy Design Showcase at / and /design-system', function (): void {
    $this->seed(DatabaseSeeder::class);

    $pinAction = app(GenerateEventPinAction::class);
    expect(strlen($pinAction->execute()))->toBe(6);

    $homeResponse = $this->get('/');
    $homeResponse->assertOk();

    $showcaseResponse = $this->get('/design-system');
    $showcaseResponse->assertOk();

    $event = Event::query()->firstOrFail();
    expect($event->type)->toBe(EventType::CellGathering)
        ->and($event->status)->toBeIn([EventStatus::Completed, EventStatus::Upcoming]);
});
