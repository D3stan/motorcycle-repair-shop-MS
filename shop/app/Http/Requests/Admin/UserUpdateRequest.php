<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $userId = $this->route('customer') ? $this->route('customer')->id : 
                  ($this->route('staff') ? $this->route('staff')->id : null);

        return [
            'first_name' => 'required|string|min:1|max:255|regex:/^[a-zA-ZÀ-ÿ\s\'-]+$/',
            'last_name' => 'required|string|min:1|max:255|regex:/^[a-zA-ZÀ-ÿ\s\'-]+$/',
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            'phone' => 'nullable|string|max:20',
            'CF' => [
                'nullable',
                'string',
                'max:16',
                Rule::unique('users', 'CF')->ignore($userId),
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'first_name.required' => 'The first name field is required.',
            'first_name.regex' => 'The first name may only contain letters, spaces, hyphens, and apostrophes.',
            'last_name.required' => 'The last name field is required.',
            'last_name.regex' => 'The last name may only contain letters, spaces, hyphens, and apostrophes.',
            'email.unique' => 'This email is already registered in the system.',
            'CF.unique' => 'This tax code is already registered in the system.',
        ];
    }
} 