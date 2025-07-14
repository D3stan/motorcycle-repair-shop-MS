import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Calendar, Edit, Eye, Filter, Mail, MoreHorizontal, Plus, Search, Settings, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Appointment {
    id: number;
    appointment_date: string;
    appointment_time: string;
    type: string;
    status: string;
    customer: string;
    customer_email: string;
    customer_phone: string;
    description: string;
    created_at: string;
    has_work_order: boolean;
}

interface Filters {
    status?: string;
    type?: string;
    search?: string;
    date_from?: string;
    date_to?: string;
}

interface Props {
    appointments: {
        data: Appointment[];
        links: any[];
        meta: any;
    };
    filters: Filters;
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
];

export default function AppointmentsIndex({ appointments, filters }: Props) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [selectedType, setSelectedType] = useState(filters.type || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const handleSearch = () => {
        router.get('/admin/schedule/appointments', {
            search: searchQuery || undefined,
            status: selectedStatus || undefined,
            type: selectedType || undefined,
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
        });
    };

    const handleReset = () => {
        setSearchQuery('');
        setSelectedStatus('');
        setSelectedType('');
        setDateFrom('');
        setDateTo('');
        router.get('/admin/schedule/appointments');
    };

    const handleDelete = (appointmentId: number) => {
        if (confirm('Are you sure you want to delete this appointment?')) {
            router.delete(`/admin/schedule/appointments/${appointmentId}`);
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
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="All Appointments" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">All Appointments</h1>
                        <p className="text-muted-foreground">Manage and track all customer appointments</p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/schedule/appointments/create">
                            <Plus className="mr-2 h-4 w-4" />
                            New Appointment
                        </Link>
                    </Button>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Filter className="h-4 w-4" />
                            Filter Appointments
                        </CardTitle>
                        <CardDescription>Search and filter appointments by various criteria</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Search</label>
                                <div className="relative">
                                    <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                                    <Input
                                        placeholder="Customer name, email..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9"
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => {
                                        setSelectedStatus(e.target.value);
                                        router.get('/admin/schedule/appointments', {
                                            search: searchQuery || undefined,
                                            status: e.target.value || undefined,
                                            type: selectedType || undefined,
                                            date_from: dateFrom || undefined,
                                            date_to: dateTo || undefined,
                                        });
                                    }}
                                    className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="accepted">Accepted</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Type</label>
                                <select
                                    value={selectedType}
                                    onChange={(e) => {
                                        setSelectedType(e.target.value);
                                        router.get('/admin/schedule/appointments', {
                                            search: searchQuery || undefined,
                                            status: selectedStatus || undefined,
                                            type: e.target.value || undefined,
                                            date_from: dateFrom || undefined,
                                            date_to: dateTo || undefined,
                                        });
                                    }}
                                    className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
                                >
                                    <option value="">All Types</option>
                                    <option value="maintenance">Maintenance</option>
                                    <option value="dyno_testing">Dyno Testing</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Date From</label>
                                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Date To</label>
                                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                            </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                            <Button onClick={handleSearch}>
                                <Search className="mr-2 h-4 w-4" />
                                Search
                            </Button>
                            <Button variant="outline" onClick={handleReset}>
                                Reset
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Appointments List */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Appointments</CardTitle>
                                <CardDescription>{appointments.data.length} appointments found</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {appointments.data.length > 0 ? (
                            <div className="space-y-4">
                                {appointments.data.map((appointment) => (
                                    <div
                                        key={appointment.id}
                                        className="rounded-lg border p-4 transition-all duration-200 hover:border-gray-300 hover:shadow-md"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center gap-4">
                                                    <div className="text-lg font-medium">{appointment.customer}</div>
                                                    <div className="flex gap-2">
                                                        {getTypeBadge(appointment.type)}
                                                        {getStatusBadge(appointment.status)}
                                                        {appointment.has_work_order && (
                                                            <Badge variant="outline" className="border-green-200 text-green-600">
                                                                Has Work Order
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 gap-4 text-sm text-gray-600 md:grid-cols-2">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4" />
                                                        {formatDate(appointment.appointment_date)}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="h-4 w-4" />
                                                        {appointment.customer_email}
                                                    </div>
                                                </div>

                                                {appointment.description && (
                                                    <div className="text-sm text-gray-700">
                                                        <span className="font-medium text-gray-600">Description:</span> {appointment.description}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Button asChild variant="outline" size="sm">
                                                    <Link href={`/admin/schedule/appointments/${appointment.id}`}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="outline" size="sm">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/schedule/appointments/${appointment.id}/edit`}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        {!appointment.has_work_order && (
                                                            <DropdownMenuItem onClick={() => handleDelete(appointment.id)} className="text-red-600">
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-muted-foreground py-8 text-center">
                                <Calendar className="mx-auto mb-4 h-12 w-12 opacity-50" />
                                <h3 className="mb-2 text-lg font-medium">No appointments found</h3>
                                <p>Try adjusting your search filters or create a new appointment.</p>
                            </div>
                        )}

                        {/* Pagination */}
                        {appointments.links && (
                            <div className="mt-6 flex justify-center">
                                <div className="flex gap-1">
                                    {appointments.links.map((link: any, index: number) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => link.url && router.get(link.url)}
                                            disabled={!link.url}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
