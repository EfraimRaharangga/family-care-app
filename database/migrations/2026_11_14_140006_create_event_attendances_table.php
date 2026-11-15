<?php

declare(strict_types=1);

/**
 * Purpose: Creates the `event_attendances` table for member check-ins and absence tracking.
 * Domain Context: Stewarded by Hands & Feet (Hospitality Team) and analyzed by
 *                 `ShepherdRadarService` to detect consecutive absences early.
 * Key Dependencies: `cells` table, `events` table, `users` table.
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
        Schema::create('event_attendances', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('cell_id')->constrained('cells')->cascadeOnDelete();
            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            // 'present', 'excused', or 'absent'
            $table->string('status', 24)->default('present')->index();
            $table->timestamp('checked_in_at')->nullable();
            $table->string('notes')->nullable();
            $table->timestamps();

            $table->unique(['event_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_attendances');
    }
};
