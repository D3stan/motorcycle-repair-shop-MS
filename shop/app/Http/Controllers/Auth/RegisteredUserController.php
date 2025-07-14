<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'first_name' => 'required|string|min:1|max:255|regex:/^[a-zA-ZÀ-ÿ\s\'-]+$/',
            'last_name' => 'required|string|min:1|max:255|regex:/^[a-zA-ZÀ-ÿ\s\'-]+$/',
            'tax_code' => 'required|string|size:16|regex:/^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/|unique:users,CF',
            'phone' => 'required|string|regex:/^(\+39\s?)?[0-9]{9,10}$/',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ], [
            'first_name.required' => 'First name is required',
            'first_name.regex' => 'First name can only contain letters, spaces, hyphens, and apostrophes',
            'last_name.required' => 'Last name is required',
            'last_name.regex' => 'Last name can only contain letters, spaces, hyphens, and apostrophes',
            'tax_code.required' => 'Tax code is required',
            'tax_code.size' => 'Tax code must be exactly 16 characters',
            'tax_code.regex' => 'Invalid tax code format',
            'tax_code.unique' => 'This tax code is already registered',
            'phone.required' => 'Phone number is required',
            'phone.regex' => 'Invalid phone number format',
        ]);

        $user = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'CF' => $request->tax_code,
            'phone' => $request->phone,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        Auth::login($user);

        return to_route('dashboard');
    }
}
