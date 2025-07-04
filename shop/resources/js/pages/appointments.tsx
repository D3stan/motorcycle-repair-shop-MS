import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Appointments',
        href: '/appointments',
    },
];

interface Motorcycle {
    id: number;
    label: string;
}

interface Appointment {
    id: number;
    appointment_date: string;
    appointment_time: string;
    type: string;
    status: string;
    motorcycle: {
        id: number;
        brand: string;
        model: string;
        plate: string;
    };
    notes: string;
}

interface AppointmentsProps {
    upcomingAppointments: Appointment[];
    pastAppointments: Appointment[];
    motorcycles: Motorcycle[];
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'confirmed':
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case 'pending':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        case 'in_progress':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        case 'completed':
            return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
        case 'cancelled':
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
};

export default function Appointments({ upcomingAppointments, pastAppointments, motorcycles }: AppointmentsProps) {
    const handleBookAppointment = () => {
        // TODO: Implement booking modal/form
        console.log('Book appointment functionality to be implemented');
    };

    const handleEditAppointment = (appointmentId: number) => {
        // TODO: Implement edit appointment functionality
        console.log(`Edit appointment ${appointmentId} functionality to be implemented`);
    };

    const handleCancelAppointment = (appointmentId: number) => {
        // TODO: Implement cancel appointment functionality
        console.log(`Cancel appointment ${appointmentId} functionality to be implemented`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Appointments" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Appointments</h1>
                        <p className="text-muted-foreground">Manage your motorcycle service appointments</p>
                    </div>
                    <Button onClick={handleBookAppointment}>
                        Book New Appointment
                    </Button>
                </div>

                {/* Upcoming Appointments */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Upcoming Appointments</h2>
                    
                    {upcomingAppointments.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2">
                            {upcomingAppointments.map((appointment) => (
                                <Card key={appointment.id}>
                                    <CardHeader>
                                        <CardTitle className="flex items-center justify-between">
                                            <span>{appointment.motorcycle.brand} {appointment.motorcycle.model}</span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                            </span>
                                        </CardTitle>
                                        <CardDescription>
                                            {appointment.appointment_date} at {appointment.appointment_time} • {appointment.type}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="text-sm">
                                            <p><strong>Motorcycle:</strong> {appointment.motorcycle.plate}</p>
                                            {appointment.notes && <p><strong>Notes:</strong> {appointment.notes}</p>}
                                        </div>
                                        
                                        <div className="flex gap-2">
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => handleEditAppointment(appointment.id)}
                                                className="flex-1"
                                                disabled={appointment.status === 'in_progress'}
                                            >
                                                Edit
                                            </Button>
                                            <Button 
                                                variant="destructive" 
                                                size="sm"
                                                onClick={() => handleCancelAppointment(appointment.id)}
                                                className="flex-1"
                                                disabled={appointment.status === 'in_progress'}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <h3 className="text-lg font-semibold mb-2">No upcoming appointments</h3>
                                <p className="text-muted-foreground mb-4 text-center">
                                    Book your first appointment to get started with our services.
                                </p>
                                <Button onClick={handleBookAppointment}>
                                    Book Your First Appointment
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Appointment History */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Appointment History</h2>
                    
                    {pastAppointments.length > 0 ? (
                        <div className="space-y-3">
                            {pastAppointments.map((appointment) => (
                                <Card key={appointment.id}>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <p className="font-medium">
                                                    {appointment.motorcycle.brand} {appointment.motorcycle.model} • {appointment.type}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {appointment.appointment_date} at {appointment.appointment_time}
                                                </p>
                                                {appointment.notes && (
                                                    <p className="text-sm text-muted-foreground">{appointment.notes}</p>
                                                )}
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-8">
                                <p className="text-muted-foreground text-center">
                                    No appointment history available.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Quick Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Upcoming</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
                            <p className="text-sm text-muted-foreground">
                                {upcomingAppointments.length === 1 ? 'appointment' : 'appointments'}
                            </p>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Completed</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {pastAppointments.filter(apt => apt.status === 'completed').length}
                            </div>
                            <p className="text-sm text-muted-foreground">services done</p>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Motorcycles</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{motorcycles.length}</div>
                            <p className="text-sm text-muted-foreground">registered</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
} 