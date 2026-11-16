<?php

declare(strict_types=1);

/**
 * Purpose: Powers the Authenticated Leader / Nervous System Overview Dashboard (`/dashboard`),
 *          Feedback Data Page (`/feedback-data`), and Event List Page (`/events`).
 * Domain Context: Stewarded by the Nervous System (IT Team) and Brain (Leader).
 *                 Provides:
 *                 1. General Cell Overview Dashboard with filterable KPIs & Recharts visualizations
 *                    (Events, Members, Feedback Satisfaction, and Virtual Fund Balances).
 *                 2. Active 4-Digit PIN Banner & Quick Session Generator.
 *                 3. Dedicated Feedback Data Page with multi-dimensional filtering and 1-click triage.
 *                 4. Dedicated Event List Page with event creation, filtering, and PIN management.
 * Key Dependencies: `QuickCreateEventSessionRequest`, `GenerateEventPinAction`, `Event`, `Feedback`, `User`, `FinanceFund`.
 */

namespace App\Http\Controllers\Dashboard;

use App\Actions\GenerateEventPinAction;
use App\Enums\EventStatus;
use App\Enums\EventType;
use App\Enums\FeedbackCategory;
use App\Enums\UserTier;
use App\Http\Controllers\Controller;
use App\Http\Requests\Events\QuickCreateEventSessionRequest;
use App\Models\Cell;
use App\Models\Event;
use App\Models\Feedback;
use App\Models\FinanceFund;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class FeedbackDashboardController extends Controller
{
    /**
     * Resolve the active cell tenant for the authenticated user.
     */
    private function resolveCell(Request $request): ?Cell
    {
        $user = $request->user();

        return $user?->cell_id
            ? Cell::query()->find($user->cell_id)
            : Cell::query()->where('slug', 'fc-rnd')->first();
    }

    /**
     * Build the Active PIN Session payload for the banner.
     *
     * @return array<string, mixed>|null
     */
    private function formatActivePinSession(?Event $event): ?array
    {
        if ($event === null) {
            return null;
        }

        return [
            'id' => $event->id,
            'title' => $event->title,
            'type' => $event->type->value,
            'type_label' => $event->type->label(),
            'event_date_formatted' => $event->scheduled_at->format('d M Y · H:i') . ' WIB',
            'feedback_pin' => $event->feedback_pin,
            'pin_expires_at' => $event->pin_expires_at?->toIso8601String(),
            'pin_expires_formatted' => $event->pin_expires_at?->format('d M Y, H:i') . ' WIB',
            'pin_expires_human' => $event->pin_expires_at?->diffForHumans(),
            'is_pin_active' => $event->isPinActive(),
            'feedback_url' => url('/feedback?pin=' . $event->feedback_pin),
        ];
    }

    // =========================================================================
    // 1. GENERAL OVERVIEW DASHBOARD (`GET /dashboard`)
    // =========================================================================

    /**
     * Render the general cell overview dashboard with filterable charts and KPIs.
     */
    public function index(Request $request): Response
    {
        $cell = $this->resolveCell($request);

        $eventTypeFilter = (string) $request->query('event_type', 'all');
        $periodFilter = (string) $request->query('period', 'all');

        // Unfiltered events for active PIN banner
        $allEvents = Event::query()
            ->orderByDesc('scheduled_at')
            ->orderByDesc('id')
            ->get();

        /** @var Event|null $activePinEvent */
        $activePinEvent = $allEvents->first(static fn (Event $event): bool => $event->isPinActive())
            ?? $allEvents->first();

        // Filtered events query for overview metrics & charts
        $eventsQuery = Event::query()
            ->withCount('feedbacks')
            ->withAvg('feedbacks', 'rating');

        if ($eventTypeFilter !== 'all' && EventType::tryFrom($eventTypeFilter) !== null) {
            $eventsQuery->where('type', $eventTypeFilter);
        }

        if ($periodFilter === '7d') {
            $eventsQuery->where('scheduled_at', '>=', now()->subDays(7));
        } elseif ($periodFilter === '30d') {
            $eventsQuery->where('scheduled_at', '>=', now()->subDays(30));
        }

        $filteredEvents = $eventsQuery
            ->orderByDesc('scheduled_at')
            ->orderByDesc('id')
            ->get();

        $filteredEventIds = $filteredEvents->pluck('id');

        // Filtered feedback metrics
        $feedbacksQuery = Feedback::query()->whereIn('event_id', $filteredEventIds);
        $totalFeedbacks = (clone $feedbacksQuery)->count();
        $averageRating = $totalFeedbacks > 0
            ? round((float) (clone $feedbacksQuery)->avg('rating'), 2)
            : 0.0;
        $unreviewedCount = (clone $feedbacksQuery)->where('is_reviewed', false)->count();
        $pastoralCareCount = (clone $feedbacksQuery)->where('needs_pastoral_care', true)->count();

        // General cell metrics (members & virtual funds)
        $totalMembers = User::query()->where('is_active', true)->count();
        $vitalMembers = User::query()->where('is_active', true)->where('tier', UserTier::Vital->value)->count();
        $partMembers = User::query()->where('is_active', true)->where('tier', UserTier::Part->value)->count();
        $totalFundsBalance = (float) FinanceFund::query()->sum('cached_balance');

        // Recharts Trend Visualization across filtered events (chronological)
        $trendSeries = $filteredEvents
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

        // Feedback Category Breakdown for second Recharts visualization
        $filteredFeedbacks = (clone $feedbacksQuery)->get();
        $categoryBreakdown = collect(FeedbackCategory::cases())
            ->map(static function (FeedbackCategory $cat) use ($filteredFeedbacks): array {
                $matching = $filteredFeedbacks->where('category', $cat);

                return [
                    'category' => $cat->value,
                    'label' => $cat->label(),
                    'count' => $matching->count(),
                    'avg_rating' => $matching->count() > 0
                        ? round((float) $matching->avg('rating'), 2)
                        : 0.0,
                ];
            })
            ->values()
            ->all();

        return Inertia::render('dashboard', [
            'cellName' => $cell?->name ?? 'Family Care',
            'activePinSession' => $this->formatActivePinSession($activePinEvent),
            'overviewKpis' => [
                'total_events' => $filteredEvents->count(),
                'active_pin_events' => $filteredEvents->filter(static fn (Event $e): bool => $e->isPinActive())->count(),
                'total_members' => $totalMembers,
                'vital_members' => $vitalMembers,
                'part_members' => $partMembers,
                'total_feedbacks' => $totalFeedbacks,
                'average_rating' => $averageRating,
                'unreviewed_count' => $unreviewedCount,
                'pastoral_care_count' => $pastoralCareCount,
                'total_funds_balance' => $totalFundsBalance,
            ],
            'trendSeries' => $trendSeries,
            'categoryBreakdown' => $categoryBreakdown,
            'eventTypes' => EventType::options(),
            'filters' => [
                'event_type' => $eventTypeFilter,
                'period' => $periodFilter,
            ],
            'flashStatus' => $request->session()->get('status'),
        ]);
    }

    // =========================================================================
    // 2. FEEDBACK DATA PAGE (`GET /feedback-data`)
    // =========================================================================

    /**
     * Render the dedicated Feedback Data page with filters and card/table view toggle.
     */
    public function feedbackData(Request $request): Response
    {
        $cell = $this->resolveCell($request);

        $eventIdFilter = (string) $request->query('event_id', 'all');
        $categoryFilter = (string) $request->query('category', 'all');
        $reviewStatusFilter = (string) $request->query('review_status', 'all');
        $pastoralOnlyFilter = $request->boolean('pastoral_only');
        $searchFilter = trim((string) $request->query('search', ''));

        $events = Event::query()
            ->withCount('feedbacks')
            ->withAvg('feedbacks', 'rating')
            ->orderByDesc('scheduled_at')
            ->orderByDesc('id')
            ->get();

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
                'event_title' => $feedback->event?->title ?? 'Sesi Family Care',
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

        return Inertia::render('FeedbackData/Index', [
            'cellName' => $cell?->name ?? 'Family Care',
            'kpis' => [
                'total_feedbacks' => $totalFeedbacksCount,
                'average_rating' => $averageSatisfaction,
                'unreviewed_count' => $unreviewedCount,
                'pastoral_care_count' => $pastoralCareRequestsCount,
                'unreviewed_pastoral_count' => $unreviewedPastoralCount,
            ],
            'events' => $eventOptions,
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
    // 3. EVENT LIST PAGE (`GET /events`)
    // =========================================================================

    /**
     * Render the dedicated Event List page with event creation, filtering, and card/table view.
     */
    public function events(Request $request): Response
    {
        $cell = $this->resolveCell($request);

        $typeFilter = (string) $request->query('type', 'all');
        $pinStatusFilter = (string) $request->query('pin_status', 'all');
        $searchFilter = trim((string) $request->query('search', ''));

        $eventsQuery = Event::query()
            ->withCount('feedbacks')
            ->withAvg('feedbacks', 'rating');

        if ($typeFilter !== 'all' && EventType::tryFrom($typeFilter) !== null) {
            $eventsQuery->where('type', $typeFilter);
        }

        if ($pinStatusFilter === 'active') {
            $eventsQuery->whereNotNull('pin_expires_at')->where('pin_expires_at', '>', now());
        } elseif ($pinStatusFilter === 'expired') {
            $eventsQuery->where(static function ($q): void {
                $q->whereNull('pin_expires_at')->orWhere('pin_expires_at', '<=', now());
            });
        }

        if ($searchFilter !== '') {
            $eventsQuery->where(static function ($q) use ($searchFilter): void {
                $q->where('title', 'like', "%{$searchFilter}%")
                    ->orWhere('location', 'like', "%{$searchFilter}%")
                    ->orWhere('feedback_pin', 'like', "%{$searchFilter}%");
            });
        }

        $events = $eventsQuery
            ->orderByDesc('scheduled_at')
            ->orderByDesc('id')
            ->get()
            ->map(static fn (Event $event): array => [
                'id' => $event->id,
                'title' => $event->title,
                'type' => $event->type->value,
                'type_label' => $event->type->label(),
                'status' => $event->status->value,
                'status_label' => $event->status->label(),
                'scheduled_at' => $event->scheduled_at->toIso8601String(),
                'event_date_formatted' => $event->scheduled_at->format('d M Y · H:i') . ' WIB',
                'duration_minutes' => $event->duration_minutes,
                'location' => $event->location,
                'feedback_pin' => $event->feedback_pin,
                'pin_expires_formatted' => $event->pin_expires_at?->format('d M Y, H:i') . ' WIB',
                'is_pin_active' => $event->isPinActive(),
                'feedbacks_count' => (int) $event->feedbacks_count,
                'average_rating' => $event->feedbacks_avg_rating !== null
                    ? round((float) $event->feedbacks_avg_rating, 2)
                    : null,
                'feedback_url' => url('/feedback?pin=' . $event->feedback_pin),
            ])
            ->all();

        return Inertia::render('Events/Index', [
            'cellName' => $cell?->name ?? 'Family Care',
            'events' => $events,
            'eventTypes' => EventType::options(),
            'filters' => [
                'type' => $typeFilter,
                'pin_status' => $pinStatusFilter,
                'search' => $searchFilter,
            ],
            'flashStatus' => $request->session()->get('status'),
        ]);
    }

    // =========================================================================
    // 4. QUICK SESSION & 24-HOUR 4-DIGIT PIN GENERATOR (`POST /dashboard/events/quick`)
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
                : 'Basecamp History Maker',
            'feedback_pin' => $pin,
            'pin_expires_at' => now()->addHours(24),
            'created_by' => $user?->id,
        ]);

        $targetRoute = str_contains((string) url()->previous(), '/events')
            ? 'events.index'
            : 'dashboard';

        return redirect()
            ->route($targetRoute)
            ->with('status', "Sesi \"{$event->title}\" berhasil dibuat dengan PIN aktif: {$pin} (berlaku 24 jam).");
    }

    // =========================================================================
    // 5. REGENERATE 4-DIGIT PIN (`POST /dashboard/events/{event}/regenerate-pin`)
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
    // 6. MANUALLY EXPIRE 4-DIGIT PIN (`POST /dashboard/events/{event}/expire-pin`)
    // =========================================================================

    /**
     * Manually expire an Event's 4-digit PIN immediately.
     */
    public function expirePin(Event $event): RedirectResponse
    {
        $event->update([
            'pin_expires_at' => now()->subMinute(),
        ]);

        return redirect()
            ->back()
            ->with('status', "PIN untuk \"{$event->title}\" telah dinonaktifkan (expired).");
    }

    // =========================================================================
    // 6. 1-CLICK FEEDBACK TRIAGE TOGGLE (`PATCH /dashboard/feedbacks/{feedback}/toggle-review`)
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
