<?php

declare(strict_types=1);

/**
 * Purpose: Represents an FC Cell Member or Vital Core Servant.
 * Domain Context: Models the "Journey of Belonging" (`UserTier`: Part vs. Vital) and the
 *                 5 "Vital Organs" (`VitalOrgan`: Brain, Lungs, Hands & Feet, Vascular System,
 *                 Nervous System) alongside Google OAuth Whitelist access (`is_whitelisted`).
 * Key Dependencies: `Spatie\Permission\Traits\HasRoles`, `App\Enums\UserTier`, `App\Enums\VitalOrgan`.
 */

namespace App\Models;

use App\Enums\UserTier;
use App\Enums\VitalOrgan;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory;
    use HasRoles;
    use Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'cell_id',
        'name',
        'email',
        'google_id',
        'avatar',
        'phone',
        'birth_date',
        'tier',
        'vital_organ',
        'is_whitelisted',
        'is_active',
        'email_verified_at',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
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
            'birth_date' => 'date',
            'tier' => UserTier::class,
            'vital_organ' => VitalOrgan::class,
            'is_whitelisted' => 'boolean',
            'is_active' => 'boolean',
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // =========================================================================
    // RELATIONSHIPS & SCOPES
    // =========================================================================

    /**
     * Owning Cell Group (`FC`).
     *
     * @return BelongsTo<Cell, $this>
     */
    public function cell(): BelongsTo
    {
        return $this->belongsTo(Cell::class);
    }

    /**
     * Scope query to a specific cell_id.
     *
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeForCell(Builder $query, int $cellId): Builder
    {
        return $query->where('cell_id', $cellId);
    }

    /**
     * Event run-sheet segments assigned to this member.
     *
     * @return HasMany<EventRoster, $this>
     */
    public function eventRosters(): HasMany
    {
        return $this->hasMany(EventRoster::class);
    }

    /**
     * Event attendance records for this member.
     *
     * @return HasMany<EventAttendance, $this>
     */
    public function attendances(): HasMany
    {
        return $this->hasMany(EventAttendance::class);
    }

    /**
     * Pastoral follow-ups where this user is the cared-for member.
     *
     * @return HasMany<PastoralFollowUp, $this>
     */
    public function pastoralFollowUps(): HasMany
    {
        return $this->hasMany(PastoralFollowUp::class, 'member_id');
    }

    // =========================================================================
    // DOMAIN RBAC & JOURNEY OF BELONGING HELPERS
    // =========================================================================

    /**
     * Synchronizes Spatie Permission roles with the user's `tier` and `vital_organ` attributes.
     */
    public function syncTierAndOrganRoles(): void
    {
        $roles = [$this->tier->spatieRoleName()];

        if ($this->tier === UserTier::Vital && $this->vital_organ !== null) {
            $roles[] = $this->vital_organ->spatieRoleName();
        }

        $this->syncRoles($roles);
    }

    /**
     * Determines whether this user is eligible to sign in via Google OAuth Whitelist.
     */
    public function canAuthenticateViaWhitelist(): bool
    {
        return $this->is_whitelisted && $this->is_active;
    }
}
