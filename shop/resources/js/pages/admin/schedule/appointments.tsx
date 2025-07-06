import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { 
    Calendar, 
    Clock, 
    Search, 
    Filter, 
    Plus, 
    Eye, 
    Edit, 
    Trash2,
    MoreHorizontal,
    Phone,
    Mail,
    Settings,
    ChevronDown
} from 'lucide-react';

interface Appointment {
    id: number;
    appointment_date: string;
    appointment_time: string;
    type: string;
    status: string;
    customer: string;
    customer_email: string;
    customer_phone: string;
    motorcycle: string;
    notes: string;
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
                return <Badge variant="outline" className="text-blue-600 border-blue-200">Maintenance</Badge>;
            case 'dyno_testing':
                return <Badge variant="outline" className="text-purple-600 border-purple-200">Dyno Testing</Badge>;
            case 'inspection':
                return <Badge variant="outline" className="text-orange-600 border-orange-200">Inspection</Badge>;
            default:
                return <Badge variant="outline">{type}</Badge>;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
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
                            <Plus className="h-4 w-4 mr-2" />
                            New Appointment
                        </Link>
                    </Button>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
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
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Customer name, email, plate..."
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
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Type</label>
                                <select
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                >
                                    <option value="">All Types</option>
                                    <option value="maintenance">Maintenance</option>
                                    <option value="dyno_testing">Dyno Testing</option>
                                    <option value="inspection">Inspection</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Date From</label>
                                <Input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Date To</label>
                                <Input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                />
                            </div>
                        </div>
                        
                        <div className="flex gap-2 mt-4">
                            <Button onClick={handleSearch}>
                                <Search className="h-4 w-4 mr-2" />
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
                                <CardDescription>
                                    {appointments.meta?.total || 0} appointments found
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {appointments.data.length > 0 ? (
                            <div className="space-y-4">
                                {appointments.data.map((appointment) => (
                                    <div key={appointment.id} className="border rounded-lg p-4 hover:bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center gap-4">
                                                    <div className="font-medium text-lg">
                                                        {appointment.customer}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {getTypeBadge(appointment.type)}
                                                        {getStatusBadge(appointment.status)}
                                                        {appointment.has_work_order && (
                                                            <Badge variant="outline" className="text-green-600 border-green-200">
                                                                Has Work Order
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4" />
                                                        {formatDate(appointment.appointment_date)} at {appointment.appointment_time}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="h-4 w-4" />
                                                        {appointment.customer_email}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Settings className="h-4 w-4" />
                                                        {appointment.motorcycle}
                                                    </div>
                                                </div>

                                                {appointment.notes && (
                                                    <div className="text-sm text-muted-foreground">
                                                        <span className="font-medium">Notes:</span> {appointment.notes}
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
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        {!appointment.has_work_order && (
                                                            <DropdownMenuItem
                                                                onClick={() => handleDelete(appointment.id)}
                                                                className="text-red-600"
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-2" />
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
                            <div className="text-center py-8 text-muted-foreground">
                                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <h3 className="text-lg font-medium mb-2">No appointments found</h3>
                                <p>Try adjusting your search filters or create a new appointment.</p>
                            </div>
                        )}

                        {/* Pagination */}
                        {appointments.links && (
                            <div className="flex justify-center mt-6">
                                <div className="flex gap-1">
                                    {appointments.links.map((link: any, index: number) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? "default" : "outline"}
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