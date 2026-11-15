<?php

declare(strict_types=1);

/**
 * Purpose: Creates the `feedbacks` table for Phase 1 Anonymous Event Feedback.
 * Domain Context: Stewarded by the Nervous System (IT Team).
 *                 CRITICAL ARCHITECTURAL GUARDRAIL: Intentionally omits `user_id`,
 *                 `ip_address`, `user_agent`, and browser fingerprints to guarantee
 *                 100% technical anonymity for cell members submitting honest reflections.
 * Key Dependencies: `cells` table, `events` table.
 */

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
            // Intentionally omit user_id, ip_address, and user_agent to guarantee 100% technical anonymity
            $table->unsignedTinyInteger('rating'); // 1 to 5 stars
            $table->unsignedTinyInteger('mood_score')->nullable(); // 1 to 5 emotional resonance score
            $table->text('highlights')->nullable();
            $table->text('improvements')->nullable();
            $table->text('prayer_or_suggestion')->nullable();
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
