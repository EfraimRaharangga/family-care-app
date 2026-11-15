<?php

declare(strict_types=1);

/**
 * Purpose: Creates the `users`, `password_reset_tokens`, and `sessions` tables.
 * Domain Context: Stores FC R&D members with Soft Multi-Tenancy (`cell_id`), Google OAuth
 *                 Whitelist control (`is_whitelisted`), Journey of Belonging tier (`tier`),
 *                 and optional Vital Organ assignment (`vital_organ`).
 * Key Dependencies: `cells` table, `App\Enums\UserTier`, `App\Enums\VitalOrgan`.
 */

use App\Enums\UserTier;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table): void {
            $table->id();
            // Nullable only for system-level fallback; all cell members belong to a specific cell_id
            $table->foreignId('cell_id')->nullable()->constrained('cells')->cascadeOnDelete();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('google_id')->nullable()->index();
            $table->string('avatar')->nullable();
            $table->string('phone', 30)->nullable();
            $table->date('birth_date')->nullable();
            // Journey of Belonging tier ('part' or 'vital')
            $table->string('tier', 32)->default(UserTier::Part->value)->index();
            // Populated when tier === 'vital' ('brain', 'lungs', 'hands_and_feet', 'vascular_system', 'nervous_system')
            $table->string('vital_organ', 48)->nullable()->index();
            // Enforces Google OAuth Whitelist access control so only pre-registered cell members can authenticate
            $table->boolean('is_whitelisted')->default(true)->index();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table): void {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table): void {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
    }
};
