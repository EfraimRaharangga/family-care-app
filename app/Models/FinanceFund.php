<?php

declare(strict_types=1);

/**
 * Purpose: Represents a virtual financial fund bucket (`Kas Rutin`, `Dana Diakonia & Kado`, `Dana Acara Khusus`).
 * Domain Context: Stewarded by the Vascular System (Treasurer). Tracks `cached_balance` in IDR
 *                 and links to immutable `Transaction` records.
 * Key Dependencies: `BelongsToCell`, `FundType`, `Transaction`.
 */

namespace App\Models;

use App\Enums\FundType;
use App\Models\Concerns\BelongsToCell;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FinanceFund extends Model
{
    use BelongsToCell;
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'cell_id',
        'name',
        'slug',
        'type',
        'description',
        'cached_balance',
        'is_active',
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
            'type' => FundType::class,
            'cached_balance' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Ledger transactions recorded against this virtual fund.
     *
     * @return HasMany<Transaction, $this>
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }
}
