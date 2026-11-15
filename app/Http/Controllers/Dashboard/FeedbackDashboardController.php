<?php

declare(strict_types=1);

/**
 * Purpose: Powers the Authenticated Leader / Nervous System Analytics & Triage Dashboard (`/dashboard`).
 * Domain Context: Stewarded by the Nervous System (IT Team) and Brain (Leader).
 *                 Provides:
 *                 1. Quick Event Session & 24-Hour 4-Digit PIN Generator (Bridge feature before Phase 3).
 *                 2. Active PIN Banner with 1-Click Copy for WhatsApp & PIN Regeneration.
 *                 3. KPI Summary Cards, Recharts Satisfaction Trend across sessions,
 *                    multi-dimensional Feedback Filtering, and 1-Click `is_reviewed` Triage Toggle.
 * Key Dependencies: `QuickCreateEventSessionRequest`, `GenerateEventPinAction`, `Event`, `Feedback`.
 */

namespace App\Http\Controllers\Dashboard;

use App\Actions\GenerateEventPinAction;
use App\Enums\EventStatus;
use App\Enums\EventType;
use App\Enums\FeedbackCategory;
use App\Http\Controllers\Controller;
use App\Http\Requests\Events\QuickCreateEventSessionRequest;
use App\Models\Cell;
use App\Models\Event;
use App\Models\Feedback;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class FeedbackDashboardController extends Controller
{
    // =========================================================================
    // 1. DASHBOARD & ANALYTICS OVERVIEW (`GET /dashboard`)
    // =========================================================================

    /**
     * Render the Phase 1 Nervous System Feedback Analytics & Session PIN Dashboard.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $cell = $user?->cell_id
            ? Cell::query()->find($user->cell_id)
            : Cell::query()->where('slug', 'fc-rnd')->first();

        // Filter parameters
        $eventIdFilter = (string) $request->query('event_id', 'all');
        $categoryFilter = (string) $request->query('category', 'all');
        $reviewStatusFilter = (string) $request->query('review_status', 'all');
        $pastoralOnlyFilter = $request->boolean('pastoral_only');
        $searchFilter = trim((string) $request->query('search', ''));

        // Load all events in the current cell (automatically scoped via CellScope)
        $events = Event::query()
            ->withCount('feedbacks')
            ->withAvg('feedbacks', 'rating')
            ->orderByDesc('scheduled_at')
            ->orderByDesc('id')
            ->get();

        // Identify the active PIN event (or latest event if none currently active)
        /** @var Event|null $activePinEvent */
        $activePinEvent = $events->first(static fn (Event $event): bool => $event->isPinActive())
            ?? $events->first();

        // Global Cell KPI Metrics (unfiltered totals for top-level situational awareness)
        $allFeedbacksQuery = Feedback::query();
        $totalFeedbacksCount = (clone $allFeedbacksQuery)->count();
        $averageSatisfaction = $totalFeedbacksCount > 0
            ? round((float) (clone $allFeedbacksQuery)->avg('rating'), 2)
            : 0.0;
        $unreviewedCount = (clone $allFeedbacksQuery)->where('is_reviewed', false)->count();
        $pastoralCareRequestsCount = (clone $allFeedbacksQuery)->where('needs_pastoral_care', true)->count();
        $unreviewedPastoralCount = (clone $allFeedbacksQuery)
            ->where('needs_pastoral_care', true)
            ->where('is_reviewed', false)
            ->count();

        // Recharts Trend Visualization across recent sessions (chronological order)
        $trendSeries = $events
            ->take(8)
            ->reverse()
            ->values()
            ->map(static fn (Event $event): array => [
                'event_id' => $event->id,
                'short_label' => Str::limit($event->title, 22),
                'title' => $event->title,
                'type_label' => $event->type->label(),
                'event_date' => $event->scheduled_at->format('d M'),
                'average_rating' => $event->feedbacks_avg_rating !== null
                    ? round((float) $event->feedbacks_avg_rating, 2)
                    : 0.0,
                'feedbacks_count' => (int) $event->feedbacks_count,
            ])
            ->all();

        // Filtered Feedback Triage Query
        $filteredQuery = Feedback::query()->with('event');

        if ($eventIdFilter !== 'all' && is_numeric($eventIdFilter)) {
            $filteredQuery->where('event_id', (int) $eventIdFilter);
        }

        if ($categoryFilter !== 'all' && FeedbackCategory::tryFrom($categoryFilter) !== null) {
            $filteredQuery->where('category', $categoryFilter);
        }

        if ($reviewStatusFilter === 'unreviewed') {
            $filteredQuery->where('is_reviewed', false);
        } elseif ($reviewStatusFilter === 'reviewed') {
            $filteredQuery->where('is_reviewed', true);
        }

        if ($pastoralOnlyFilter) {
            $filteredQuery->where('needs_pastoral_care', true);
        }

        if ($searchFilter !== '') {
            $filteredQuery->where(static function ($q) use ($searchFilter): void {
                $q->where('message', 'like', "%{$searchFilter}%")
                    ->orWhere('contact_name', 'like', "%{$searchFilter}%")
                    ->orWhere('contact_info', 'like', "%{$searchFilter}%");
            });
        }

        $feedbacks = $filteredQuery
            ->orderBy('is_reviewed')
            ->orderByDesc('needs_pastoral_care')
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->get()
            ->map(static fn (Feedback $feedback): array => [
                'id' => $feedback->id,
                'event_id' => $feedback->event_id,
                'event_title' => $feedback->event?->title ?? 'Sesi FC R&D',
                'event_type_label' => $feedback->event?->type?->label() ?? 'Regular',
                'event_date' => $feedback->event?->scheduled_at?->format('d M Y') ?? '-',
                'rating' => $feedback->rating,
                'category' => $feedback->category->value,
                'category_label' => $feedback->category->label(),
                'message' => $feedback->message,
                'needs_pastoral_care' => $feedback->needs_pastoral_care,
                'contact_name' => $feedback->contact_name,
                'contact_info' => $feedback->contact_info,
                'is_reviewed' => $feedback->is_reviewed,
                'created_at_human' => $feedback->created_at?->diffForHumans() ?? 'Baru saja',
                'created_at_formatted' => $feedback->created_at?->format('d M Y · H:i') ?? '-',
            ])
            ->all();

        $eventOptions = $events
            ->map(static fn (Event $event): array => [
                'id' => $event->id,
                'title' => $event->title,
                'type' => $event->type->value,
                'type_label' => $event->type->label(),
                'scheduled_at' => $event->scheduled_at->toIso8601String(),
                'event_date_formatted' => $event->scheduled_at->format('d M Y'),
                'feedback_pin' => $event->feedback_pin,
                'pin_expires_at' => $event->pin_expires_at?->toIso8601String(),
                'is_pin_active' => $event->isPinActive(),
                'feedbacks_count' => (int) $event->feedbacks_count,
                'average_rating' => $event->feedbacks_avg_rating !== null
                    ? round((float) $event->feedbacks_avg_rating, 2)
                    : null,
            ])
            ->all();

        return Inertia::render('dashboard', [
            'cellName' => $cell?->name ?? 'FC R&D',
            'activePinSession' => $activePinEvent !== null ? [
                'id' => $activePinEvent->id,
                'title' => $activePinEvent->title,
                'type' => $activePinEvent->type->value,
                'type_label' => $activePinEvent->type->label(),
                'event_date_formatted' => $activePinEvent->scheduled_at->format('d M Y · H:i') . ' WIB',
                'feedback_pin' => $activePinEvent->feedback_pin,
                'pin_expires_at' => $activePinEvent->pin_expires_at?->toIso8601String(),
                'pin_expires_formatted' => $activePinEvent->pin_expires_at?->format('d M Y, H:i') . ' WIB',
                'pin_expires_human' => $activePinEvent->pin_expires_at?->diffForHumans(),
                'is_pin_active' => $activePinEvent->isPinActive(),
                'feedback_url' => url('/feedback?pin=' . $activePinEvent->feedback_pin),
            ] : null,
            'kpis' => [
                'total_feedbacks' => $totalFeedbacksCount,
                'average_rating' => $averageSatisfaction,
                'unreviewed_count' => $unreviewedCount,
                'pastoral_care_count' => $pastoralCareRequestsCount,
                'unreviewed_pastoral_count' => $unreviewedPastoralCount,
            ],
            'trendSeries' => $trendSeries,
            'events' => $eventOptions,
            'eventTypes' => EventType::options(),
            'categories' => FeedbackCategory::options(),
            'feedbacks' => $feedbacks,
            'filters' => [
                'event_id' => $eventIdFilter,
                'category' => $categoryFilter,
                'review_status' => $reviewStatusFilter,
                'pastoral_only' => $pastoralOnlyFilter,
                'search' => $searchFilter,
            ],
            'flashStatus' => $request->session()->get('status'),
        ]);
    }

    // =========================================================================
    // 2. QUICK SESSION & 24-HOUR 4-DIGIT PIN GENERATOR (`POST /dashboard/events/quick`)
    // =========================================================================

    /**
     * Create a new Event Session and generate a unique 4-digit PIN valid for 24 hours.
     */
    public function storeQuickEvent(
        QuickCreateEventSessionRequest $request,
        GenerateEventPinAction $pinAction
    ): RedirectResponse {
        $validated = $request->validated();
        $user = $request->user();
        $eventType = EventType::from((string) $validated['type']);
        $scheduledAt = Carbon::parse((string) $validated['event_date'])->setTime(19, 0);

        $pin = $pinAction->execute(4);

        $event = Event::query()->create([
            'cell_id' => $user?->cell_id,
            'title' => trim((string) $validated['title']),
            'type' => $eventType,
            'status' => EventStatus::Ongoing,
            'scheduled_at' => $scheduledAt,
            'duration_minutes' => $eventType->defaultDurationMinutes(),
            'location' => ! empty($validated['location'])
                ? trim((string) $validated['location'])
                : 'Basecamp History Maker — Ruang R&D Lt. 2',
            'feedback_pin' => $pin,
            'pin_expires_at' => now()->addHours(24),
            'created_by' => $user?->id,
        ]);

        return redirect()
            ->route('dashboard')
            ->with('status', "Sesi \"{$event->title}\" berhasil dibuat dengan PIN aktif: {$pin} (berlaku 24 jam).");
    }

    // =========================================================================
    // 3. REGENERATE 4-DIGIT PIN (`POST /dashboard/events/{event}/regenerate-pin`)
    // =========================================================================

    /**
     * Regenerate a fresh 4-digit numeric PIN valid for the next 24 hours on an existing Event.
     */
    public function regeneratePin(
        Event $event,
        GenerateEventPinAction $pinAction
    ): RedirectResponse {
        $newPin = $pinAction->execute(4);

        $event->update([
            'feedback_pin' => $newPin,
            'pin_expires_at' => now()->addHours(24),
        ]);

        return redirect()
            ->back()
            ->with('status', "PIN baru {$newPin} berhasil di-generate untuk \"{$event->title}\" (berlaku 24 jam).");
    }

    // =========================================================================
    // 4. 1-CLICK FEEDBACK TRIAGE TOGGLE (`PATCH /dashboard/feedbacks/{feedback}/toggle-review`)
    // =========================================================================

    /**
     * Toggle `is_reviewed` between `Belum Dibahas` (`false`) and `Sudah Dievaluasi` (`true`).
     */
    public function toggleReview(Feedback $feedback): RedirectResponse
    {
        $newState = ! $feedback->is_reviewed;

        $feedback->update([
            'is_reviewed' => $newState,
        ]);

        $statusLabel = $newState ? 'Sudah Dievaluasi' : 'Belum Dibahas';

        return redirect()
            ->back()
            ->with('status', "Status evaluasi feedback berhasil diubah menjadi: {$statusLabel}.");
    }
}
