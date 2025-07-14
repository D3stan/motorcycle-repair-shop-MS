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
    tax_code: string;
    phone: string;
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

function validateTaxCode(taxCode: string): string | null {
    const trimmedCode = taxCode.trim();
    
    if (!trimmedCode) {
        return 'Tax code is required';
    }
    
    // Basic Italian tax code validation (16 characters)
    if (trimmedCode.length !== 16) {
        return 'Tax code must be exactly 16 characters';
    }
    
    const taxCodeRegex = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/;
    if (!taxCodeRegex.test(trimmedCode.toUpperCase())) {
        return 'Invalid tax code format';
    }
    
    return null;
}

function validatePhone(phone: string): string | null {
    const trimmedPhone = phone.trim();
    
    if (!trimmedPhone) {
        return 'Phone number is required';
    }
    
    // Basic phone validation (Italian format)
    const phoneRegex = /^(\+39\s?)?[0-9]{9,10}$/;
    if (!phoneRegex.test(trimmedPhone.replace(/\s/g, ''))) {
        return 'Invalid phone number format';
    }
    
    return null;
}

export default function Register() {
    const [fullNameInput, setFullNameInput] = useState('');
    const [nameError, setNameError] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState(1);

    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        first_name: '',
        last_name: '',
        tax_code: '',
        phone: '',
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
            last_name,
        }));
    };

    const handleNextStep = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate step 1 fields
        const nameValidationError = validateName(fullNameInput);
        const taxCodeValidationError = validateTaxCode(data.tax_code);
        const phoneValidationError = validatePhone(data.phone);
        
        if (nameValidationError) {
            setNameError(nameValidationError);
            return;
        }
        
        if (taxCodeValidationError || phoneValidationError) {
            return;
        }
        
        setCurrentStep(2);
    };

    const handlePrevStep = () => {
        setCurrentStep(1);
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
            
            {/* Step Indicator */}
            <div className="mb-8">
                <div className="flex items-center justify-center space-x-4">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                        currentStep === 1 ? 'bg-primary border-primary text-white' : 
                        currentStep === 2 ? 'bg-green-500 border-green-500 text-white' : 
                        'border-gray-300 text-gray-300'
                    }`}>
                        1
                    </div>
                    <div className={`h-1 w-16 ${currentStep === 2 ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                        currentStep === 2 ? 'bg-primary border-primary text-white' : 
                        'border-gray-300 text-gray-300'
                    }`}>
                        2
                    </div>
                </div>
                <div className="flex justify-between mt-2">
                    <span className={`text-sm ${currentStep === 1 ? 'text-primary font-medium' : 'text-gray-500'}`}>
                        Personal Info
                    </span>
                    <span className={`text-sm ${currentStep === 2 ? 'text-primary font-medium' : 'text-gray-500'}`}>
                        Account Details
                    </span>
                </div>
            </div>

            {currentStep === 1 && (
                <form className="flex flex-col gap-6" onSubmit={handleNextStep}>
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
                                <div className="text-muted-foreground text-sm">
                                    First name: {data.first_name}, Last name: {data.last_name}
                                </div>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="tax_code">Tax Code (CF)</Label>
                            <Input
                                id="tax_code"
                                type="text"
                                required
                                tabIndex={2}
                                autoComplete="off"
                                value={data.tax_code}
                                onChange={(e) => setData('tax_code', e.target.value.toUpperCase())}
                                disabled={processing}
                                placeholder="e.g. RSSMRA80A01H501U"
                                maxLength={16}
                            />
                            <InputError message={validateTaxCode(data.tax_code) || errors.tax_code} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                type="tel"
                                required
                                tabIndex={3}
                                autoComplete="tel"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                disabled={processing}
                                placeholder="e.g. +39 123 456 7890"
                            />
                            <InputError message={validatePhone(data.phone) || errors.phone} />
                        </div>

                        <Button type="submit" className="mt-2 w-full" tabIndex={4} disabled={processing}>
                            Next
                        </Button>
                    </div>
                </form>
            )}

            {currentStep === 2 && (
                <form className="flex flex-col gap-6" onSubmit={submit}>
                    <div className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email address</Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                autoFocus
                                tabIndex={1}
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
                                tabIndex={2}
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
                                tabIndex={3}
                                autoComplete="new-password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                disabled={processing}
                                placeholder="Confirm password"
                            />
                            <InputError message={errors.password_confirmation} />
                        </div>

                        <div className="flex gap-3">
                            <Button 
                                type="button" 
                                variant="outline" 
                                className="w-full" 
                                tabIndex={4}
                                onClick={handlePrevStep}
                                disabled={processing}
                            >
                                Back
                            </Button>
                            <Button type="submit" className="w-full" tabIndex={5} disabled={processing}>
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                Create account
                            </Button>
                        </div>
                    </div>
                </form>
            )}

            <div className="text-muted-foreground text-center text-sm mt-6">
                Already have an account?{' '}
                <TextLink href={route('login')} tabIndex={6}>
                    Log in
                </TextLink>
            </div>
        </AuthLayout>
    );
}
