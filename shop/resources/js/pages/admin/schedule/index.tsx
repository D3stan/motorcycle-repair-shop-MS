import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type AdminScheduleStatistics, type AdminWeeklySchedule, type AdminUpcomingAppointment } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Calendar, Clock, Users, Plus, ChevronLeft, ChevronRight, CalendarDays, AlertCircle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Schedule',
        href: '/admin/schedule',
    },
];

interface Props {
    currentDate: string;
    weeklySchedule: AdminWeeklySchedule[];
    statistics: AdminScheduleStatistics;
    upcomingAppointments: AdminUpcomingAppointment[];
}

export default function ScheduleIndex({ 
    currentDate, 
    weeklySchedule, 
    statistics, 
    upcomingAppointments 
}: Props) {
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

    const navigateWeek = (direction: 'prev' | 'next') => {
        const current = new Date(currentDate);
        const newDate = new Date(current);
        
        if (direction === 'prev') {
            newDate.setDate(current.getDate() - 7);
        } else {
            newDate.setDate(current.getDate() + 7);
        }
        
        router.get('/admin/schedule', { date: newDate.toISOString().split('T')[0] });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Schedule Management" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Schedule Management</h1>
                        <p className="text-muted-foreground">Appointment calendar and availability management</p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild>
                            <Link href="/admin/schedule/appointments/create">
                                <Plus className="h-4 w-4 mr-2" />
                                New Appointment
                            </Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/admin/schedule/appointments">View All Appointments</Link>
                        </Button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                    {/* Today's Appointments */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <CalendarDays className="h-4 w-4" />
                                Today
                            </CardTitle>
                            <CardDescription>Appointments today</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold mb-2">{statistics.today_appointments}</div>
                            <div className="text-sm text-muted-foreground">
                                {new Date().toLocaleDateString()}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pending Appointments */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Pending
                            </CardTitle>
                            <CardDescription>Awaiting confirmation</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold mb-2">{statistics.pending_appointments}</div>
                            <div className="text-sm text-muted-foreground">
                                Need attention
                            </div>
                        </CardContent>
                    </Card>

                    {/* Confirmed Appointments */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Confirmed
                            </CardTitle>
                            <CardDescription>Ready to go</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold mb-2">{statistics.confirmed_appointments}</div>
                            <div className="text-sm text-muted-foreground">
                                Scheduled appointments
                            </div>
                        </CardContent>
                    </Card>

                    {/* Completed Appointments */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Completed
                            </CardTitle>
                            <CardDescription>This month</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold mb-2">{statistics.completed_appointments}</div>
                            <div className="text-sm text-muted-foreground">
                                Services completed
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Weekly Calendar */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Weekly Schedule
                                </CardTitle>
                                <CardDescription>
                                    Week of {formatDate(weeklySchedule[0]?.date || currentDate)}
                                </CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => navigateWeek('prev')}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => navigateWeek('next')}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-7 gap-2">
                            {weeklySchedule.map((day) => (
                                <div key={day.date} className="border rounded-lg p-3 min-h-[120px]">
                                    <div className="font-medium text-sm mb-2">
                                        {day.day_name}
                                    </div>
                                    <div className="text-xl font-bold mb-2 text-muted-foreground">
                                        {day.day_number}
                                    </div>
                                    <div className="space-y-1">
                                        {day.appointments.slice(0, 2).map((appointment) => (
                                            <Link
                                                key={appointment.id} 
                                                href={`/admin/schedule/appointments/${appointment.id}`}
                                                className="block text-xs p-1 bg-blue-50 hover:bg-blue-100 rounded border-l-2 border-blue-500 transition-colors cursor-pointer"
                                            >
                                                <div className="font-medium text-blue-900">{appointment.time}</div>
                                                <div className="text-blue-700 truncate">
                                                    {appointment.customer}
                                                </div>
                                            </Link>
                                        ))}
                                        {day.appointments.length > 2 && (
                                            <Link
                                                href={`/admin/schedule/appointments?date_from=${day.date}&date_to=${day.date}`}
                                                className="text-xs text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                            >
                                                +{day.appointments.length - 2} more
                                            </Link>
                                        )}
                                        {day.appointments.length === 0 && (
                                            <div className="text-xs text-muted-foreground">
                                                No appointments
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Bottom Grid */}
                <div className="grid gap-4 lg:grid-cols-2">
                    {/* Upcoming Appointments */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Appointments</CardTitle>
                            <CardDescription>Next 7 days</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {upcomingAppointments.length > 0 ? (
                                <div className="space-y-4">
                                    {upcomingAppointments.map((appointment) => (
                                        <div key={appointment.id} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium">
                                                    <Link 
                                                        href={`/admin/schedule/appointments/${appointment.id}`}
                                                        className="hover:underline"
                                                    >
                                                        {appointment.customer}
                                                    </Link>
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {appointment.motorcycle} ({appointment.plate})
                                                </p>
                                                <div className="flex gap-2">
                                                    {getTypeBadge(appointment.type)}
                                                    {getStatusBadge(appointment.status)}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-medium">
                                                    {appointment.appointment_date}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {appointment.appointment_time}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-muted-foreground">
                                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p>No upcoming appointments</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>Schedule management shortcuts</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button asChild className="w-full justify-start">
                                <Link href="/admin/schedule/appointments/create">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Schedule New Appointment
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full justify-start">
                                <Link href="/admin/schedule/appointments?status=pending">
                                    <Clock className="h-4 w-4 mr-2" />
                                    Review Pending
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full justify-start">
                                <Link href="/admin/schedule/appointments?status=confirmed">
                                    <Users className="h-4 w-4 mr-2" />
                                    Today's Confirmed
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full justify-start">
                                <Link href="/admin/work-orders">
                                    <AlertCircle className="h-4 w-4 mr-2" />
                                    Manage Work Orders
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
} 