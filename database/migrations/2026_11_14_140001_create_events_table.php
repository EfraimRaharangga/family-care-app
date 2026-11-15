<?php

declare(strict_types=1);

/**
 * Purpose: Creates the `events` table for FC R&D cell gatherings and special events.
 * Domain Context: Managed primarily by the Lungs (Event Team), Brain (Leader), and Nervous System (IT Team).
 *                 Includes a 4-digit `feedback_pin` and `pin_expires_at` (24-hour window) to unlock
 *                 100% anonymous post-event feedback.
 * Key Dependencies: `cells` table, `users` table, `App\Enums\EventType`, `App\Enums\EventStatus`.
 */

use App\Enums\EventStatus;
use App\Enums\EventType;
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
        Schema::create('events', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('cell_id')->constrained('cells')->cascadeOnDelete();
            $table->string('title');
            $table->string('type', 48)->default(EventType::Regular->value)->index();
            $table->string('status', 32)->default(EventStatus::Upcoming->value)->index();
            $table->dateTime('scheduled_at')->index();
            // Standard FC R&D gathering rhythm is 90 minutes, stewarded by the Lungs (Event Team)
            $table->unsignedSmallInteger('duration_minutes')->default(90);
            $table->string('location')->nullable();
            // Daily 4-digit numeric PIN shared live for 100% anonymous feedback access
            $table->string('feedback_pin', 12)->unique();
            $table->timestamp('pin_expires_at')->nullable()->index();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
