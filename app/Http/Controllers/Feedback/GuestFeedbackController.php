<?php

declare(strict_types=1);

/**
 * Purpose: Handles the Public Guest Flow (`/feedback`) for 100% Anonymous Member Feedback.
 * Domain Context: Stewarded by the Nervous System (IT Team).
 *                 1. Verifies the daily 4-digit numeric PIN against active `events` (`pin_expires_at > now()`).
 *                 2. Unlocks the mobile-first feedback form via URL query parameter (`/feedback?pin=XXXX`).
 *                 3. Stores anonymous feedback in `feedbacks` with ZERO `user_id`, IP, or fingerprint logging,
 *                    and without writing to `pastoral_follow_ups` (reserved for Phase 4).
 * Key Dependencies: `VerifyFeedbackPinRequest`, `StoreAnonymousFeedbackRequest`, `Event`, `Feedback`.
 */

namespace App\Http\Controllers\Feedback;

use App\Enums\FeedbackCategory;
use App\Http\Controllers\Controller;
use App\Http\Requests\Feedback\StoreAnonymousFeedbackRequest;
use App\Http\Requests\Feedback\VerifyFeedbackPinRequest;
use App\Models\Event;
use App\Models\Feedback;
use App\Models\Scopes\CellScope;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class GuestFeedbackController extends Controller
{
    // =========================================================================
    // 1. PUBLIC PIN GATE & FEEDBACK FORM VIEW (`GET /feedback`)
    // =========================================================================

    /**
     * Render the public `/feedback` portal.
     * When `?pin=XXXX` is present in the query string, validates it against active events
     * and unlocks the locked Event Header + Anonymous Feedback Form.
     */
    public function index(Request $request): Response
    {
        $rawPin = trim((string) $request->query('pin', ''));
        $submitted = $request->boolean('submitted');

        $verifiedEventPayload = null;
        $pinError = null;

        if ($rawPin !== '') {
            if (! preg_match('/^\d{4}$/', $rawPin)) {
                $pinError = 'Format PIN harus terdiri dari 4 digit angka (contoh: 2408).';
            } else {
                $event = Event::withoutGlobalScope(CellScope::class)
                    ->with('cell')
                    ->where('feedback_pin', $rawPin)
                    ->first();

                if ($event === null) {
                    $pinError = 'Kode PIN tidak ditemukan. Pastikan 4 digit PIN sesuai dengan yang dibagikan pengurus.';
                } elseif (! $event->isPinActive()) {
                    $pinError = 'Masa aktif PIN untuk sesi acara ini telah berakhir (lebih dari 24 jam).';
                } else {
                    $verifiedEventPayload = [
                        'id' => $event->id,
                        'cell_name' => $event->cell?->name ?? 'FC R&D',
                        'title' => $event->title,
                        'type' => $event->type->value,
                        'type_label' => $event->type->label(),
                        'scheduled_at' => $event->scheduled_at->toIso8601String(),
                        'event_date_formatted' => $event->scheduled_at->translatedFormat('d M Y · H:i') . ' WIB',
                        'feedback_pin' => $event->feedback_pin,
                        'pin_expires_at' => $event->pin_expires_at?->toIso8601String(),
                    ];
                }
            }
        }

        return Inertia::render('Feedback/GuestPortal', [
            'pinQuery' => $rawPin,
            'pinError' => $pinError,
            'verifiedEvent' => $verifiedEventPayload,
            'categories' => FeedbackCategory::options(),
            'submitted' => $submitted,
            'flashSuccess' => $request->session()->get('feedback_submitted_message'),
        ]);
    }

    // =========================================================================
    // 2. DAILY 4-DIGIT PIN VERIFICATION (`POST /feedback/verify-pin`)
    // =========================================================================

    /**
     * Validate a submitted 4-digit PIN and redirect cleanly to `/feedback?pin=XXXX`.
     *
     * @throws ValidationException
     */
    public function verifyPin(VerifyFeedbackPinRequest $request): RedirectResponse
    {
        $pin = (string) $request->validated('pin');

        $event = Event::withoutGlobalScope(CellScope::class)
            ->where('feedback_pin', $pin)
            ->first();

        if ($event === null) {
            throw ValidationException::withMessages([
                'pin' => 'Kode PIN tidak ditemukan. Pastikan 4 digit PIN sesuai dengan yang dibagikan pengurus.',
            ]);
        }

        if (! $event->isPinActive()) {
            throw ValidationException::withMessages([
                'pin' => 'Masa aktif PIN untuk sesi acara ini telah berakhir (lebih dari 24 jam).',
            ]);
        }

        return redirect()->route('feedback.index', ['pin' => $event->feedback_pin]);
    }

    // =========================================================================
    // 3. ANONYMOUS FEEDBACK SUBMISSION (`POST /feedback`)
    // =========================================================================

    /**
     * Persist a 100% anonymous feedback entry linked only to `cell_id` and `event_id`.
     *
     * CRITICAL GUARDRAIL:
     * - Never records `user_id`, IP address, user agent, or browser fingerprints.
     * - Stores optional `contact_name` and `contact_info` ONLY inside `feedbacks` when
     *   `needs_pastoral_care` is true. Does NOT create `pastoral_follow_ups` records in Phase 1.
     *
     * @throws ValidationException
     */
    public function store(StoreAnonymousFeedbackRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $pin = (string) $validated['pin'];

        $event = Event::withoutGlobalScope(CellScope::class)
            ->where('feedback_pin', $pin)
            ->first();

        if ($event === null || ! $event->isPinActive()) {
            throw ValidationException::withMessages([
                'pin' => 'Sesi PIN acara tidak ditemukan atau masa aktifnya (24 jam) telah berakhir.',
            ]);
        }

        $needsPastoralCare = (bool) ($validated['needs_pastoral_care'] ?? false);

        // Enforce strict privacy: strip contact fields if pastoral care toggle is unchecked
        $contactName = $needsPastoralCare && ! empty($validated['contact_name'])
            ? trim((string) $validated['contact_name'])
            : null;

        $contactInfo = $needsPastoralCare && ! empty($validated['contact_info'])
            ? trim((string) $validated['contact_info'])
            : null;

        Feedback::withoutGlobalScope(CellScope::class)->create([
            'cell_id' => $event->cell_id,
            'event_id' => $event->id,
            'rating' => (int) $validated['rating'],
            'category' => FeedbackCategory::from((string) $validated['category']),
            'message' => trim((string) $validated['message']),
            'needs_pastoral_care' => $needsPastoralCare,
            'contact_name' => $contactName,
            'contact_info' => $contactInfo,
            'is_reviewed' => false,
        ]);

        return redirect()
            ->route('feedback.index', [
                'pin' => $event->feedback_pin,
                'submitted' => 1,
            ])
            ->with('feedback_submitted_message', 'Terima kasih! Masukan anonim Anda telah tersimpan dengan aman.');
    }
}
