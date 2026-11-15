<?php

declare(strict_types=1);

/**
 * Purpose: Seeds the complete Phase 0 foundational dataset for `FC R&D` (Family Care — History Maker).
 * Domain Context: Initializes the `FC R&D` cell tenant, Spatie RBAC roles & permissions
 *                 (`Part`, `Vital`, and all 5 `VitalOrgan` sub-roles), initial whitelisted
 *                 members, the 3 virtual funds (`Kas Rutin`, `Dana Diakonia & Kado`,
 *                 `Dana Acara Khusus`), 90-minute run sheet rosters, anonymous feedback,
 *                 and pastoral follow-up records.
 * Key Dependencies: `Spatie\Permission\PermissionRegistrar`, `LedgerBalanceService`, `GenerateEventPinAction`.
 */

namespace Database\Seeders;

use App\Actions\GenerateEventPinAction;
use App\Enums\EventStatus;
use App\Enums\EventType;
use App\Enums\FundType;
use App\Enums\UserTier;
use App\Enums\VitalOrgan;
use App\Models\Cell;
use App\Models\Event;
use App\Models\EventAttendance;
use App\Models\EventRoster;
use App\Models\Feedback;
use App\Models\FinanceFund;
use App\Models\PastoralFollowUp;
use App\Models\Scopes\CellScope;
use App\Models\User;
use App\Services\LedgerBalanceService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // =========================================================================
        // 1. SPATIE ROLES & PERMISSIONS (JOURNEY OF BELONGING & 5 VITAL ORGANS)
        // =========================================================================
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $allPermissionNames = collect(VitalOrgan::cases())
            ->flatMap(fn (VitalOrgan $organ): array => $organ->permissions())
            ->push('events.view', 'feedback.submit')
            ->unique()
            ->values();

        foreach ($allPermissionNames as $permissionName) {
            Permission::findOrCreate($permissionName, 'web');
        }

        // Base Tier Roles
        $partRole = Role::findOrCreate(UserTier::Part->spatieRoleName(), 'web');
        $partRole->syncPermissions(['events.view', 'feedback.submit']);

        $vitalRole = Role::findOrCreate(UserTier::Vital->spatieRoleName(), 'web');
        $vitalRole->syncPermissions(['events.view', 'feedback.submit']);

        // 5 Vital Organ Sub-Roles
        foreach (VitalOrgan::cases() as $organ) {
            $organRole = Role::findOrCreate($organ->spatieRoleName(), 'web');
            $organRole->syncPermissions($organ->permissions());
        }

        // =========================================================================
        // 2. PRIMARY CELL TENANT: FC R&D (FAMILY CARE — HISTORY MAKER)
        // =========================================================================
        $fcRndCell = Cell::query()->updateOrCreate(
            ['slug' => 'fc-rnd'],
            [
                'name' => 'FC R&D',
                'description' => 'Family Care — History Maker (R&D Cell Community). A warm, high-trust community growing through the Journey of Belonging.',
                'is_active' => true,
                'settings' => [
                    'organization' => 'History Maker',
                    'meeting_day' => 'Friday',
                    'meeting_time' => '19:00',
                    'target_duration_minutes' => 90,
                    'currency' => 'IDR',
                ],
            ]
        );

        CellScope::setCurrentCellId($fcRndCell->id);

        // =========================================================================
        // 3. WHITELISTED MEMBERS (5 VITAL ORGANS + PART MEMBERS)
        // =========================================================================
        $defaultPassword = Hash::make('password');

        $vitalRosterSpecs = [
            [
                'name' => 'Efraim Pratama',
                'email' => 'brain@fcrnd.local',
                'phone' => '+6281234560001',
                'birth_date' => '1999-04-12',
                'organ' => VitalOrgan::Brain,
            ],
            [
                'name' => 'Nadine Kusuma',
                'email' => 'lungs@fcrnd.local',
                'phone' => '+6281234560002',
                'birth_date' => '2000-08-24',
                'organ' => VitalOrgan::Lungs,
            ],
            [
                'name' => 'Joshua Wijaya',
                'email' => 'hospitality@fcrnd.local',
                'phone' => '+6281234560003',
                'birth_date' => '2001-01-19',
                'organ' => VitalOrgan::HandsAndFeet,
            ],
            [
                'name' => 'Clara Halim',
                'email' => 'treasurer@fcrnd.local',
                'phone' => '+6281234560004',
                'birth_date' => '2000-11-05',
                'organ' => VitalOrgan::VascularSystem,
            ],
            [
                'name' => 'Kevin Santoso',
                'email' => 'it@fcrnd.local',
                'phone' => '+6281234560005',
                'birth_date' => '2001-06-30',
                'organ' => VitalOrgan::NervousSystem,
            ],
        ];

        /** @var array<string, User> $vitalUsers */
        $vitalUsers = [];

        foreach ($vitalRosterSpecs as $spec) {
            /** @var User $user */
            $user = User::query()->updateOrCreate(
                ['email' => $spec['email']],
                [
                    'cell_id' => $fcRndCell->id,
                    'name' => $spec['name'],
                    'phone' => $spec['phone'],
                    'birth_date' => $spec['birth_date'],
                    'tier' => UserTier::Vital,
                    'vital_organ' => $spec['organ'],
                    'is_whitelisted' => true,
                    'is_active' => true,
                    'email_verified_at' => now(),
                    'password' => $defaultPassword,
                ]
            );
            $user->syncTierAndOrganRoles();
            $vitalUsers[$spec['organ']->value] = $user;
        }

        $partRosterSpecs = [
            ['name' => 'Daniel Setiawan', 'email' => 'daniel.part@fcrnd.local', 'birth_date' => '2002-02-14'],
            ['name' => 'Grace Tanoto', 'email' => 'grace.part@fcrnd.local', 'birth_date' => '2002-07-09'],
            ['name' => 'Samuel Gunawan', 'email' => 'samuel.part@fcrnd.local', 'birth_date' => '2001-12-03'],
            ['name' => 'kezia.part@fcrnd.local' === 'kezia.part@fcrnd.local' ? 'Kezia Putri' : 'Kezia', 'email' => 'kezia.part@fcrnd.local', 'birth_date' => '2003-03-21'],
            ['name' => 'Michael Hendrawan', 'email' => 'michael.part@fcrnd.local', 'birth_date' => '2002-09-17'],
        ];

        /** @var list<User> $partUsers */
        $partUsers = [];
        foreach ($partRosterSpecs as $index => $spec) {
            /** @var User $user */
            $user = User::query()->updateOrCreate(
                ['email' => $spec['email']],
                [
                    'cell_id' => $fcRndCell->id,
                    'name' => $spec['name'],
                    'phone' => sprintf('+628123456010%d', $index + 1),
                    'birth_date' => $spec['birth_date'],
                    'tier' => UserTier::Part,
                    'vital_organ' => null,
                    'is_whitelisted' => true,
                    'is_active' => true,
                    'email_verified_at' => now(),
                    'password' => $defaultPassword,
                ]
            );
            $user->syncTierAndOrganRoles();
            $partUsers[] = $user;
        }

        // =========================================================================
        // 4. INITIAL VIRTUAL FUNDS & IMMUTABLE LEDGER TRANSACTIONS
        // =========================================================================
        $ledgerService = app(LedgerBalanceService::class);

        /** @var array<string, FinanceFund> $funds */
        $funds = [];
        foreach (FundType::cases() as $fundType) {
            $funds[$fundType->value] = FinanceFund::query()->updateOrCreate(
                [
                    'cell_id' => $fcRndCell->id,
                    'slug' => $fundType->defaultSlug(),
                ],
                [
                    'name' => $fundType->label(),
                    'type' => $fundType,
                    'description' => $fundType->description(),
                    'cached_balance' => 0.00,
                    'is_active' => true,
                ]
            );
        }

        // Seed initial ledger transactions if none exist yet
        if ($fcRndCell->transactions()->count() === 0) {
            $treasurer = $vitalUsers[VitalOrgan::VascularSystem->value];

            $ledgerService->recordTransaction([
                'cell_id' => $fcRndCell->id,
                'finance_fund_id' => $funds[FundType::Routine->value]->id,
                'recorded_by' => $treasurer->id,
                'direction' => 'in',
                'amount' => 1850000.00,
                'category' => 'Weekly Offering',
                'description' => 'Saldo Awal & Kolekte Bulanan Kas Rutin FC R&D',
                'transaction_date' => now()->subDays(10)->toDateString(),
                'reference_note' => 'BATCH-RND-001',
            ]);

            $ledgerService->recordTransaction([
                'cell_id' => $fcRndCell->id,
                'finance_fund_id' => $funds[FundType::Routine->value]->id,
                'recorded_by' => $treasurer->id,
                'direction' => 'out',
                'amount' => 325000.00,
                'category' => 'Fellowship Consumption',
                'description' => 'Konsumsi Fellowship & Air Mineral FC R&D',
                'transaction_date' => now()->subDays(7)->toDateString(),
                'reference_note' => 'EXP-RND-002',
            ]);

            $ledgerService->recordTransaction([
                'cell_id' => $fcRndCell->id,
                'finance_fund_id' => $funds[FundType::Diaconia->value]->id,
                'recorded_by' => $treasurer->id,
                'direction' => 'in',
                'amount' => 1400000.00,
                'category' => 'Diaconate Seed',
                'description' => 'Alokasi Dana Kasih, Ulang Tahun & Kunjungan Anggota',
                'transaction_date' => now()->subDays(9)->toDateString(),
                'reference_note' => 'DIA-RND-001',
            ]);

            $ledgerService->recordTransaction([
                'cell_id' => $fcRndCell->id,
                'finance_fund_id' => $funds[FundType::SpecialEvent->value]->id,
                'recorded_by' => $treasurer->id,
                'direction' => 'in',
                'amount' => 2750000.00,
                'category' => 'Special Event Fund',
                'description' => 'Tabungan Retreat & Malam Keakraban History Maker FC R&D',
                'transaction_date' => now()->subDays(5)->toDateString(),
                'reference_note' => 'SPC-RND-001',
            ]);
        }

        // =========================================================================
        // 5. EVENTS, 90-MINUTE RUN SHEET ROSTERS, FEEDBACK & PASTORAL FOLLOW-UPS
        // =========================================================================
        $pinAction = app(GenerateEventPinAction::class);
        $brainUser = $vitalUsers[VitalOrgan::Brain->value];
        $lungsUser = $vitalUsers[VitalOrgan::Lungs->value];
        $hospitalityUser = $vitalUsers[VitalOrgan::HandsAndFeet->value];
        $itUser = $vitalUsers[VitalOrgan::NervousSystem->value];

        $completedEvent = Event::query()->updateOrCreate(
            [
                'cell_id' => $fcRndCell->id,
                'title' => 'FC R&D Gathering #14: Architecture of Belonging',
            ],
            [
                'type' => EventType::CellGathering,
                'status' => EventStatus::Completed,
                'scheduled_at' => now()->subDays(3)->setTime(19, 0),
                'duration_minutes' => 90,
                'location' => 'Basecamp History Maker — Ruang R&D Lt. 2',
                'feedback_pin' => 'FCRND7',
                'notes' => '90-minute gathering focused on organ stewardship and welcoming new members.',
                'created_by' => $brainUser->id,
            ]
        );

        Event::query()->updateOrCreate(
            [
                'cell_id' => $fcRndCell->id,
                'title' => 'FC R&D Gathering #15: Rhythm of Grace',
            ],
            [
                'type' => EventType::CellGathering,
                'status' => EventStatus::Upcoming,
                'scheduled_at' => now()->addDays(4)->setTime(19, 0),
                'duration_minutes' => 90,
                'location' => 'Basecamp History Maker — Ruang R&D Lt. 2',
                'feedback_pin' => $pinAction->execute(),
                'notes' => 'Upcoming Friday cell gathering with 90-minute synchronized run sheet.',
                'created_by' => $lungsUser->id,
            ]
        );

        // Seed 90-Minute Run Sheet segments (15 + 20 + 40 + 15 = 90 minutes)
        if ($completedEvent->rosters()->count() === 0) {
            $runSheetSegments = [
                [
                    'user_id' => $hospitalityUser->id,
                    'role_name' => 'Hands & Feet — Welcome & Icebreaker',
                    'segment_title' => 'Warm Check-In & Table Connection Game',
                    'duration_minutes' => 15,
                    'sort_order' => 1,
                ],
                [
                    'user_id' => $lungsUser->id,
                    'role_name' => 'Lungs — Worship & Flow Lead',
                    'segment_title' => 'Acoustic Worship & Centering Prayer',
                    'duration_minutes' => 20,
                    'sort_order' => 2,
                ],
                [
                    'user_id' => $brainUser->id,
                    'role_name' => 'Brain — Word & Interactive Sharing',
                    'segment_title' => 'Interactive Discussion: Every Organ Matters',
                    'duration_minutes' => 40,
                    'sort_order' => 3,
                ],
                [
                    'user_id' => $itUser->id,
                    'role_name' => 'Nervous System & Vascular — Care & Feedback PIN',
                    'segment_title' => 'Birthday Blessing, Diaconia Update & Live Anonymous PIN (FCRND7)',
                    'duration_minutes' => 15,
                    'sort_order' => 4,
                ],
            ];

            foreach ($runSheetSegments as $segment) {
                EventRoster::query()->create(array_merge($segment, [
                    'cell_id' => $fcRndCell->id,
                    'event_id' => $completedEvent->id,
                ]));
            }
        }

        // Seed 100% Anonymous Feedbacks (zero user_id or IP stored)
        if ($completedEvent->feedbacks()->count() === 0) {
            Feedback::query()->create([
                'cell_id' => $fcRndCell->id,
                'event_id' => $completedEvent->id,
                'rating' => 5,
                'mood_score' => 5,
                'highlights' => 'Alur 90 menit sangat tepat waktu dan diskusi kelompok terasa hangat tanpa menghakimi.',
                'improvements' => 'Sediakan air hangat tambahan untuk sesi malam.',
                'prayer_or_suggestion' => 'Doakan persiapan ujian akhir dan pekerjaan anggota baru minggu depan.',
            ]);

            Feedback::query()->create([
                'cell_id' => $fcRndCell->id,
                'event_id' => $completedEvent->id,
                'rating' => 5,
                'mood_score' => 4,
                'highlights' => 'Icebreaker dari tim Hands & Feet langsung mencairkan suasana anggota baru.',
                'improvements' => 'Volume gitar saat awal worship bisa sedikit lebih lembut.',
                'prayer_or_suggestion' => 'Terima kasih untuk transparansi laporan Kas Rutin dan Diakonia.',
            ]);
        }

        // Seed Attendance & Shepherd Radar Follow-Up
        foreach (array_merge(array_values($vitalUsers), $partUsers) as $idx => $member) {
            $status = ($idx === 8) ? 'absent' : 'present';
            EventAttendance::query()->updateOrCreate(
                [
                    'event_id' => $completedEvent->id,
                    'user_id' => $member->id,
                ],
                [
                    'cell_id' => $fcRndCell->id,
                    'status' => $status,
                    'checked_in_at' => $status === 'present' ? $completedEvent->scheduled_at : null,
                    'notes' => $status === 'absent' ? 'Out of town for family matter — scheduled for hospitality check-in' : null,
                ]
            );
        }

        if ($fcRndCell->pastoralFollowUps()->count() === 0 && isset($partUsers[3])) {
            PastoralFollowUp::query()->create([
                'cell_id' => $fcRndCell->id,
                'member_id' => $partUsers[3]->id,
                'assigned_to' => $hospitalityUser->id,
                'triggered_by_event_id' => $completedEvent->id,
                'reason' => 'Missed Gathering #14 — Send warm coffee check-in & prayer note',
                'status' => 'in_progress',
                'notes' => 'Hands & Feet team reached out via WhatsApp; scheduling mid-week catch-up.',
            ]);
        }
    }
}
