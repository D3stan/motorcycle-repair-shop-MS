import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Building2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Suppliers',
        href: '/admin/suppliers',
    },
    {
        title: 'Add New Supplier',
        href: '/admin/suppliers/create',
    },
];

export default function SupplierCreate() {
    const { data, setData, post, processing, errors } = useForm({
        supplier_code: '',
        name: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        postal_code: '',
        country: 'Italy',
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.suppliers.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add New Supplier" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Add New Supplier</h1>
                        <p className="text-muted-foreground">Create a new supplier profile</p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href={route('admin.suppliers.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Suppliers
                        </Link>
                    </Button>
                </div>

                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            Supplier Information
                        </CardTitle>
                        <CardDescription>Enter the details for the new supplier</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Supplier Code */}
                                <div className="space-y-2">
                                    <Label htmlFor="supplier_code">Supplier Code *</Label>
                                    <Input
                                        id="supplier_code"
                                        type="text"
                                        value={data.supplier_code}
                                        onChange={(e) => setData('supplier_code', e.target.value)}
                                        placeholder="e.g., SUP001"
                                        required
                                    />
                                    {errors.supplier_code && (
                                        <p className="text-sm text-red-600">{errors.supplier_code}</p>
                                    )}
                                </div>

                                {/* Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">Company Name *</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g., Motosport Components Srl"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                {/* Phone */}
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone *</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="+39 123 456 7890"
                                        required
                                    />
                                    {errors.phone && (
                                        <p className="text-sm text-red-600">{errors.phone}</p>
                                    )}
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="contact@supplier.com"
                                        required
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-red-600">{errors.email}</p>
                                    )}
                                </div>

                                {/* Address */}
                                <div className="space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Input
                                        id="address"
                                        type="text"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        placeholder="Street address"
                                    />
                                    {errors.address && (
                                        <p className="text-sm text-red-600">{errors.address}</p>
                                    )}
                                </div>

                                {/* City */}
                                <div className="space-y-2">
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        type="text"
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value)}
                                        placeholder="City name"
                                    />
                                    {errors.city && (
                                        <p className="text-sm text-red-600">{errors.city}</p>
                                    )}
                                </div>

                                {/* Postal Code */}
                                <div className="space-y-2">
                                    <Label htmlFor="postal_code">Postal Code</Label>
                                    <Input
                                        id="postal_code"
                                        type="text"
                                        value={data.postal_code}
                                        onChange={(e) => setData('postal_code', e.target.value)}
                                        placeholder="12345"
                                    />
                                    {errors.postal_code && (
                                        <p className="text-sm text-red-600">{errors.postal_code}</p>
                                    )}
                                </div>

                                {/* Country */}
                                <div className="space-y-2">
                                    <Label htmlFor="country">Country *</Label>
                                    <Input
                                        id="country"
                                        type="text"
                                        value={data.country}
                                        onChange={(e) => setData('country', e.target.value)}
                                        placeholder="Italy"
                                        required
                                    />
                                    {errors.country && (
                                        <p className="text-sm text-red-600">{errors.country}</p>
                                    )}
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <textarea
                                    id="notes"
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Optional notes about the supplier"
                                />
                                {errors.notes && (
                                    <p className="text-sm text-red-600">{errors.notes}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" asChild>
                                    <Link href={route('admin.suppliers.index')}>Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Creating...' : 'Create Supplier'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
} 