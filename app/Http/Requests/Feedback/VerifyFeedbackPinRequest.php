<?php

declare(strict_types=1);

/**
 * Purpose: Validates the 4-digit daily PIN submitted by unauthenticated cell members on `/feedback`.
 * Domain Context: Stewarded by the Nervous System (IT Team). Ensures only well-formed
 *                 4-digit numeric PINs are queried against active events.
 * Key Dependencies: `Illuminate\Foundation\Http\FormRequest`.
 */

namespace App\Http\Requests\Feedback;

use Illuminate\Foundation\Http\FormRequest;

class VerifyFeedbackPinRequest extends FormRequest
{
    /**
     * Public guest route: anyone with the daily 4-digit PIN can verify access.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'pin' => ['required', 'string', 'regex:/^\d{4}$/'],
        ];
    }

    /**
     * Friendly Indonesian validation messages for the mobile PIN gate.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'pin.required' => 'Silakan masukkan 4 digit PIN sesi acara.',
            'pin.regex' => 'PIN harus terdiri dari tepat 4 digit angka (contoh: 2408).',
        ];
    }
}
