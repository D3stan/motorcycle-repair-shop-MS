import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type AdminStaffDetails } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, UserCog } from 'lucide-react';

interface Props {
    staff: AdminStaffDetails;
}

export default function StaffEdit({ staff }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Admin Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Staff Management',
            href: '/admin/staff',
        },
        {
            title: `${staff.first_name} ${staff.last_name}`,
            href: `/admin/staff/${staff.id}`,
        },
        {
            title: 'Edit',
            href: `/admin/staff/${staff.id}/edit`,
        },
    ];

    const { data, setData, put, processing, errors } = useForm({
        first_name: staff.first_name || '',
        last_name: staff.last_name || '',
        email: staff.email || '',
        phone: staff.phone || '',
        tax_code: staff.tax_code || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/staff/${staff.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${staff.first_name} ${staff.last_name}`} />
            
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Edit Staff Member</h1>
                        <p className="text-muted-foreground">Update {staff.first_name} {staff.last_name}'s information</p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href={`/admin/staff/${staff.id}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Details
                        </Link>
                    </Button>
                </div>

                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <UserCog className="mr-2 h-5 w-5" />
                            Staff Member Information
                        </CardTitle>
                        <CardDescription>
                            Update the details for this mechanic
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="first_name">First Name *</Label>
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
                                    <Label htmlFor="last_name">Last Name *</Label>
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
                                <Label htmlFor="email">Email *</Label>
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        className={errors.phone ? 'border-red-500' : ''}
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
                                    />
                                    {errors.tax_code && (
                                        <p className="text-sm text-red-500">{errors.tax_code}</p>
                                    )}
                                </div>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <UserCog className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-blue-800">
                                            Password Reset
                                        </h3>
                                        <div className="mt-2 text-sm text-blue-700">
                                            <p>
                                                To change this staff member's password, they will need to use the 
                                                "Forgot Password" feature on the login page, or you can reset it 
                                                through the system administrator panel.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-end space-x-2">
                                <Button type="button" variant="outline" asChild>
                                    <Link href={`/admin/staff/${staff.id}`}>Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Updating...' : 'Update Staff Member'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
} 