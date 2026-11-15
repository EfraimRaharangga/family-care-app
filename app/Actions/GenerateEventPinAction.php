<?php

declare(strict_types=1);

/**
 * Purpose: Generates a unique, human-friendly 4-digit numeric PIN code for an Event.
 * Domain Context: Used by the Nervous System (IT Team) and Brain (Leader) so cell
 *                 members can unlock the 100% anonymous feedback form (`/feedback`)
 *                 within a 24-hour window (`pin_expires_at`) without logging in.
 * Key Dependencies: `App\Models\Event`, `App\Models\Scopes\CellScope`.
 */

namespace App\Actions;

use App\Models\Event;
use App\Models\Scopes\CellScope;

class GenerateEventPinAction
{
    /**
     * Generates a unique 4-digit numeric PIN (`0000`–`9999`) that does not collide
     * with any existing Event PIN across all cell tenants.
     */
    public function execute(int $length = 4): string
    {
        $maxNumber = (10 ** $length) - 1;

        do {
            $pin = str_pad((string) random_int(0, $maxNumber), $length, '0', STR_PAD_LEFT);

            // Check uniqueness across all cells (bypassing CellScope) because PINs are verified by unauthenticated guests
            $exists = Event::withoutGlobalScope(CellScope::class)
                ->where('feedback_pin', $pin)
                ->exists();
        } while ($exists);

        return $pin;
    }
}
