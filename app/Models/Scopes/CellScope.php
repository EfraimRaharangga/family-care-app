<?php

declare(strict_types=1);

/**
 * Purpose: Eloquent Global Scope enforcing Soft Multi-Tenancy (`cell_id`) across queries.
 * Domain Context: Automatically scopes tenant-bound queries to the authenticated user's
 *                 `cell_id` (or explicit tenant context) so FC R&D data remains isolated
 *                 as History Maker scales to multiple cell groups.
 * Key Dependencies: `Illuminate\Database\Eloquent\Scope`, `Illuminate\Support\Facades\Auth`.
 */

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\Facades\Auth;

class CellScope implements Scope
{
    /**
     * Optional runtime override for CLI commands, seeders, or multi-cell admin tasks.
     */
    protected static ?int $currentCellId = null;

    /**
     * Explicitly sets the active tenant `cell_id` in memory.
     */
    public static function setCurrentCellId(?int $cellId): void
    {
        self::$currentCellId = $cellId;
    }

    /**
     * Resolves the active `cell_id` from runtime override or authenticated session.
     */
    public static function resolveCurrentCellId(): ?int
    {
        if (self::$currentCellId !== null) {
            return self::$currentCellId;
        }

        // Avoid recursive resolution on the User model itself before Auth is resolved
        if (Auth::hasUser()) {
            $user = Auth::user();

            return $user?->cell_id ? (int) $user->cell_id : null;
        }

        return null;
    }

    /**
     * Apply the scope to a given Eloquent query builder.
     */
    public function apply(Builder $builder, Model $model): void
    {
        $cellId = self::resolveCurrentCellId();

        if ($cellId !== null) {
            $builder->where($model->qualifyColumn('cell_id'), $cellId);
        }
    }
}
