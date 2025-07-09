import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    Calendar, 
    Clock, 
    User, 
    Settings, 
    FileText,
    ArrowLeft,
    Save
} from 'lucide-react';

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

interface Appointment {
    id: number;
    user_id: number;
    motorcycle_id: number;
    appointment_date: string;
    appointment_time: string;
    type: string;
    status: string;
    notes: string;
}

interface Props {
    appointment: Appointment;
    customers: Customer[];
}

interface AppointmentFormData {
    user_id: string;
    motorcycle_id: string;
    appointment_date: string;
    appointment_time: string;
    type: string;
    status: string;
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
        title: 'Edit Appointment',
        href: '#',
    },
];

export default function AppointmentEdit({ appointment, customers }: Props) {
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [availableMotorcycles, setAvailableMotorcycles] = useState<any[]>([]);

    const { data, setData, put, processing, errors } = useForm<AppointmentFormData>({
        user_id: appointment.user_id.toString(),
        motorcycle_id: appointment.motorcycle_id.toString(),
        appointment_date: appointment.appointment_date,
        appointment_time: appointment.appointment_time.substring(0, 5), // Extract HH:MM from time string
        type: appointment.type,
        status: appointment.status,
        notes: appointment.notes || '',
    });

    useEffect(() => {
        if (data.user_id) {
            const customer = customers.find(c => c.id.toString() === data.user_id);
            setSelectedCustomer(customer || null);
            setAvailableMotorcycles(customer?.motorcycles || []);
            
            // If the selected customer doesn't have the current motorcycle, reset motorcycle selection
            if (customer && !customer.motorcycles.find(m => m.id.toString() === data.motorcycle_id)) {
                setData('motorcycle_id', '');
            }
        }
    }, [data.user_id]);

    // Initialize customer and motorcycles on component mount
    useEffect(() => {
        const customer = customers.find(c => c.id === appointment.user_id);
        setSelectedCustomer(customer || null);
        setAvailableMotorcycles(customer?.motorcycles || []);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/schedule/appointments/${appointment.id}`);
    };

    // Generate time slots from 8:00 to 18:00
    const timeSlots = Array.from({ length: 11 }, (_, i) => {
        const hour = 8 + i;
        return `${hour.toString().padStart(2, '0')}:00`;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'confirmed':
                return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
            case 'in_progress':
                return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
            case 'completed':
                return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>;
            case 'cancelled':
                return <Badge variant="destructive">Cancelled</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Appointment #${appointment.id}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button asChild variant="outline" size="sm">
                            <Link href={`/admin/schedule/appointments/${appointment.id}`}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Appointment
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Edit Appointment #{appointment.id}</h1>
                            <p className="text-muted-foreground">Update appointment details and settings</p>
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
                                <CardDescription>Update customer and motorcycle selection</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="user_id">Customer</Label>
                                    <select
                                        id="user_id"
                                        value={data.user_id}
                                        onChange={(e) => setData('user_id', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                        required
                                    >
                                        <option value="">Select a customer</option>
                                        {customers.map((customer) => (
                                            <option key={customer.id} value={customer.id}>
                                                {customer.name} ({customer.email})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.user_id && (
                                        <p className="text-sm text-red-600">{errors.user_id}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="motorcycle_id">Motorcycle</Label>
                                    <select
                                        id="motorcycle_id"
                                        value={data.motorcycle_id}
                                        onChange={(e) => setData('motorcycle_id', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                        required
                                        disabled={!selectedCustomer}
                                    >
                                        <option value="">Select a motorcycle</option>
                                        {availableMotorcycles.map((motorcycle) => (
                                            <option key={motorcycle.id} value={motorcycle.id}>
                                                {motorcycle.name} - {motorcycle.plate} ({motorcycle.year})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.motorcycle_id && (
                                        <p className="text-sm text-red-600">{errors.motorcycle_id}</p>
                                    )}
                                </div>

                            </CardContent>
                        </Card>

                        {/* Appointment Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Appointment Details
                                </CardTitle>
                                <CardDescription>Update date, time, type and status</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="appointment_date">Date</Label>
                                    <Input
                                        id="appointment_date"
                                        type="date"
                                        value={data.appointment_date}
                                        onChange={(e) => setData('appointment_date', e.target.value)}
                                        required
                                    />
                                    {errors.appointment_date && (
                                        <p className="text-sm text-red-600">{errors.appointment_date}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="appointment_time">Time</Label>
                                    <select
                                        id="appointment_time"
                                        value={data.appointment_time}
                                        onChange={(e) => setData('appointment_time', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                        required
                                    >
                                        <option value="">Select time</option>
                                        {timeSlots.map((time) => (
                                            <option key={time} value={time}>
                                                {time}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.appointment_time && (
                                        <p className="text-sm text-red-600">{errors.appointment_time}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="type">Appointment Type</Label>
                                    <select
                                        id="type"
                                        value={data.type}
                                        onChange={(e) => setData('type', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                        required
                                    >
                                        <option value="">Select appointment type</option>
                                        <option value="maintenance">Maintenance</option>
                                        <option value="dyno_testing">Dyno Testing</option>
                                        <option value="inspection">Inspection</option>
                                    </select>
                                    {errors.type && (
                                        <p className="text-sm text-red-600">{errors.type}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <select
                                        id="status"
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                        required
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                    {errors.status && (
                                        <p className="text-sm text-red-600">{errors.status}</p>
                                    )}
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-sm text-muted-foreground">Current status:</span>
                                        {getStatusBadge(data.status)}
                                    </div>
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
                            <CardDescription>Update notes or special instructions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Enter any special instructions, customer requests, or relevant information..."
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    rows={4}
                                />
                                {errors.notes && (
                                    <p className="text-sm text-red-600">{errors.notes}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Buttons */}
                    <div className="flex justify-end gap-4 mt-6">
                        <Button asChild variant="outline">
                            <Link href={`/admin/schedule/appointments/${appointment.id}`}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Updating...' : 'Update Appointment'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
} 