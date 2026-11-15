<?php

declare(strict_types=1);

/**
 * Purpose: Validates 100% Anonymous Member Feedback submissions on `/feedback`.
 * Domain Context: Stewarded by the Nervous System (IT Team). Enforces rating (1–5),
 *                 `FeedbackCategory` Enum, open message, and conditional pastoral care
 *                 contact fields while rejecting any user tracking metadata.
 * Key Dependencies: `App\Enums\FeedbackCategory`, `Illuminate\Validation\Rule`.
 */

namespace App\Http\Requests\Feedback;

use App\Enums\FeedbackCategory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAnonymousFeedbackRequest extends FormRequest
{
    /**
     * Public guest route: authorized via valid 4-digit event PIN.
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
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'category' => ['required', 'string', Rule::enum(FeedbackCategory::class)],
            'message' => ['required', 'string', 'min:3', 'max:2000'],
            'needs_pastoral_care' => ['sometimes', 'boolean'],
            'contact_name' => ['nullable', 'string', 'max:120'],
            'contact_info' => ['nullable', 'string', 'max:160'],
        ];
    }

    /**
     * Friendly Indonesian validation messages for cell members.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'pin.required' => 'Sesi PIN tidak ditemukan. Silakan masukkan kembali 4 digit PIN acara.',
            'pin.regex' => 'Format PIN acara tidak valid.',
            'rating.required' => 'Silakan pilih tingkat kepuasan (1 hingga 5 bintang).',
            'rating.min' => 'Rating minimal adalah 1 bintang.',
            'rating.max' => 'Rating maksimal adalah 5 bintang.',
            'category.required' => 'Silakan pilih kategori feedback.',
            'category.enum' => 'Kategori feedback yang dipilih tidak valid.',
            'message.required' => 'Silakan tuliskan pesan, kesan, atau saran membangun Anda.',
            'message.min' => 'Pesan feedback terlalu singkat (minimal 3 karakter).',
        ];
    }
}
