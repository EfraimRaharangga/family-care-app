<?php

declare(strict_types=1);

/**
 * Purpose: Computes pastoral health metrics and absence alerts for FC members.
 * Domain Context: Powers the "Shepherd Radar" used by the Brain (Leader) and
 *                 Hands & Feet (Hospitality Team) to care for absent members proactively.
 * Key Dependencies: `App\Models\User`, `App\Models\EventAttendance`, `App\Models\PastoralFollowUp`.
 */

namespace App\Services;

use App\Enums\UserTier;
use App\Models\EventAttendance;
use App\Models\PastoralFollowUp;
use App\Models\User;

class ShepherdRadarService
{
    /**
     * Summarizes cell health metrics for the given `cell_id`.
     *
     * @return array{
     *     total_members: int,
     *     vital_count: int,
     *     part_count: int,
     *     attendance_rate_percent: float,
     *     open_follow_ups_count: int
     * }
     */
    public function getCellHealthSummary(int $cellId): array
    {
        $members = User::query()->forCell($cellId)->where('is_active', true)->get();
        $vitalCount = $members->where('tier', UserTier::Vital)->count();
        $partCount = $members->where('tier', UserTier::Part)->count();

        $totalAttendanceRecords = EventAttendance::query()->forCell($cellId)->count();
        $presentRecords = EventAttendance::query()
            ->forCell($cellId)
            ->where('status', 'present')
            ->count();

        $attendanceRate = $totalAttendanceRecords > 0
            ? round(($presentRecords / $totalAttendanceRecords) * 100, 1)
            : 100.0;

        $openFollowUps = PastoralFollowUp::query()
            ->forCell($cellId)
            ->whereIn('status', ['pending', 'in_progress'])
            ->count();

        return [
            'total_members' => $members->count(),
            'vital_count' => $vitalCount,
            'part_count' => $partCount,
            'attendance_rate_percent' => $attendanceRate,
            'open_follow_ups_count' => $openFollowUps,
        ];
    }
}
