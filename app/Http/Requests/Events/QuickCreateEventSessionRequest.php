<?php

declare(strict_types=1);

/**
 * Purpose: Validates the Quick Event Session & 4-Digit PIN Generator form on `/dashboard`.
 * Domain Context: Bridge feature before Phase 3 allowing Brain (Leader), Nervous System (IT Team),
 *                 and Lungs (Event Team) to spin up an Event session and 24-hour 4-digit PIN.
 * Key Dependencies: `App\Enums\EventType`, `Illuminate\Validation\Rule`.
 */

namespace App\Http\Requests\Events;

use App\Enums\EventType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class QuickCreateEventSessionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'min:3', 'max:160'],
            'type' => ['required', 'string', Rule::enum(EventType::class)],
            'event_date' => ['required', 'date'],
            'location' => ['nullable', 'string', 'max:160'],
        ];
    }

    /**
     * Custom Indonesian validation messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'title.required' => 'Judul sesi acara wajib diisi.',
            'title.min' => 'Judul sesi acara minimal 3 karakter.',
            'type.required' => 'Jenis acara wajib dipilih.',
            'type.enum' => 'Jenis acara tidak valid.',
            'event_date.required' => 'Tanggal acara wajib diisi.',
            'event_date.date' => 'Format tanggal acara tidak valid.',
        ];
    }
}
