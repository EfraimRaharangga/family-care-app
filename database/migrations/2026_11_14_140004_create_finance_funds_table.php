<?php

declare(strict_types=1);

/**
 * Purpose: Creates the `finance_funds` table for virtual cell fund accounting.
 * Domain Context: Stewarded by the Vascular System (Treasurer). Separates cell money into
 *                 virtual funds (`Kas Rutin`, `Dana Diakonia & Kado`, `Dana Acara Khusus`).
 * Key Dependencies: `cells` table, `App\Enums\FundType`.
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
        Schema::create('finance_funds', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('cell_id')->constrained('cells')->cascadeOnDelete();
            $table->string('name');
            $table->string('slug');
            $table->string('type', 48)->index();
            $table->text('description')->nullable();
            // Maintained atomically via LedgerBalanceService when transactions are recorded or soft-deleted
            $table->decimal('cached_balance', 15, 2)->default(0.00);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['cell_id', 'slug']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('finance_funds');
    }
};
