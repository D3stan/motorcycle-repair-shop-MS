import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    Clock,
    DollarSign,
    Edit,
    ExternalLink,
    Hash,
    Mail,
    MapPin,
    Phone,
    Plus,
    Settings,
    Trash2,
    User,
    Wrench,
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

interface Motorcycle {
    id: number;
    brand: string;
    model: string;
    year: number;
    plate: string;
    vin: string;
    engine_size: string;
}

interface WorkOrder {
    id: number;
    description: string;
    status: string;
    started_at: string;
    completed_at: string;
    total_cost: number;
}

interface Props {
    appointment: Appointment;
    customer: Customer;
    motorcycle: Motorcycle | null;
    workOrders: WorkOrder[];
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

export default function AppointmentShow({ appointment, customer, motorcycle, workOrders }: Props) {
    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this appointment?')) {
            router.delete(`/admin/schedule/appointments/${appointment.id}`, {
                onSuccess: () => {
                    router.visit('/admin/schedule/appointments');
                },
            });
        }
    };

    const handleCreateWorkOrder = () => {
        if (!motorcycle) {
            alert('Cannot create work order: No motorcycle associated with this customer.');
            return;
        }
        router.get(`/admin/work-orders/create?appointment_id=${appointment.id}&user_id=${customer.id}&motorcycle_id=${motorcycle.id}`);
    };

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
                        {workOrders.length === 0 && (
                            <Button variant="destructive" onClick={handleDelete}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </Button>
                        )}
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

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Motorcycle Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                Motorcycle Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {motorcycle ? (
                                <>
                                    <div>
                                        <label className="text-muted-foreground text-sm font-medium">Vehicle</label>
                                        <p className="text-lg font-medium">
                                            {motorcycle.brand} {motorcycle.model}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-muted-foreground text-sm font-medium">Year</label>
                                            <p>{motorcycle.year}</p>
                                        </div>
                                        <div>
                                            <label className="text-muted-foreground text-sm font-medium">Engine Size</label>
                                            <p>{motorcycle.engine_size}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="text-muted-foreground h-4 w-4" />
                                            <span className="font-medium">License Plate:</span>
                                            <span>{motorcycle.plate}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Hash className="text-muted-foreground h-4 w-4" />
                                            <span className="font-medium">VIN:</span>
                                            <span className="font-mono text-sm">{motorcycle.vin}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/admin/motorcycles/${motorcycle.id}`}>
                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                View Motorcycle
                                            </Link>
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-muted-foreground py-6 text-center">
                                    <Settings className="mx-auto mb-2 h-8 w-8 opacity-50" />
                                    <p>No motorcycle registered</p>
                                    <p className="text-sm">This customer has no motorcycles on file</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Work Orders */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Wrench className="h-5 w-5" />
                                    Work Orders
                                </CardTitle>
                                {workOrders.length === 0 && motorcycle && appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                                    <Button onClick={handleCreateWorkOrder} size="sm">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Work Order
                                    </Button>
                                )}
                            </div>
                            <CardDescription>Work orders associated with this appointment</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {workOrders.length > 0 ? (
                                <div className="space-y-4">
                                    {workOrders.map((workOrder) => (
                                        <div key={workOrder.id} className="rounded-lg border p-4 transition-colors hover:bg-gray-50">
                                            <div className="mb-2 flex items-center justify-between">
                                                <h4 className="font-medium">Work Order #{workOrder.id}</h4>
                                                <Badge variant="outline">{workOrder.status}</Badge>
                                            </div>
                                            <p className="text-muted-foreground mb-3 text-sm">{workOrder.description}</p>

                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                {workOrder.started_at && (
                                                    <div>
                                                        <span className="font-medium">Started:</span> {workOrder.started_at}
                                                    </div>
                                                )}
                                                {workOrder.completed_at && (
                                                    <div>
                                                        <span className="font-medium">Completed:</span> {workOrder.completed_at}
                                                    </div>
                                                )}
                                            </div>

                                            {workOrder.total_cost > 0 && (
                                                <div className="mt-2 flex items-center gap-2 text-sm">
                                                    <DollarSign className="h-4 w-4" />
                                                    <span className="font-medium">Total Cost: ${workOrder.total_cost.toFixed(2)}</span>
                                                </div>
                                            )}

                                            <div className="mt-3 flex gap-2">
                                                <Button asChild variant="outline" size="sm">
                                                    <Link href={`/admin/work-orders/${workOrder.id}`}>
                                                        <ExternalLink className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-muted-foreground py-6 text-center">
                                    <Wrench className="mx-auto mb-2 h-8 w-8 opacity-50" />
                                    <p>No work orders created yet</p>
                                    {motorcycle && appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                                        <p className="text-sm">Create a work order to track maintenance progress</p>
                                    )}
                                    {!motorcycle && (
                                        <p className="text-sm">Cannot create work order without an associated motorcycle</p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
