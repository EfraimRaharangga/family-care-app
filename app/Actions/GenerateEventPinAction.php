<?php

declare(strict_types=1);

/**
 * Purpose: Generates a unique, human-friendly 6-character PIN code for an Event.
 * Domain Context: Used by the Nervous System (IT Team) and Lungs (Event Team) so cell
 *                 members can unlock the 100% anonymous feedback form at the end of a
 *                 gathering without logging in.
 * Key Dependencies: `App\Models\Event`, ` App\Models\Scopes\CellScope`.
 */

namespace App\Actions;

use App\Models\Event;
use App\Models\Scopes\CellScope;

class GenerateEventPinAction
{
    /**
     * Unambiguous uppercase alphanumeric characters (excludes 0/O, 1/I/L to avoid projection screen confusion).
     */
    private const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

    /**
     * Generates a unique 6-character PIN that does not collide with any existing Event PIN.
     */
    public function execute(int $length = 6): string
    {
        $maxIndex = strlen(self::ALPHABET) - 1;

        do {
            $pin = '';
            for ($i = 0; $i < $length; $i++) {
                $pin .= self::ALPHABET[random_int(0, $maxIndex)];
            }

            // Check uniqueness across all cells (bypassing CellScope) because PINs are entered anonymously
            $exists = Event::withoutGlobalScope(CellScope::class)
                ->where('feedback_pin', $pin)
                ->exists();
        } while ($exists);

        return $pin;
    }
}
