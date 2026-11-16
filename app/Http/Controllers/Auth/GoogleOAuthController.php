<?php

declare(strict_types=1);

/**
 * Purpose: Handles Google OAuth 2.0 authentication with strict FC Email Whitelist enforcement.
 * Domain Context: Only pre-registered cell members (`is_whitelisted = true` and `is_active = true`)
 *                 are allowed to log in via Google OAuth; unknown emails are rejected immediately.
 * Key Dependencies: `Laravel\Socialite\Facades\Socialite`, `App\Models\User`.
 */

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Throwable;

class GoogleOAuthController extends Controller
{
    /**
     * Redirect the user to the Google OAuth 2.0 authentication consent screen.
     */
    public function redirect(): RedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Handle the OAuth callback from Google and enforce the FC email whitelist.
     */
    public function callback(): RedirectResponse
    {
        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (Throwable) {
            return redirect()->route('login')->withErrors([
                'email' => 'Unable to authenticate with Google OAuth. Please try again.',
            ]);
        }

        $email = strtolower(trim((string) $googleUser->getEmail()));

        /** @var User|null $user */
        $user = User::query()->whereRaw('LOWER(email) = ?', [$email])->first();

        if ($user === null || ! $user->canAuthenticateViaWhitelist()) {
            return redirect()->route('login')->withErrors([
                'email' => 'Access denied: Your Google email is not registered on the FC member whitelist.',
            ]);
        }

        // Sync Google profile identifiers on successful whitelisted login
        $user->update([
            'google_id' => $googleUser->getId(),
            'avatar' => $googleUser->getAvatar() ?: $user->avatar,
            'email_verified_at' => $user->email_verified_at ?? now(),
        ]);

        Auth::login($user, remember: true);

        return redirect()->intended(route('dashboard', absolute: false));
    }
}
