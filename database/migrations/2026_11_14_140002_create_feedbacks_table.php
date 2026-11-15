<?php

declare(strict_types=1);

/**
 * Purpose: Creates the `feedbacks` table for Phase 1 Anonymous Event Feedback.
 * Domain Context: Stewarded by the Nervous System (IT Team).
 *                 CRITICAL ARCHITECTURAL GUARDRAIL: Intentionally omits `user_id`,
 *                 `ip_address`, `user_agent`, and browser fingerprints to guarantee
 *                 100% technical anonymity for cell members submitting honest reflections.
 *                 Optional pastoral care contact fields (`contact_name`, `contact_info`)
 *                 are stored ONLY when a member explicitly checks `needs_pastoral_care`.
 * Key Dependencies: `cells` table, `events` table, `App\Enums\FeedbackCategory`.
 */

use App\Enums\FeedbackCategory;
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
        Schema::create('feedbacks', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('cell_id')->constrained('cells')->cascadeOnDelete();
            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
            // Intentionally omit user_id, ip_address, user_agent, and fingerprint to guarantee 100% technical anonymity
            $table->unsignedTinyInteger('rating'); // 1 to 5 satisfaction score
            $table->string('category', 48)->default(FeedbackCategory::Materi->value)->index();
            $table->text('message');
            $table->boolean('needs_pastoral_care')->default(false)->index();
            $table->string('contact_name', 120)->nullable();
            $table->string('contact_info', 160)->nullable();
            $table->boolean('is_reviewed')->default(false)->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('feedbacks');
    }
};
