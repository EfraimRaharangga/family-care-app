<?php

declare(strict_types=1);

/**
 * Purpose: Creates the `transactions` table for immutable financial ledger entries.
 * Domain Context: Stewarded by the Vascular System (Treasurer).
 *                 CRITICAL ARCHITECTURAL GUARDRAIL: Financial records must NEVER be hard-deleted;
 *                 this table enforces `softDeletes()` and pairs with Spatie `LogsActivity`.
 * Key Dependencies: `cells` table, `finance_funds` table, `events` table, `users` table.
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
        Schema::create('transactions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('cell_id')->constrained('cells')->cascadeOnDelete();
            $table->foreignId('finance_fund_id')->constrained('finance_funds')->restrictOnDelete();
            $table->foreignId('event_id')->nullable()->constrained('events')->nullOnDelete();
            $table->foreignId('recorded_by')->constrained('users')->restrictOnDelete();
            // 'in' (offering/contribution) or 'out' (expense/diaconate disbursement)
            $table->string('direction', 16)->index();
            $table->decimal('amount', 15, 2);
            $table->string('category', 64)->index();
            $table->string('description');
            $table->date('transaction_date')->index();
            $table->string('reference_note')->nullable();
            $table->timestamps();
            // Enforce soft deletes so financial audit trails cannot be destroyed
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
