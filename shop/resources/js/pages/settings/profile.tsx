import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useState, useEffect } from 'react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: '/settings/profile',
    },
];

type ProfileForm = {
    first_name: string;
    last_name: string;
    email: string;
}

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

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<SharedData>().props;
    const [fullNameInput, setFullNameInput] = useState('');
    const [nameError, setNameError] = useState<string | null>(null);

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm<Required<ProfileForm>>({
        first_name: auth.user.first_name || '',
        last_name: auth.user.last_name || '',
        email: auth.user.email,
    });

    // Initialize the full name input with the current user's name
    useEffect(() => {
        if (auth.user.first_name && auth.user.last_name) {
            setFullNameInput(`${auth.user.first_name} ${auth.user.last_name}`);
        }
    }, [auth.user.first_name, auth.user.last_name]);

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

        patch(route('profile.update'), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Profile information" description="Update your name and email address" />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Full Name</Label>

                            <Input
                                id="name"
                                className="mt-1 block w-full"
                                value={fullNameInput}
                                onChange={(e) => handleNameChange(e.target.value)}
                                required
                                autoComplete="name"
                                placeholder="e.g., Amoni Vivo"
                            />

                            <InputError className="mt-2" message={nameError || errors.first_name || errors.last_name} />
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
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="username"
                                placeholder="Email address"
                            />

                            <InputError className="mt-2" message={errors.email} />
                        </div>

                        {mustVerifyEmail && auth.user.email_verified_at === null && (
                            <div>
                                <p className="text-muted-foreground -mt-4 text-sm">
                                    Your email address is unverified.{' '}
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                    >
                                        Click here to resend the verification email.
                                    </Link>
                                </p>

                                {status === 'verification-link-sent' && (
                                    <div className="mt-2 text-sm font-medium text-green-600">
                                        A new verification link has been sent to your email address.
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <Button disabled={processing || !!nameError}>Save</Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">Saved</p>
                            </Transition>
                        </div>
                    </form>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
