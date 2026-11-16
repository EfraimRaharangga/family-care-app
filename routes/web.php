<?php

declare(strict_types=1);

/**
 * Purpose: Primary HTTP Web Routes for FC (Family Care — History Maker).
 * Domain Context:
 *   1. Root `/` redirects unauthenticated visitors to `/login` and authenticated leaders to `/dashboard`.
 *   2. Public `/feedback` exposes the mobile-first 4-digit PIN gate and 100% anonymous feedback engine.
 *   3. Protected `/dashboard` & `/feedback-analytics` routes enforce `auth` + `EnsureCellTenantContext`
 *      for Soft Multi-Tenancy (`cell_id` isolation).
 * Key Dependencies: `GuestFeedbackController`, `FeedbackDashboardController`, `EnsureCellTenantContext`.
 */

use App\Http\Controllers\Dashboard\FeedbackDashboardController;
use App\Http\Controllers\Feedback\GuestFeedbackController;
use App\Http\Middleware\EnsureCellTenantContext;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// =========================================================================
// 1. ROOT ENTRYPOINT (`/`)
// =========================================================================
Route::get('/', static function (Request $request) {
    if ($request->user() !== null) {
        return redirect()->route('dashboard');
    }

    return redirect()->route('login');
})->name('home');

// =========================================================================
// 2. PUBLIC GUEST FEEDBACK FLOW (`/feedback` — 100% ANONYMOUS)
// =========================================================================
Route::prefix('feedback')->name('feedback.')->group(function (): void {
    Route::get('/', [GuestFeedbackController::class, 'index'])->name('index');
    Route::post('/verify-pin', [GuestFeedbackController::class, 'verifyPin'])
        ->middleware('throttle:15,1')
        ->name('verify-pin');
    Route::post('/', [GuestFeedbackController::class, 'store'])
        ->middleware('throttle:20,1')
        ->name('store');
});

// =========================================================================
// 3. AUTHENTICATED LEADER & NERVOUS SYSTEM FLOW (`/dashboard`)
// =========================================================================
Route::middleware(['auth', EnsureCellTenantContext::class])->group(function (): void {
    Route::get('/dashboard', [FeedbackDashboardController::class, 'index'])->name('dashboard');
    Route::get('/feedback-analytics', [FeedbackDashboardController::class, 'index'])->name('feedback.analytics');
    Route::get('/feedback-data', [FeedbackDashboardController::class, 'feedbackData'])->name('feedback.data');
    Route::get('/events', [FeedbackDashboardController::class, 'events'])->name('events.index');

    Route::post('/dashboard/events/quick', [FeedbackDashboardController::class, 'storeQuickEvent'])
        ->name('dashboard.events.quick-store');

    Route::post('/dashboard/events/{event}/regenerate-pin', [FeedbackDashboardController::class, 'regeneratePin'])
        ->name('dashboard.events.regenerate-pin');

    Route::post('/dashboard/events/{event}/expire-pin', [FeedbackDashboardController::class, 'expirePin'])
        ->name('dashboard.events.expire-pin');

    Route::patch('/dashboard/feedbacks/{feedback}/toggle-review', [FeedbackDashboardController::class, 'toggleReview'])
        ->name('dashboard.feedbacks.toggle-review');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
