<?php

declare(strict_types=1);

/**
 * Purpose: Manages virtual fund balances (`FinanceFund`) and immutable ledger recording (`Transaction`).
 * Domain Context: Stewarded by the Vascular System (Treasurer). Ensures `cached_balance`
 *                 always matches the sum of non-deleted `in` minus `out` transactions.
 * Key Dependencies: `App\Models\FinanceFund`, `App\Models\Transaction`, `Illuminate\Support\Facades\DB`.
 */

namespace App\Services;

use App\Models\FinanceFund;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class LedgerBalanceService
{
    /**
     * Records a new financial transaction and atomically recalculates the fund's cached balance.
     *
     * @param  array{
     *     cell_id: int,
     *     finance_fund_id: int,
     *     event_id?: int|null,
     *     recorded_by: int,
     *     direction: 'in'|'out',
     *     amount: float|string,
     *     category: string,
     *     description: string,
     *     transaction_date: string,
     *     reference_note?: string|null
     * }  $payload
     *
     * @throws InvalidArgumentException
     */
    public function recordTransaction(array $payload): Transaction
    {
        if (! in_array($payload['direction'], ['in', 'out'], true)) {
            throw new InvalidArgumentException('Transaction direction must be either "in" or "out".');
        }

        if ((float) $payload['amount'] <= 0) {
            throw new InvalidArgumentException('Transaction amount must be greater than zero.');
        }

        return DB::transaction(function () use ($payload): Transaction {
            /** @var FinanceFund $fund */
            $fund = FinanceFund::query()->lockForUpdate()->findOrFail($payload['finance_fund_id']);

            $transaction = Transaction::query()->create($payload);

            $this->recalculateFundBalance($fund);

            return $transaction;
        });
    }

    /**
     * Soft-deletes a financial transaction (never hard-deleted) and recalculates the fund balance.
     */
    public function voidTransaction(Transaction $transaction): void
    {
        DB::transaction(function () use ($transaction): void {
            /** @var FinanceFund $fund */
            $fund = FinanceFund::query()->lockForUpdate()->findOrFail($transaction->finance_fund_id);

            // SoftDeletes ensures the record remains in the database and triggers Spatie Activitylog
            $transaction->delete();

            $this->recalculateFundBalance($fund);
        });
    }

    /**
     * Recomputes and persists `cached_balance` from active (non-soft-deleted) transactions.
     */
    public function recalculateFundBalance(FinanceFund $fund): float
    {
        $totalIn = (float) $fund->transactions()
            ->where('direction', 'in')
            ->sum('amount');

        $totalOut = (float) $fund->transactions()
            ->where('direction', 'out')
            ->sum('amount');

        $balance = round($totalIn - $totalOut, 2);

        $fund->update(['cached_balance' => $balance]);

        return $balance;
    }
}
