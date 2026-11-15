<?php

declare(strict_types=1);

/**
 * Purpose: Seeds the complete Phase 0 & Phase 1 dataset for `FC R&D` (Family Care — History Maker).
 * Domain Context: Initializes the `FC R&D` cell tenant, Spatie RBAC roles & permissions
 *                 (`Part`, `Vital`, and all 5 `VitalOrgan` sub-roles), initial whitelisted
 *                 members, the 3 virtual funds (`Kas Rutin`, `Dana Diakonia & Kado`,
 *                 `Dana Acara Khusus`), 90-minute run sheet rosters, multi-session events
 *                 with active 4-digit PIN (`2408`), and 100% anonymous feedbacks.
 * Key Dependencies: `Spatie\Permission\PermissionRegistrar`, `LedgerBalanceService`, `GenerateEventPinAction`.
 */

namespace Database\Seeders;

use App\Actions\GenerateEventPinAction;
use App\Enums\EventStatus;
use App\Enums\EventType;
use App\Enums\FeedbackCategory;
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
        $vitalRole->syncPermissions([
            'events.view',
            'feedback.submit',
            'feedback.manage_pins',
            'feedback.view_analytics',
        ]);

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
            ['name' => 'Kezia Putri', 'email' => 'kezia.part@fcrnd.local', 'birth_date' => '2003-03-21'],
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
        // 5. EVENTS, 4-DIGIT PIN SESSIONS & 100% ANONYMOUS FEEDBACKS
        // =========================================================================
        $pinAction = app(GenerateEventPinAction::class);
        $brainUser = $vitalUsers[VitalOrgan::Brain->value];
        $lungsUser = $vitalUsers[VitalOrgan::Lungs->value];
        $hospitalityUser = $vitalUsers[VitalOrgan::HandsAndFeet->value];
        $itUser = $vitalUsers[VitalOrgan::NervousSystem->value];

        $event12 = Event::query()->updateOrCreate(
            [
                'cell_id' => $fcRndCell->id,
                'title' => 'Cerita Nabi-Nabi: Kesetiaan Elia di Gunung Karmel',
            ],
            [
                'type' => EventType::CeritaNabiNabi,
                'status' => EventStatus::Completed,
                'scheduled_at' => now()->subDays(21)->setTime(19, 0),
                'duration_minutes' => 90,
                'location' => 'Basecamp History Maker — Ruang R&D Lt. 2',
                'feedback_pin' => '1842',
                'pin_expires_at' => now()->subDays(20),
                'notes' => 'Diskusi naratif Perjanjian Lama dan refleksi iman praktis.',
                'created_by' => $brainUser->id,
            ]
        );

        $event13 = Event::query()->updateOrCreate(
            [
                'cell_id' => $fcRndCell->id,
                'title' => 'Tend Maker Night: Faith & Career Excellence',
            ],
            [
                'type' => EventType::TendMaker,
                'status' => EventStatus::Completed,
                'scheduled_at' => now()->subDays(14)->setTime(19, 0),
                'duration_minutes' => 90,
                'location' => 'Basecamp History Maker — Ruang R&D Lt. 2',
                'feedback_pin' => '3910',
                'pin_expires_at' => now()->subDays(13),
                'notes' => 'Sharing praktis panggilan di dunia kampus dan profesional.',
                'created_by' => $lungsUser->id,
            ]
        );

        $event14 = Event::query()->updateOrCreate(
            [
                'cell_id' => $fcRndCell->id,
                'title' => 'Meet FC 5: Vision Night & Table Fellowship',
            ],
            [
                'type' => EventType::MeetFc5,
                'status' => EventStatus::Completed,
                'scheduled_at' => now()->subDays(7)->setTime(19, 0),
                'duration_minutes' => 120,
                'location' => 'Main Hall History Maker',
                'feedback_pin' => '7504',
                'pin_expires_at' => now()->subDays(6),
                'notes' => 'Malam keakraban lintas komsel dan penyelarasan visi.',
                'created_by' => $brainUser->id,
            ]
        );

        // Active Today's Session with live 24-hour 4-Digit PIN (`2408`)
        $activeEvent = Event::query()->updateOrCreate(
            [
                'cell_id' => $fcRndCell->id,
                'title' => 'FC R&D Gathering #15: Architecture of Belonging',
            ],
            [
                'type' => EventType::Regular,
                'status' => EventStatus::Ongoing,
                'scheduled_at' => now()->setTime(19, 0),
                'duration_minutes' => 90,
                'location' => 'Basecamp History Maker — Ruang R&D Lt. 2',
                'feedback_pin' => '2408',
                'pin_expires_at' => now()->addHours(24),
                'notes' => '90-minute gathering focused on organ stewardship and welcoming new members.',
                'created_by' => $itUser->id,
            ]
        );

        // Ensure `pinAction` is referenced and functional
        if (empty($activeEvent->feedback_pin)) {
            $activeEvent->update(['feedback_pin' => $pinAction->execute()]);
        }

        // Seed 90-Minute Run Sheet segments on the active event
        if ($activeEvent->rosters()->count() === 0) {
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
                    'segment_title' => 'Birthday Blessing, Diaconia Update & Live Anonymous PIN (2408)',
                    'duration_minutes' => 15,
                    'sort_order' => 4,
                ],
            ];

            foreach ($runSheetSegments as $segment) {
                EventRoster::query()->create(array_merge($segment, [
                    'cell_id' => $fcRndCell->id,
                    'event_id' => $activeEvent->id,
                ]));
            }
        }

        // Seed 100% Anonymous Feedbacks across events (zero user_id or IP stored)
        if (Feedback::query()->forCell($fcRndCell->id)->count() === 0) {
            $sampleFeedbacks = [
                [
                    'event_id' => $event12->id,
                    'rating' => 4,
                    'category' => FeedbackCategory::Materi,
                    'message' => 'Pembahasan latar belakang sejarah Elia sangat membuka wawasan, diskusi kelompok berjalan hidup.',
                    'needs_pastoral_care' => false,
                    'contact_name' => null,
                    'contact_info' => null,
                    'is_reviewed' => true,
                ],
                [
                    'event_id' => $event12->id,
                    'rating' => 5,
                    'category' => FeedbackCategory::Hospitality,
                    'message' => 'Suasana ruang R&D sangat nyaman dan sambutan tim Hands & Feet hangat sekali.',
                    'needs_pastoral_care' => false,
                    'contact_name' => null,
                    'contact_info' => null,
                    'is_reviewed' => true,
                ],
                [
                    'event_id' => $event13->id,
                    'rating' => 5,
                    'category' => FeedbackCategory::Materi,
                    'message' => 'Topik Tend Maker sangat relevan dengan pergumulan skripsi dan magang kami saat ini.',
                    'needs_pastoral_care' => true,
                    'contact_name' => 'Raka (Anggota Baru)',
                    'contact_info' => 'WA: 0812-9988-7766',
                    'is_reviewed' => true,
                ],
                [
                    'event_id' => $event14->id,
                    'rating' => 4,
                    'category' => FeedbackCategory::AcaraGames,
                    'message' => 'Games pembuka seru dan mencairkan suasana, namun transisi ke sesi sharing bisa sedikit dipercepat.',
                    'needs_pastoral_care' => false,
                    'contact_name' => null,
                    'contact_info' => null,
                    'is_reviewed' => true,
                ],
                [
                    'event_id' => $activeEvent->id,
                    'rating' => 5,
                    'category' => FeedbackCategory::Materi,
                    'message' => 'Alur 90 menit sangat tepat waktu dan pembagian 5 organ tubuh Kristus membuat setiap anggota merasa punya peran.',
                    'needs_pastoral_care' => false,
                    'contact_name' => null,
                    'contact_info' => null,
                    'is_reviewed' => false,
                ],
                [
                    'event_id' => $activeEvent->id,
                    'rating' => 5,
                    'category' => FeedbackCategory::Hospitality,
                    'message' => 'Terima kasih untuk sambutan hangat malam ini. Saya ingin didoakan untuk pemulihan kesehatan orang tua minggu ini.',
                    'needs_pastoral_care' => true,
                    'contact_name' => 'Tasya',
                    'contact_info' => 'IG: @tasyaputri / WA: 0813-4455-6677',
                    'is_reviewed' => false,
                ],
                [
                    'event_id' => $activeEvent->id,
                    'rating' => 4,
                    'category' => FeedbackCategory::Lainnya,
                    'message' => 'Usul agar lirik lagu worship juga dibagikan lewat grup WA sebelum acara dimulai.',
                    'needs_pastoral_care' => false,
                    'contact_name' => null,
                    'contact_info' => null,
                    'is_reviewed' => false,
                ],
            ];

            foreach ($sampleFeedbacks as $feedbackData) {
                Feedback::query()->create(array_merge($feedbackData, [
                    'cell_id' => $fcRndCell->id,
                ]));
            }
        }

        // Seed Attendance & Shepherd Radar Follow-Up
        foreach (array_merge(array_values($vitalUsers), $partUsers) as $idx => $member) {
            $status = ($idx === 8) ? 'absent' : 'present';
            EventAttendance::query()->updateOrCreate(
                [
                    'event_id' => $activeEvent->id,
                    'user_id' => $member->id,
                ],
                [
                    'cell_id' => $fcRndCell->id,
                    'status' => $status,
                    'checked_in_at' => $status === 'present' ? $activeEvent->scheduled_at : null,
                    'notes' => $status === 'absent' ? 'Out of town for family matter — scheduled for hospitality check-in' : null,
                ]
            );
        }

        if ($fcRndCell->pastoralFollowUps()->count() === 0 && isset($partUsers[3])) {
            PastoralFollowUp::query()->create([
                'cell_id' => $fcRndCell->id,
                'member_id' => $partUsers[3]->id,
                'assigned_to' => $hospitalityUser->id,
                'triggered_by_event_id' => $activeEvent->id,
                'reason' => 'Missed Gathering #15 — Send warm coffee check-in & prayer note',
                'status' => 'in_progress',
                'notes' => 'Hands & Feet team reached out via WhatsApp; scheduling mid-week catch-up.',
            ]);
        }
    }
}
