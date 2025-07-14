<?php

namespace App\Http\Requests\Settings;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'min:1', 'max:255', 'regex:/^[a-zA-ZÀ-ÿ\s\'-]+$/'],
            'last_name' => ['required', 'string', 'min:1', 'max:255', 'regex:/^[a-zA-ZÀ-ÿ\s\'-]+$/'],
            'phone' => ['required', 'string', 'regex:/^(\+39\s?)?[0-9]{9,10}$/'],

            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'first_name' => 'first name',
            'last_name' => 'last name',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'first_name.regex' => 'First name can only contain letters, spaces, hyphens, and apostrophes.',
            'last_name.regex' => 'Last name can only contain letters, spaces, hyphens, and apostrophes.',
            'phone.required' => 'Phone number is required.',
            'phone.regex' => 'Invalid phone number format.',
        ];
    }
}
