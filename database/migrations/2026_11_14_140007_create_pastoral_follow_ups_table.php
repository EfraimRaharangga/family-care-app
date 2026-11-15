<?php

declare(strict_types=1);

/**
 * Purpose: Creates the `pastoral_follow_ups` table for member care and absentee outreach.
 * Domain Context: Coordinated between Brain (Leader) and Hands & Feet (Hospitality Team)
 *                 to ensure no FC R&D member falls through the cracks when absent or in need.
 * Key Dependencies: `cells` table, `users` table, `events` table.
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
        Schema::create('pastoral_follow_ups', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('cell_id')->constrained('cells')->cascadeOnDelete();
            $table->foreignId('member_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('triggered_by_event_id')->nullable()->constrained('events')->nullOnDelete();
            $table->string('reason');
            // 'pending', 'in_progress', or 'completed'
            $table->string('status', 32)->default('pending')->index();
            $table->text('notes')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pastoral_follow_ups');
    }
};
