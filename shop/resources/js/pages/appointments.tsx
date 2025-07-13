import BookAppointmentModal from '@/components/book-appointment-modal';
import CancelAppointmentModal from '@/components/cancel-appointment-modal';
import EditAppointmentModal from '@/components/edit-appointment-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

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
    id: string;
    appointment_date: string;
    appointment_time: string;
    type: string;
    status: string;
    motorcycle: {
        id: number;
        brand: string;
        model: string;
        plate: string;
    } | null;
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
    const [isBookModalOpen, setIsBookModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    const handleBookAppointment = () => {
        setIsBookModalOpen(true);
    };

    const handleEditAppointment = (appointmentId: number) => {
        const appointment = upcomingAppointments.find((apt) => apt.id === appointmentId);
        if (appointment) {
            setSelectedAppointment(appointment);
            setIsEditModalOpen(true);
        }
    };

    const handleCancelAppointment = (appointmentId: number) => {
        const appointment = upcomingAppointments.find((apt) => apt.id === appointmentId);
        if (appointment) {
            setSelectedAppointment(appointment);
            setIsCancelModalOpen(true);
        }
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
                    <Button onClick={handleBookAppointment}>Book New Appointment</Button>
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
                                            <span>
                                                {appointment.motorcycle
                                                    ? `${appointment.motorcycle.brand} ${appointment.motorcycle.model}`
                                                    : appointment.type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                                            </span>
                                            <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(appointment.status)}`}>
                                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                            </span>
                                        </CardTitle>
                                        <CardDescription>
                                            {appointment.appointment_date} at {appointment.appointment_time} •{' '}
                                            {appointment.type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="text-sm">
                                            {appointment.motorcycle && (
                                                <p>
                                                    <strong>Motorcycle:</strong> {appointment.motorcycle.plate}
                                                </p>
                                            )}
                                            {appointment.notes && (
                                                <p>
                                                    <strong>Notes:</strong> {appointment.notes}
                                                </p>
                                            )}
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
                                <h3 className="mb-2 text-lg font-semibold">No upcoming appointments</h3>
                                <p className="text-muted-foreground mb-4 text-center">
                                    Book your first appointment to get started with our services.
                                </p>
                                <Button onClick={handleBookAppointment}>Book Your First Appointment</Button>
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
                                                    {appointment.motorcycle
                                                        ? `${appointment.motorcycle.brand} ${appointment.motorcycle.model} • `
                                                        : ''}
                                                    {appointment.type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                                                </p>
                                                <p className="text-muted-foreground text-sm">
                                                    {appointment.appointment_date} at {appointment.appointment_time}
                                                </p>
                                                {appointment.notes && <p className="text-muted-foreground text-sm">{appointment.notes}</p>}
                                            </div>
                                            <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(appointment.status)}`}>
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
                                <p className="text-muted-foreground text-center">No appointment history available.</p>
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
                            <p className="text-muted-foreground text-sm">{upcomingAppointments.length === 1 ? 'appointment' : 'appointments'}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Completed</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{pastAppointments.filter((apt) => apt.status === 'completed').length}</div>
                            <p className="text-muted-foreground text-sm">services done</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Motorcycles</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{motorcycles.length}</div>
                            <p className="text-muted-foreground text-sm">registered</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Modal Components */}
                <BookAppointmentModal open={isBookModalOpen} onOpenChange={setIsBookModalOpen} motorcycles={motorcycles} />

                <EditAppointmentModal
                    open={isEditModalOpen}
                    onOpenChange={setIsEditModalOpen}
                    appointment={selectedAppointment}
                    motorcycles={motorcycles}
                />

                <CancelAppointmentModal open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen} appointment={selectedAppointment} />
            </div>
        </AppLayout>
    );
}
