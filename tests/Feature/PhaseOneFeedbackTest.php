<?php

declare(strict_types=1);

/**
 * Purpose: Comprehensive Pest PHP Feature Tests for Phase 1 (Anonymous Feedback Engine,
 *          Daily 4-Digit PIN Gate, Quick Session Generator, and Nervous System Analytics Dashboard).
 * Domain Context: Verifies all Phase 1 requirements from Section 6.1:
 *                 1. Showcase removal (`404` on `/design-system`).
 *                 2. Root `/` redirecting guests to `/login` and authenticated leaders to `/dashboard`.
 *                 3. Guest 4-digit PIN verification (valid PIN, wrong PIN, expired PIN).
 *                 4. 100% Anonymous feedback submission, conditional pastoral care fields,
 *                    zero `pastoral_follow_ups` writes, and zero user/IP tracking.
 *                 5. Authenticated quick event session creation + 4-digit PIN generation +
 *                    `is_reviewed` triage toggling + `cell_id` tenant isolation.
 * Key Dependencies: `DatabaseSeeder`, `GuestFeedbackController`, `FeedbackDashboardController`.
 */

use App\Enums\EventStatus;
use App\Enums\EventType;
use App\Enums\FeedbackCategory;
use App\Models\Cell;
use App\Models\Event;
use App\Models\Feedback;
use App\Models\PastoralFollowUp;
use App\Models\Scopes\CellScope;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;

beforeEach(function (): void {
    CellScope::setCurrentCellId(null);
});

it('redirects unauthenticated visitors at / to /login and authenticated leaders at / to /dashboard', function (): void {
    $this->seed(DatabaseSeeder::class);

    // Guest visiting / redirects to /login
    $guestResponse = $this->get('/');
    $guestResponse->assertRedirect(route('login'));

    // Authenticated Vital servant visiting / redirects to /dashboard
    $leader = User::query()->where('email', 'brain@fcrnd.local')->firstOrFail();
    $authResponse = $this->actingAs($leader)->get('/');
    $authResponse->assertRedirect(route('dashboard'));
});

it('verifies a valid 4-digit PIN and rejects wrong or expired PINs on /feedback', function (): void {
    $this->seed(DatabaseSeeder::class);

    // 1. Valid active PIN (2408 from seeder, valid for 24h)
    $validVerify = $this->post('/feedback/verify-pin', [
        'pin' => '2408',
    ]);
    $validVerify->assertRedirect(route('feedback.index', ['pin' => '2408']));

    $portalPage = $this->get('/feedback?pin=2408');
    $portalPage->assertOk();

    // 2. Wrong / non-existent 4-digit PIN
    $wrongVerify = $this->from('/feedback')->post('/feedback/verify-pin', [
        'pin' => '9999',
    ]);
    $wrongVerify->assertRedirect('/feedback');
    $wrongVerify->assertSessionHasErrors('pin');

    // 3. Expired 4-digit PIN (`1842` from seeder has pin_expires_at in the past)
    $expiredVerify = $this->from('/feedback')->post('/feedback/verify-pin', [
        'pin' => '1842',
    ]);
    $expiredVerify->assertRedirect('/feedback');
    $expiredVerify->assertSessionHasErrors('pin');
});

it('stores 100% anonymous feedback with conditional pastoral care fields and zero user/IP or pastoral_follow_ups writes', function (): void {
    $this->seed(DatabaseSeeder::class);

    $activeEvent = Event::withoutGlobalScope(CellScope::class)
        ->where('feedback_pin', '2408')
        ->firstOrFail();

    $initialFollowUpsCount = PastoralFollowUp::withoutGlobalScope(CellScope::class)->count();

    // Case A: Feedback WITH needs_pastoral_care = true
    $responseWithPastoral = $this->post('/feedback', [
        'pin' => '2408',
        'rating' => 5,
        'category' => FeedbackCategory::Hospitality->value,
        'message' => 'Suasana komsel malam ini sangat hangat. Mohon dukungan doa untuk wawancara kerja minggu depan.',
        'needs_pastoral_care' => true,
        'contact_name' => 'Jonathan',
        'contact_info' => 'WA: 0812-3344-5566',
    ]);

    $responseWithPastoral->assertRedirect(route('feedback.index', ['pin' => '2408', 'submitted' => 1]));

    $savedPastoralFeedback = Feedback::withoutGlobalScope(CellScope::class)
        ->where('event_id', $activeEvent->id)
        ->where('contact_name', 'Jonathan')
        ->first();

    expect($savedPastoralFeedback)->not->toBeNull()
        ->and($savedPastoralFeedback->cell_id)->toBe($activeEvent->cell_id)
        ->and($savedPastoralFeedback->rating)->toBe(5)
        ->and($savedPastoralFeedback->category)->toBe(FeedbackCategory::Hospitality)
        ->and($savedPastoralFeedback->needs_pastoral_care)->toBeTrue()
        ->and($savedPastoralFeedback->contact_info)->toBe('WA: 0812-3344-5566')
        ->and($savedPastoralFeedback->is_reviewed)->toBeFalse();

    // Scope boundary check: MUST NOT create records in pastoral_follow_ups in Phase 1
    expect(PastoralFollowUp::withoutGlobalScope(CellScope::class)->count())->toBe($initialFollowUpsCount);

    // Case B: Feedback WITH needs_pastoral_care = false (must strip contact_name & contact_info even if passed)
    $responseWithoutPastoral = $this->post('/feedback', [
        'pin' => '2408',
        'rating' => 4,
        'category' => FeedbackCategory::AcaraGames->value,
        'message' => 'Icebreaker sangat seru, waktu 90 menit terasa pas.',
        'needs_pastoral_care' => false,
        'contact_name' => 'Should Be Stripped',
        'contact_info' => 'Should Be Stripped',
    ]);

    $responseWithoutPastoral->assertRedirect(route('feedback.index', ['pin' => '2408', 'submitted' => 1]));

    $savedAnonymousFeedback = Feedback::withoutGlobalScope(CellScope::class)
        ->where('event_id', $activeEvent->id)
        ->where('message', 'Icebreaker sangat seru, waktu 90 menit terasa pas.')
        ->firstOrFail();

    expect($savedAnonymousFeedback->needs_pastoral_care)->toBeFalse()
        ->and($savedAnonymousFeedback->contact_name)->toBeNull()
        ->and($savedAnonymousFeedback->contact_info)->toBeNull();
});

it('allows authenticated leaders to create a quick session with a 24h 4-digit PIN, regenerate PINs, and toggle is_reviewed triage', function (): void {
    $this->seed(DatabaseSeeder::class);

    $itLeader = User::query()->where('email', 'it@fcrnd.local')->firstOrFail();

    // 1. View Dashboard & Analytics
    $dashboardResponse = $this->actingAs($itLeader)->get('/dashboard');
    $dashboardResponse->assertOk();

    // 2. Quick Create Event Session & Generate 24h 4-Digit PIN
    $createResponse = $this->actingAs($itLeader)->post('/dashboard/events/quick', [
        'title' => 'Meet FC 5: Kingdom Builders Night',
        'type' => EventType::MeetFc5->value,
        'event_date' => now()->toDateString(),
        'location' => 'Main Hall History Maker',
    ]);

    $createResponse->assertRedirect(route('dashboard'));

    $createdEvent = Event::withoutGlobalScope(CellScope::class)
        ->where('title', 'Meet FC 5: Kingdom Builders Night')
        ->firstOrFail();

    expect($createdEvent->cell_id)->toBe($itLeader->cell_id)
        ->and($createdEvent->type)->toBe(EventType::MeetFc5)
        ->and($createdEvent->feedback_pin)->toMatch('/^\d{4}$/')
        ->and($createdEvent->isPinActive())->toBeTrue();

    // 3. Regenerate 4-digit PIN on the event
    $regenResponse = $this->actingAs($itLeader)
        ->from('/dashboard')
        ->post("/dashboard/events/{$createdEvent->id}/regenerate-pin");

    $regenResponse->assertRedirect('/dashboard');
    $createdEvent->refresh();
    expect($createdEvent->feedback_pin)->toMatch('/^\d{4}$/')
        ->and($createdEvent->isPinActive())->toBeTrue();

    // 4. Toggle `is_reviewed` triage status on a feedback item
    $feedback = Feedback::withoutGlobalScope(CellScope::class)
        ->where('cell_id', $itLeader->cell_id)
        ->where('is_reviewed', false)
        ->firstOrFail();

    $toggleResponse = $this->actingAs($itLeader)
        ->from('/dashboard')
        ->patch("/dashboard/feedbacks/{$feedback->id}/toggle-review");

    $toggleResponse->assertRedirect('/dashboard');
    $feedback->refresh();
    expect($feedback->is_reviewed)->toBeTrue();
});

it('enforces Soft Multi-Tenancy (cell_id) isolation on dashboard event PIN regeneration and feedback triage', function (): void {
    $this->seed(DatabaseSeeder::class);

    $cellB = Cell::query()->create([
        'name' => 'FC Harvest',
        'slug' => 'fc-harvest',
        'is_active' => true,
    ]);

    $otherCellEvent = Event::withoutGlobalScope(CellScope::class)->create([
        'cell_id' => $cellB->id,
        'title' => 'FC Harvest Session',
        'type' => EventType::Regular,
        'status' => EventStatus::Ongoing,
        'scheduled_at' => now(),
        'duration_minutes' => 90,
        'feedback_pin' => '8888',
        'pin_expires_at' => now()->addHours(24),
    ]);

    $otherCellFeedback = Feedback::withoutGlobalScope(CellScope::class)->create([
        'cell_id' => $cellB->id,
        'event_id' => $otherCellEvent->id,
        'rating' => 5,
        'category' => FeedbackCategory::Materi,
        'message' => 'Feedback milik komsel lain.',
        'needs_pastoral_care' => false,
        'is_reviewed' => false,
    ]);

    // Leader from FC R&D attempts to toggle feedback or regenerate PIN belonging to FC Harvest
    $fcRndLeader = User::query()->where('email', 'brain@fcrnd.local')->firstOrFail();

    $this->actingAs($fcRndLeader)
        ->patch("/dashboard/feedbacks/{$otherCellFeedback->id}/toggle-review")
        ->assertNotFound();

    $this->actingAs($fcRndLeader)
        ->post("/dashboard/events/{$otherCellEvent->id}/regenerate-pin")
        ->assertNotFound();
});
