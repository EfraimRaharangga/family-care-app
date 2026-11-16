<?php

declare(strict_types=1);

/**
 * Purpose: Creates the `cells` tenant table for Soft Multi-Tenancy across History Maker.
 * Domain Context: Phase 0 starts with a single cell (`FC`), while every core table
 *                 scopes records via `cell_id` to allow effortless horizontal scaling.
 * Key Dependencies: Referenced by `users`, `events`, `feedbacks`, `finance_funds`, etc.
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
        Schema::create('cells', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true)->index();
            // Stores cell-specific settings (default meeting day, target duration, timezone)
            $table->json('settings')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cells');
    }
};
