import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type AdminScheduleStatistics, type AdminUpcomingAppointment, type AdminWeeklySchedule, type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { AlertCircle, Calendar, CalendarDays, ChevronLeft, ChevronRight, Clock, Plus, Users } from 'lucide-react';

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

export default function ScheduleIndex({ currentDate, weeklySchedule, statistics, upcomingAppointments }: Props) {
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
            day: 'numeric',
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
                                <Plus className="mr-2 h-4 w-4" />
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
                            <CardTitle className="flex items-center gap-2 text-base">
                                <CalendarDays className="h-4 w-4" />
                                Today
                            </CardTitle>
                            <CardDescription>Appointments today</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-2 text-2xl font-bold">{statistics.today_appointments}</div>
                            <div className="text-muted-foreground text-sm">{new Date().toLocaleDateString()}</div>
                        </CardContent>
                    </Card>

                    {/* Pending Appointments */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Clock className="h-4 w-4" />
                                Pending
                            </CardTitle>
                            <CardDescription>Awaiting confirmation</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-2 text-2xl font-bold">{statistics.pending_appointments}</div>
                            <div className="text-muted-foreground text-sm">Need attention</div>
                        </CardContent>
                    </Card>

                    {/* Confirmed Appointments */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Users className="h-4 w-4" />
                                Accepted
                            </CardTitle>
                            <CardDescription>Ready to proceed</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-2 text-2xl font-bold">{statistics.accepted_appointments}</div>
                            <div className="text-muted-foreground text-sm">Accepted appointments</div>
                        </CardContent>
                    </Card>

                    {/* Completed Appointments */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Calendar className="h-4 w-4" />
                                Rejected
                            </CardTitle>
                            <CardDescription>Not scheduled</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-2 text-2xl font-bold">{statistics.rejected_appointments}</div>
                            <div className="text-muted-foreground text-sm">Rejected appointments</div>
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
                                <CardDescription>Week of {formatDate(weeklySchedule[0]?.date || currentDate)}</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-7 gap-2">
                            {weeklySchedule.map((day) => (
                                <div key={day.date} className="min-h-[120px] rounded-lg border p-3">
                                    <div className="mb-2 text-sm font-medium">{day.day_name}</div>
                                    <div className="text-muted-foreground mb-2 text-xl font-bold">{day.day_number}</div>
                                    <div className="space-y-1">
                                        {day.appointments.slice(0, 2).map((appointment) => (
                                            <Link
                                                key={appointment.id}
                                                href={`/admin/schedule/appointments/${appointment.id}`}
                                                className="block cursor-pointer rounded border-l-2 border-blue-500 bg-blue-50 p-1 text-xs transition-colors hover:bg-blue-100"
                                            >
                                                <div className="font-medium text-blue-900">{appointment.time}</div>
                                                <div className="truncate text-blue-700">{appointment.customer}</div>
                                            </Link>
                                        ))}
                                        {day.appointments.length > 2 && (
                                            <Link
                                                href={`/admin/schedule/appointments?date_from=${day.date}&date_to=${day.date}`}
                                                className="cursor-pointer text-xs text-blue-600 hover:text-blue-800 hover:underline"
                                            >
                                                +{day.appointments.length - 2} more
                                            </Link>
                                        )}
                                        {day.appointments.length === 0 && <div className="text-muted-foreground text-xs">No appointments</div>}
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
                                                    <Link href={`/admin/schedule/appointments/${appointment.id}`} className="hover:underline">
                                                        {appointment.customer}
                                                    </Link>
                                                </p>
                                                <p className="text-muted-foreground text-xs">
                                                    {appointment.description}
                                                </p>
                                                <div className="flex gap-2">
                                                    {getTypeBadge(appointment.type)}
                                                    {getStatusBadge(appointment.status)}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-medium">{appointment.appointment_date}</div>
                                                <div className="text-muted-foreground text-xs">{appointment.appointment_time}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-muted-foreground py-6 text-center">
                                    <Calendar className="mx-auto mb-2 h-8 w-8 opacity-50" />
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
                                    <Plus className="mr-2 h-4 w-4" />
                                    Schedule New Appointment
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full justify-start">
                                <Link href="/admin/schedule/appointments?status=pending">
                                    <Clock className="mr-2 h-4 w-4" />
                                    Review Pending
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full justify-start">
                                <Link href="/admin/schedule/appointments?status=accepted">
                                    <Users className="mr-2 h-4 w-4" />
                                    Today's Accepted
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full justify-start">
                                <Link href="/admin/work-orders">
                                    <AlertCircle className="mr-2 h-4 w-4" />
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
