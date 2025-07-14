import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    Check,
    Clock,
    DollarSign,
    Edit,
    ExternalLink,
    Hash,
    Mail,
    Phone,
    Trash2,
    User,
    X,
} from 'lucide-react';

interface Appointment {
    id: number;
    appointment_date: string;
    appointment_time: string;
    type: string;
    status: string;
    notes: string;
    created_at: string;
}

interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string;
    tax_code: string;
}

interface Props {
    appointment: Appointment;
    customer: Customer;
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
        title: 'Appointment Details',
        href: '#',
    },
];

export default function AppointmentShow({ appointment, customer }: Props) {
    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this appointment?')) {
            router.delete(`/admin/schedule/appointments/${appointment.id}`, {
                onSuccess: () => {
                    router.visit('/admin/schedule/appointments');
                },
            });
        }
    };

    const handleAccept = () => {
        if (confirm('Are you sure you want to accept this appointment?')) {
            router.patch(`/admin/schedule/appointments/${appointment.id}/accept`);
        }
    };

    const handleReject = () => {
        if (confirm('Are you sure you want to reject this appointment?')) {
            router.patch(`/admin/schedule/appointments/${appointment.id}/reject`);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'accepted':
                return <Badge className="bg-green-100 text-green-800">Accepted</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
            case 'rejected':
                return <Badge variant="destructive">Rejected</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'maintenance':
                return (
                    <Badge variant="outline" className="border-blue-200 text-blue-600">
                        Maintenance
                    </Badge>
                );
            case 'dyno_testing':
                return (
                    <Badge variant="outline" className="border-purple-200 text-purple-600">
                        Dyno Testing
                    </Badge>
                );
            case 'inspection':
                return (
                    <Badge variant="outline" className="border-orange-200 text-orange-600">
                        Inspection
                    </Badge>
                );
            default:
                return <Badge variant="outline">{type}</Badge>;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Appointment #${appointment.id}`} />
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
                            <h1 className="text-2xl font-bold tracking-tight">Appointment #{appointment.id}</h1>
                            <p className="text-muted-foreground">
                                {formatDate(appointment.appointment_date)} at {appointment.appointment_time}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline">
                            <Link href={`/admin/schedule/appointments/${appointment.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                        {appointment.status === 'pending' && (
                            <>
                                <Button variant="default" onClick={handleAccept} className="bg-green-600 hover:bg-green-700">
                                    <Check className="mr-2 h-4 w-4" />
                                    Accept
                                </Button>
                                <Button variant="destructive" onClick={handleReject}>
                                    <X className="mr-2 h-4 w-4" />
                                    Reject
                                </Button>
                            </>
                        )}
                        <Button variant="outline" onClick={handleDelete}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Appointment Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Appointment Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-muted-foreground text-sm font-medium">Date</label>
                                    <p className="text-lg">{formatDate(appointment.appointment_date)}</p>
                                </div>
                                <div>
                                    <label className="text-muted-foreground text-sm font-medium">Time</label>
                                    <p className="flex items-center gap-2 text-lg">
                                        <Clock className="h-4 w-4" />
                                        {appointment.appointment_time}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-muted-foreground text-sm font-medium">Type</label>
                                    <div className="mt-1">{getTypeBadge(appointment.type)}</div>
                                </div>
                                <div>
                                    <label className="text-muted-foreground text-sm font-medium">Status</label>
                                    <div className="mt-1">{getStatusBadge(appointment.status)}</div>
                                </div>
                            </div>

                            {appointment.notes && (
                                <div>
                                    <label className="text-muted-foreground text-sm font-medium">Notes</label>
                                    <p className="mt-1 rounded-md text-sm">{appointment.notes}</p>
                                </div>
                            )}

                            <div>
                                <label className="text-muted-foreground text-sm font-medium">Created</label>
                                <p className="text-sm">{formatDateTime(appointment.created_at)}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Customer Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Customer Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-muted-foreground text-sm font-medium">Name</label>
                                <p className="text-lg font-medium">{customer.name}</p>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex items-center gap-2">
                                    <Mail className="text-muted-foreground h-4 w-4" />
                                    <a href={`mailto:${customer.email}`} className="text-blue-600 hover:underline">
                                        {customer.email}
                                    </a>
                                </div>
                                {customer.phone && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="text-muted-foreground h-4 w-4" />
                                        <a href={`tel:${customer.phone}`} className="text-blue-600 hover:underline">
                                            {customer.phone}
                                        </a>
                                    </div>
                                )}
                                {customer.tax_code && (
                                    <div className="flex items-center gap-2">
                                        <Hash className="text-muted-foreground h-4 w-4" />
                                        <span className="text-sm">{customer.tax_code}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Button asChild variant="outline" size="sm">
                                    <Link href={`/admin/customers/${customer.id}`}>
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        View Customer
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Additional appointment information can be added here */}
            </div>
        </AppLayout>
    );
}
