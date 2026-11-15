<?php

declare(strict_types=1);

/**
 * Purpose: Authorization policy governing financial ledger operations (`Transaction`).
 * Domain Context: Enforces that only Vascular System (Treasurer) or Brain (Leader)
 *                 with appropriate Spatie permissions can view or record transactions,
 *                 and forbids force-deletion for all users.
 * Key Dependencies: `App\Models\User`, `App\Models\Transaction`.
 */

namespace App\Policies;

use App\Models\Transaction;
use App\Models\User;

class TransactionPolicy
{
    /**
     * Determine whether the user can view the financial ledger.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('finance.view');
    }

    /**
     * Determine whether the user can record a new transaction.
     */
    public function create(User $user): bool
    {
        return $user->can('transactions.record') || $user->can('finance.manage');
    }

    /**
     * Determine whether the user can soft-delete (void) a transaction.
     */
    public function delete(User $user, Transaction $transaction): bool
    {
        return $user->cell_id === $transaction->cell_id && $user->can('finance.manage');
    }

    /**
     * Financial records must NEVER be permanently force-deleted.
     */
    public function forceDelete(User $user, Transaction $transaction): bool
    {
        return false;
    }
}
