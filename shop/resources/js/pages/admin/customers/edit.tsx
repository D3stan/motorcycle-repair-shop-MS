import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type User } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

interface Props {
    customer: User;
}

export default function CustomerEdit({ customer }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        first_name: customer.first_name,
        last_name: customer.last_name,
        email: customer.email,
        phone: customer.phone || '',
        tax_code: customer.tax_code || '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Admin Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Customer Management',
            href: '/admin/customers',
        },
        {
            title: `${customer.first_name} ${customer.last_name}`,
            href: `/admin/customers/${customer.id}`,
        },
        {
            title: 'Edit',
            href: `/admin/customers/${customer.id}/edit`,
        },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin.customers.update', customer.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${customer.first_name} ${customer.last_name}`} />
            
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={route('admin.customers.show', customer.id)}>
                                <ArrowLeft className="h-4 w-4" />
                                Back to Customer
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                Edit Customer
                            </h1>
                            <p className="text-muted-foreground">
                                Update {customer.first_name} {customer.last_name}'s information
                            </p>
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Customer Information</CardTitle>
                        <CardDescription>
                            Update the customer's personal and contact information
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="first_name">First Name</Label>
                                    <Input
                                        id="first_name"
                                        type="text"
                                        value={data.first_name}
                                        onChange={(e) => setData('first_name', e.target.value)}
                                        className={errors.first_name ? 'border-red-500' : ''}
                                        required
                                    />
                                    {errors.first_name && (
                                        <p className="text-sm text-red-500">{errors.first_name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="last_name">Last Name</Label>
                                    <Input
                                        id="last_name"
                                        type="text"
                                        value={data.last_name}
                                        onChange={(e) => setData('last_name', e.target.value)}
                                        className={errors.last_name ? 'border-red-500' : ''}
                                        required
                                    />
                                    {errors.last_name && (
                                        <p className="text-sm text-red-500">{errors.last_name}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className={errors.email ? 'border-red-500' : ''}
                                    required
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-500">{errors.email}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    className={errors.phone ? 'border-red-500' : ''}
                                    placeholder="Optional"
                                />
                                {errors.phone && (
                                    <p className="text-sm text-red-500">{errors.phone}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tax_code">Tax Code</Label>
                                <Input
                                    id="tax_code"
                                    type="text"
                                    value={data.tax_code}
                                    onChange={(e) => setData('tax_code', e.target.value)}
                                    className={errors.tax_code ? 'border-red-500' : ''}
                                    placeholder="Optional"
                                    maxLength={16}
                                />
                                {errors.tax_code && (
                                    <p className="text-sm text-red-500">{errors.tax_code}</p>
                                )}
                            </div>

                            <div className="flex items-center gap-4 pt-4">
                                <Button type="submit" disabled={processing}>
                                    <Save className="h-4 w-4 mr-2" />
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href={route('admin.customers.show', customer.id)}>
                                        Cancel
                                    </Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
} 