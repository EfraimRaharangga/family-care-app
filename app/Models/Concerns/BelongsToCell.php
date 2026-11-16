<?php

declare(strict_types=1);

/**
 * Purpose: Reusable Eloquent trait connecting domain models to Soft Multi-Tenancy (`cell_id`).
 * Domain Context: Registers `CellScope`, automatically assigns `cell_id` on model creation,
 *                 and provides the `cell()` relationship + `forCell()` local scope.
 * Key Dependencies: `App\Models\Cell`, `App\Models\Scopes\CellScope`.
 */

namespace App\Models\Concerns;

use App\Models\Cell;
use App\Models\Scopes\CellScope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @mixin Model
 */
trait BelongsToCell
{
    /**
     * Boot the BelongsToCell trait for a model.
     */
    public static function bootBelongsToCell(): void
    {
        static::addGlobalScope(new CellScope());

        static::creating(function (Model $model): void {
            // Automatically populate cell_id from active tenant context if not explicitly supplied
            if (empty($model->getAttribute('cell_id'))) {
                $activeCellId = CellScope::resolveCurrentCellId();
                if ($activeCellId !== null) {
                    $model->setAttribute('cell_id', $activeCellId);
                }
            }
        });
    }

    /**
     * Relationship to the owning Cell group (`FC`).
     *
     * @return BelongsTo<Cell, $this>
     */
    public function cell(): BelongsTo
    {
        return $this->belongsTo(Cell::class);
    }

    /**
     * Scope a query to a specific cell_id (bypassing any other global cell filter).
     *
     * @param  Builder<static>  $query
     * @return Builder<static>
     */
    public function scopeForCell(Builder $query, int $cellId): Builder
    {
        return $query->withoutGlobalScope(CellScope::class)->where($this->qualifyColumn('cell_id'), $cellId);
    }
}
