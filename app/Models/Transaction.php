<?php

declare(strict_types=1);

/**
 * Purpose: Represents an immutable financial ledger entry (`in` or `out`) in IDR.
 * Domain Context: Stewarded by the Vascular System (Treasurer).
 *                 CRITICAL ARCHITECTURAL GUARDRAIL: Enforces `SoftDeletes` and Spatie
 *                 `LogsActivity` so financial records are never permanently destroyed and
 *                 every change leaves an immutable audit trail.
 * Key Dependencies: `BelongsToCell`, `SoftDeletes`, `Spatie\Activitylog\Traits\LogsActivity`.
 */

namespace App\Models;

use App\Models\Concerns\BelongsToCell;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Transaction extends Model
{
    use BelongsToCell;
    use HasFactory;
    use LogsActivity;
    use SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'cell_id',
        'finance_fund_id',
        'event_id',
        'recorded_by',
        'direction',
        'amount',
        'category',
        'description',
        'transaction_date',
        'reference_note',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'cell_id' => 'integer',
            'finance_fund_id' => 'integer',
            'event_id' => 'integer',
            'recorded_by' => 'integer',
            'amount' => 'decimal:2',
            'transaction_date' => 'date',
        ];
    }

    /**
     * Configure Spatie Activitylog for immutable financial audit logging.
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('finance_ledger')
            ->logFillable()
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->setDescriptionForEvent(fn (string $eventName): string => "Financial transaction was {$eventName}");
    }

    // =========================================================================
    // DOMAIN RELATIONSHIPS
    // =========================================================================

    /**
     * Virtual fund bucket this transaction impacts.
     *
     * @return BelongsTo<FinanceFund, $this>
     */
    public function fund(): BelongsTo
    {
        return $this->belongsTo(FinanceFund::class, 'finance_fund_id');
    }

    /**
     * Optional gathering event associated with this transaction.
     *
     * @return BelongsTo<Event, $this>
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * The Vascular System (Treasurer) user who recorded this transaction.
     *
     * @return BelongsTo<User, $this>
     */
    public function recorder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
