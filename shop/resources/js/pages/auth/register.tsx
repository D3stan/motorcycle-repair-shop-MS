import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type RegisterForm = {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

function parseName(fullName: string): { first_name: string; last_name: string } {
    const trimmedName = fullName.trim();
    if (!trimmedName) return { first_name: '', last_name: '' };
    
    const nameParts = trimmedName.split(/\s+/);
    
    if (nameParts.length === 1) {
        return { first_name: nameParts[0], last_name: '' };
    }
    
    // First part is first name, everything else is last name
    const first_name = nameParts[0];
    const last_name = nameParts.slice(1).join(' ');
    
    return { first_name, last_name };
}

function validateName(fullName: string): string | null {
    const trimmedName = fullName.trim();
    
    if (!trimmedName) {
        return 'Name is required';
    }
    
    if (trimmedName.length < 2) {
        return 'Name must be at least 2 characters long';
    }
    
    // Check for at least one space (indicating first and last name)
    if (!trimmedName.includes(' ')) {
        return 'Please enter both first and last name (e.g., "John Doe")';
    }
    
    const { first_name, last_name } = parseName(trimmedName);
    
    if (!first_name || !last_name) {
        return 'Please enter both first and last name';
    }
    
    if (first_name.length < 1 || last_name.length < 1) {
        return 'Both first and last name must be at least 1 character long';
    }
    
    // Basic character validation (letters, spaces, hyphens, apostrophes)
    const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
    if (!nameRegex.test(trimmedName)) {
        return 'Name can only contain letters, spaces, hyphens, and apostrophes';
    }
    
    return null;
}

export default function Register() {
    const [fullNameInput, setFullNameInput] = useState('');
    const [nameError, setNameError] = useState<string | null>(null);
    
    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const handleNameChange = (value: string) => {
        setFullNameInput(value);
        
        // Clear previous error
        setNameError(null);
        
        // Parse and validate the name
        const validationError = validateName(value);
        if (validationError) {
            setNameError(validationError);
            return;
        }
        
        // If valid, parse and set the data
        const { first_name, last_name } = parseName(value);
        setData((prevData) => ({
            ...prevData,
            first_name,
            last_name
        }));
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        
        // Final validation before submission
        const validationError = validateName(fullNameInput);
        if (validationError) {
            setNameError(validationError);
            return;
        }
        
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title="Create an account" description="Enter your details below to create your account">
            <Head title="Register" />
            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            value={fullNameInput}
                            onChange={(e) => handleNameChange(e.target.value)}
                            disabled={processing}
                            placeholder="e.g. Amoni Vivo"
                        />
                        <InputError message={nameError || errors.first_name || errors.last_name} className="mt-2" />
                        {fullNameInput && !nameError && data.first_name && data.last_name && (
                            <div className="text-sm text-muted-foreground">
                                First name: {data.first_name}, Last name: {data.last_name}
                            </div>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={2}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                            placeholder="email@example.com"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={3}
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            disabled={processing}
                            placeholder="Password"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirm password</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            required
                            tabIndex={4}
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            disabled={processing}
                            placeholder="Confirm password"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <Button type="submit" className="mt-2 w-full" tabIndex={5} disabled={processing || !!nameError}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Create account
                    </Button>
                </div>

                <div className="text-muted-foreground text-center text-sm">
                    Already have an account?{' '}
                    <TextLink href={route('login')} tabIndex={6}>
                        Log in
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
