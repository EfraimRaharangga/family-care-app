<?php

declare(strict_types=1);

/**
 * Purpose: Thin Inertia controller serving the Phase 0 System Health & Codecademy Design Showcase.
 * Domain Context: Verifies live MySQL 8 connectivity, Soft Multi-Tenancy (`cell_id`),
 *                 Spatie RBAC roles/permissions, Spatie Activitylog audit entries, and
 *                 demonstrates the reverse-engineered Codecademy Gamut UI components.
 * Key Dependencies: `Inertia\Inertia`, `ShepherdRadarService`, `Cell`, `VitalOrgan`.
 */

namespace App\Http\Controllers;

use App\Enums\VitalOrgan;
use App\Models\Cell;
use App\Models\Event;
use App\Models\EventRoster;
use App\Models\Feedback;
use App\Models\FinanceFund;
use App\Models\Scopes\CellScope;
use App\Models\User;
use App\Services\ShepherdRadarService;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class DesignSystemShowcaseController extends Controller
{
    /**
     * Render the Phase 0 System Health & Design System Showcase at `/` and `/design-system`.
     */
    public function __invoke(ShepherdRadarService $shepherdRadarService): Response
    {
        /** @var Cell|null $cell */
        $cell = Cell::query()->where('slug', 'fc-rnd')->first()
            ?? Cell::query()->first();

        $cellId = $cell?->id ?? 1;
        CellScope::setCurrentCellId($cellId);

        // =========================================================================
        // 1. VITAL ORGANS ROSTER & RBAC MAPPING
        // =========================================================================
        $vitalUsersByOrgan = User::query()
            ->forCell($cellId)
            ->whereNotNull('vital_organ')
            ->get()
            ->keyBy(fn (User $user): string => $user->vital_organ?->value ?? '');

        $vitalOrgans = array_map(function (VitalOrgan $organ) use ($vitalUsersByOrgan): array {
            /** @var User|null $steward */
            $steward = $vitalUsersByOrgan->get($organ->value);

            return [
                'value' => $organ->value,
                'label' => $organ->label(),
                'team_name' => $organ->teamName(),
                'emoji' => $organ->emoji(),
                'description' => $organ->description(),
                'spatie_role' => $organ->spatieRoleName(),
                'permissions' => $organ->permissions(),
                'surface_hex' => $organ->surfaceHex(),
                'accent_hex' => $organ->accentHex(),
                'steward_name' => $steward?->name,
                'steward_email' => $steward?->email,
            ];
        }, VitalOrgan::cases());

        // =========================================================================
        // 2. VIRTUAL FUNDS (VASCULAR SYSTEM)
        // =========================================================================
        $funds = FinanceFund::query()
            ->forCell($cellId)
            ->withCount('transactions')
            ->orderBy('id')
            ->get()
            ->map(fn (FinanceFund $fund): array => [
                'id' => $fund->id,
                'name' => $fund->name,
                'slug' => $fund->slug,
                'type' => $fund->type->value,
                'description' => $fund->description,
                'cached_balance' => (float) $fund->cached_balance,
                'banner_hex' => $fund->type->bannerHex(),
                'transactions_count' => (int) $fund->transactions_count,
            ])
            ->values()
            ->all();

        // =========================================================================
        // 3. SAMPLE 90-MINUTE EVENT & RUN SHEET (LUNGS & NERVOUS SYSTEM)
        // =========================================================================
        /** @var Event|null $featuredEvent */
        $featuredEvent = Event::query()
            ->forCell($cellId)
            ->with(['rosters.servant'])
            ->withCount('feedbacks')
            ->withAvg('feedbacks', 'rating')
            ->orderBy('id')
            ->first();

        $eventData = null;
        if ($featuredEvent !== null) {
            $eventData = [
                'id' => $featuredEvent->id,
                'title' => $featuredEvent->title,
                'type' => $featuredEvent->type->value,
                'type_label' => $featuredEvent->type->label(),
                'status' => $featuredEvent->status->value,
                'status_label' => $featuredEvent->status->label(),
                'scheduled_at' => $featuredEvent->scheduled_at->toIso8601String(),
                'duration_minutes' => $featuredEvent->duration_minutes,
                'location' => $featuredEvent->location,
                'feedback_pin' => $featuredEvent->feedback_pin,
                'feedbacks_count' => (int) $featuredEvent->feedbacks_count,
                'average_rating' => $featuredEvent->feedbacks_avg_rating !== null
                    ? round((float) $featuredEvent->feedbacks_avg_rating, 1)
                    : null,
                'rosters' => $featuredEvent->rosters->map(fn (EventRoster $roster): array => [
                    'id' => $roster->id,
                    'role_name' => $roster->role_name,
                    'segment_title' => $roster->segment_title,
                    'duration_minutes' => $roster->duration_minutes,
                    'sort_order' => $roster->sort_order,
                    'servant_name' => $roster->servant?->name,
                    'servant_organ' => $roster->servant?->vital_organ?->value,
                ])->values()->all(),
            ];
        }

        // =========================================================================
        // 4. SYSTEM HEALTH & CPANEL READINESS METRICS
        // =========================================================================
        $dbConnected = false;
        $dbName = (string) config('database.connections.' . config('database.default') . '.database');
        try {
            DB::connection()->getPdo();
            $dbConnected = true;
        } catch (\Throwable) {
            $dbConnected = false;
        }

        $totalFundsBalance = array_reduce(
            $funds,
            fn (float $carry, array $item): float => $carry + (float) $item['cached_balance'],
            0.0
        );

        return Inertia::render('DesignSystemShowcase', [
            'cell' => $cell ? [
                'id' => $cell->id,
                'name' => $cell->name,
                'slug' => $cell->slug,
                'description' => $cell->description,
                'is_active' => $cell->is_active,
                'settings' => $cell->settings,
            ] : null,
            'shepherdRadar' => $shepherdRadarService->getCellHealthSummary($cellId),
            'vitalOrgans' => $vitalOrgans,
            'funds' => $funds,
            'featuredEvent' => $eventData,
            'health' => [
                'php_version' => PHP_VERSION,
                'laravel_version' => Application::VERSION,
                'database_driver' => (string) config('database.default'),
                'database_connected' => $dbConnected,
                'database_name' => $dbName,
                'session_driver' => (string) config('session.driver'),
                'cache_driver' => (string) config('cache.default'),
                'queue_driver' => (string) config('queue.default'),
                'spatie_roles_count' => Role::query()->count(),
                'spatie_permissions_count' => Permission::query()->count(),
                'activity_logs_count' => Activity::query()->count(),
                'anonymous_feedbacks_count' => Feedback::query()->forCell($cellId)->count(),
                'total_funds_balance_idr' => $totalFundsBalance,
            ],
        ]);
    }
}
