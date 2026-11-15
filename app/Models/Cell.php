<?php

declare(strict_types=1);

/**
 * Purpose: Represents a History Maker Cell Group tenant (starting with `FC R&D`).
 * Domain Context: Root entity of the Soft Multi-Tenancy architecture. All members,
 *                 events, feedbacks, virtual funds, and pastoral records belong to a Cell.
 * Key Dependencies: User, Event, Feedback, FinanceFund, Transaction, PastoralFollowUp.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cell extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'slug',
        'description',
        'is_active',
        'settings',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'settings' => 'array',
        ];
    }

    // =========================================================================
    // DOMAIN RELATIONSHIPS
    // =========================================================================

    /**
     * All members belonging to this cell group.
     *
     * @return HasMany<User, $this>
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * All gatherings and events hosted by this cell group.
     *
     * @return HasMany<Event, $this>
     */
    public function events(): HasMany
    {
        return $this->hasMany(Event::class);
    }

    /**
     * Anonymous event feedback entries submitted under this cell group.
     *
     * @return HasMany<Feedback, $this>
     */
    public function feedbacks(): HasMany
    {
        return $this->hasMany(Feedback::class);
    }

    /**
     * Virtual financial funds stewarded by this cell group's Vascular System.
     *
     * @return HasMany<FinanceFund, $this>
     */
    public function financeFunds(): HasMany
    {
        return $this->hasMany(FinanceFund::class);
    }

    /**
     * All financial ledger transactions belonging to this cell group.
     *
     * @return HasMany<Transaction, $this>
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    /**
     * Pastoral follow-up tickets tracked for members of this cell group.
     *
     * @return HasMany<PastoralFollowUp, $this>
     */
    public function pastoralFollowUps(): HasMany
    {
        return $this->hasMany(PastoralFollowUp::class);
    }
}
