<?php

declare(strict_types=1);

/**
 * Purpose: Binds the authenticated user's `cell_id` tenant context on every HTTP request.
 * Domain Context: Ensures Soft Multi-Tenancy (`CellScope`) is always active and blocks
 *                 deactivated or un-whitelisted accounts from accessing protected routes.
 * Key Dependencies: `App\Models\Scopes\CellScope`.
 */

namespace App\Http\Middleware;

use App\Models\Scopes\CellScope;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureCellTenantContext
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user !== null) {
            if (! $user->canAuthenticateViaWhitelist()) {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                return redirect()->route('login')->withErrors([
                    'email' => 'Your account is not on the active FC whitelist.',
                ]);
            }

            CellScope::setCurrentCellId($user->cell_id);
        }

        return $next($request);
    }
}
