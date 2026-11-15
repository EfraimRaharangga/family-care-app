<?php

declare(strict_types=1);

/**
 * Purpose: Creates the `event_rosters` table for the 90-minute run sheet & servant assignments.
 * Domain Context: Stewarded by the Lungs (Event Team) to manage the rhythm and flow of each
 *                 gathering (e.g., Icebreaker 15m, Worship 20m, Word & Sharing 40m, Ministry & Announcements 15m).
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
        Schema::create('event_rosters', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('cell_id')->constrained('cells')->cascadeOnDelete();
            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('role_name');
            $table->string('segment_title');
            $table->unsignedSmallInteger('duration_minutes')->default(15);
            $table->unsignedSmallInteger('sort_order')->default(1);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['event_id', 'sort_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_rosters');
    }
};
