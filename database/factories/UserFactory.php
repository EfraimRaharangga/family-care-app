<?php

declare(strict_types=1);

/**
 * Purpose: Eloquent Factory for generating FC R&D `User` instances in tests and seeders.
 * Domain Context: Supports Journey of Belonging states (`part()`, `vital(VitalOrgan)`)
 *                 and Soft Multi-Tenancy (`cell_id`).
 * Key Dependencies: `App\Models\User`, `App\Enums\UserTier`, `App\Enums\VitalOrgan`.
 */

namespace Database\Factories;

use App\Enums\UserTier;
use App\Enums\VitalOrgan;
use App\Models\Cell;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'cell_id' => null,
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'birth_date' => fake()->dateTimeBetween('-32 years', '-18 years')->format('Y-m-d'),
            'tier' => UserTier::Part,
            'vital_organ' => null,
            'is_whitelisted' => true,
            'is_active' => true,
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Assign the user to the Vital tier with a specific VitalOrgan.
     */
    public function vital(VitalOrgan $organ = VitalOrgan::Brain): static
    {
        return $this->state(fn (array $attributes): array => [
            'tier' => UserTier::Vital,
            'vital_organ' => $organ,
        ]);
    }

    /**
     * Assign the user to a specific Cell tenant.
     */
    public function inCell(Cell|int $cell): static
    {
        $cellId = $cell instanceof Cell ? $cell->id : $cell;

        return $this->state(fn (array $attributes): array => [
            'cell_id' => $cellId,
        ]);
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes): array => [
            'email_verified_at' => null,
        ]);
    }
}
