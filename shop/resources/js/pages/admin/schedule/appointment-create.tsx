import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Calendar, FileText, Save, User } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Customer {
    id: number;
    name: string;
    email: string;
    motorcycles: {
        id: number;
        name: string;
        plate: string;
        year: number;
    }[];
}

interface Props {
    customers: Customer[];
}

interface AppointmentFormData {
    user_id: string;
    appointment_date: string;
    appointment_time: string;
    type: string;
    notes: string;
    [key: string]: any;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Schedule',
        href: '/admin/schedule',
    },
    {
        title: 'All Appointments',
        href: '/admin/schedule/appointments',
    },
    {
        title: 'Create Appointment',
        href: '/admin/schedule/appointments/create',
    },
];

export default function AppointmentCreate({ customers }: Props) {
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [availableMotorcycles, setAvailableMotorcycles] = useState<any[]>([]);

    const { data, setData, post, processing, errors, reset } = useForm<AppointmentFormData>({
        user_id: '',
        appointment_date: '',
        appointment_time: '',
        type: '',
        notes: '',
    });

    useEffect(() => {
        if (data.user_id) {
            const customer = customers.find((c) => c.id.toString() === data.user_id);
            setSelectedCustomer(customer || null);
            setAvailableMotorcycles(customer?.motorcycles || []);
        }
    }, [data.user_id]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/schedule/appointments');
    };

    // Generate time slots from 8:00 to 18:00
    const timeSlots = Array.from({ length: 11 }, (_, i) => {
        const hour = 8 + i;
        return `${hour.toString().padStart(2, '0')}:00`;
    });

    // Get today's date as minimum date
    const today = new Date().toISOString().split('T')[0];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Appointment" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button asChild variant="outline" size="sm">
                            <Link href="/admin/schedule/appointments">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Appointments
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Create New Appointment</h1>
                            <p className="text-muted-foreground">Schedule a new appointment for a customer</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Customer Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Customer Information
                                </CardTitle>
                                <CardDescription>Select customer for appointment</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="user_id">Customer</Label>
                                    <select
                                        id="user_id"
                                        value={data.user_id}
                                        onChange={(e) => setData('user_id', e.target.value)}
                                        className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
                                        required
                                    >
                                        <option value="">Select a customer</option>
                                        {customers.map((customer) => (
                                            <option key={customer.id} value={customer.id}>
                                                {customer.name} ({customer.email})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.user_id && <p className="text-sm text-red-600">{errors.user_id}</p>}
                                </div>

                                {selectedCustomer && availableMotorcycles.length > 0 && (
                                    <div className="space-y-2">
                                        <Label>Customer's Motorcycles</Label>
                                        <div className="rounded-md bg-gray-50 p-3">
                                            <p className="mb-2 text-sm font-medium text-gray-900">Available motorcycles:</p>
                                            {availableMotorcycles
                                                .filter((motorcycle) => motorcycle && motorcycle.id)
                                                .map((motorcycle, index) => (
                                                    <div key={motorcycle.id || `motorcycle-${index}`} className="text-sm text-gray-700">
                                                        • {motorcycle.name} - {motorcycle.plate} ({motorcycle.year})
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                )}

                                {selectedCustomer && (
                                    <div className="rounded-md bg-gray-50 p-3">
                                        <p className="text-sm font-medium text-gray-900">Customer Details:</p>
                                        <p className="text-sm text-gray-700">
                                            {selectedCustomer.name} - {selectedCustomer.email}
                                        </p>
                                        <p className="text-sm text-gray-600">Customer motorcycles displayed for reference only</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Appointment Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Appointment Details
                                </CardTitle>
                                <CardDescription>Set date, time and appointment type</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="appointment_date">Date</Label>
                                    <Input
                                        id="appointment_date"
                                        type="date"
                                        value={data.appointment_date}
                                        onChange={(e) => setData('appointment_date', e.target.value)}
                                        min={today}
                                        required
                                    />
                                    {errors.appointment_date && <p className="text-sm text-red-600">{errors.appointment_date}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="appointment_time">Time</Label>
                                    <select
                                        id="appointment_time"
                                        value={data.appointment_time}
                                        onChange={(e) => setData('appointment_time', e.target.value)}
                                        className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
                                        required
                                    >
                                        <option value="">Select time</option>
                                        {timeSlots.map((time) => (
                                            <option key={time} value={time}>
                                                {time}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.appointment_time && <p className="text-sm text-red-600">{errors.appointment_time}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="type">Appointment Type</Label>
                                    <select
                                        id="type"
                                        value={data.type}
                                        onChange={(e) => setData('type', e.target.value)}
                                        className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
                                        required
                                    >
                                        <option value="">Select appointment type</option>
                                        <option value="maintenance">Maintenance</option>
                                        <option value="dyno_testing">Dyno Testing</option>
                                    </select>
                                    {errors.type && <p className="text-sm text-red-600">{errors.type}</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Notes Section */}
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Additional Notes
                            </CardTitle>
                            <CardDescription>Optional notes or special instructions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Enter any special instructions, customer requests, or relevant information..."
                                    className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
                                    rows={4}
                                />
                                {errors.notes && <p className="text-sm text-red-600">{errors.notes}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Buttons */}
                    <div className="mt-6 flex justify-end gap-4">
                        <Button asChild variant="outline">
                            <Link href="/admin/schedule/appointments">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Creating...' : 'Create Appointment'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
