import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Mechanic Dashboard',
        href: '/dashboard',
    },
];

interface MechanicDashboardProps {
    userType: string;
    assignedWorkOrders: Array<{
        id: number;
        customer: string;
        motorcycle: string;
        description: string;
        status: string;
        created_at: string;
    }>;
    completedThisMonth: number;
    activeWorkSessions: Array<{
        id: number;
        motorcycle: string;
        start_time: string;
        session_type: string;
    }>;
    recentCompletedOrders: Array<{
        id: number;
        customer: string;
        motorcycle: string;
        description: string;
        completed_at: string;
        labor_cost: number;
    }>;
    hoursWorkedThisWeek: number;
    todaySchedule: Array<{
        id: number;
        customer: string;
        motorcycle: string;
        type: string;
        time: string;
        status: string;
    }>;
}

export default function MechanicDashboard({
    assignedWorkOrders,
    completedThisMonth,
    activeWorkSessions,
    recentCompletedOrders,
    hoursWorkedThisWeek,
    todaySchedule,
}: MechanicDashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mechanic Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Mechanic Stats Cards */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                    {/* Assigned Work Orders */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Active Assignments</CardTitle>
                            <CardDescription>Work orders assigned to you</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-2 text-2xl font-bold">{assignedWorkOrders.length}</div>
                            <div className="text-muted-foreground text-sm">Currently assigned</div>
                        </CardContent>
                    </Card>

                    {/* Completed This Month */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Completed This Month</CardTitle>
                            <CardDescription>Work orders finished</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-2 text-2xl font-bold">{completedThisMonth}</div>
                            <div className="text-muted-foreground text-sm">This month total</div>
                        </CardContent>
                    </Card>

                    {/* Hours This Week */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Hours This Week</CardTitle>
                            <CardDescription>Time worked this week</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-2 text-2xl font-bold">{Number(hoursWorkedThisWeek).toFixed(1)}h</div>
                            <div className="text-muted-foreground text-sm">Current week total</div>
                        </CardContent>
                    </Card>

                    {/* Active Sessions */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Active Sessions</CardTitle>
                            <CardDescription>Currently working on</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-2 text-2xl font-bold">{activeWorkSessions.length}</div>
                            <div className="text-muted-foreground text-sm">
                                {activeWorkSessions.length > 0 ? 'In progress' : 'No active sessions'}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-4 lg:grid-cols-3">
                    {/* Assigned Work Orders */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Assigned Work Orders</CardTitle>
                                <CardDescription>Your current assignments and tasks</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {assignedWorkOrders.length > 0 ? (
                                    <div className="space-y-4">
                                        {assignedWorkOrders.map((workOrder) => (
                                            <div key={workOrder.id} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium">{workOrder.customer}</p>
                                                    <p className="text-muted-foreground text-xs">{workOrder.motorcycle}</p>
                                                    <p className="text-muted-foreground text-xs">{workOrder.description}</p>
                                                    <p className="text-muted-foreground text-xs">Created: {workOrder.created_at}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-medium capitalize">{workOrder.status.replace('_', ' ')}</div>
                                                    <Button asChild size="sm" variant="outline" className="mt-1">
                                                        <Link href={`/work-orders/${workOrder.id}`}>View</Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-muted-foreground py-6 text-center">
                                        <p>No assigned work orders</p>
                                        <p className="text-sm">Check with your supervisor for new assignments.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Mechanic Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>Common tasks and tools</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button asChild className="w-full justify-start">
                                <Link href="/work-sessions/start">Start Work Session</Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full justify-start">
                                <Link href="/work-orders">View All Work Orders</Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full justify-start">
                                <Link href="/work-sessions">My Work Sessions</Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full justify-start">
                                <Link href="/inventory/search">Search Parts</Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full justify-start">
                                <Link href="/time-tracking">Time Tracking</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Additional Information Grid */}
                <div className="grid gap-4 lg:grid-cols-2">
                    {/* Today's Schedule */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Today's Schedule</CardTitle>
                            <CardDescription>Appointments and assigned work for today</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {todaySchedule.length > 0 ? (
                                <div className="space-y-4">
                                    {todaySchedule.map((appointment) => (
                                        <div key={appointment.id} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium">{appointment.customer}</p>
                                                <p className="text-muted-foreground text-xs">{appointment.motorcycle}</p>
                                                <p className="text-muted-foreground text-xs">{appointment.type}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-medium">{appointment.time}</div>
                                                <div className="text-muted-foreground text-xs capitalize">{appointment.status}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-muted-foreground py-6 text-center">
                                    <p>No scheduled appointments for today</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Completed Work */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Completed Work</CardTitle>
                            <CardDescription>Your recently finished work orders</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {recentCompletedOrders.length > 0 ? (
                                <div className="space-y-4">
                                    {recentCompletedOrders.map((workOrder) => (
                                        <div key={workOrder.id} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium">{workOrder.customer}</p>
                                                <p className="text-muted-foreground text-xs">{workOrder.motorcycle}</p>
                                                <p className="text-muted-foreground text-xs">{workOrder.description}</p>
                                                <p className="text-muted-foreground text-xs">Completed: {workOrder.completed_at}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-medium">€{Number(workOrder.labor_cost || 0).toFixed(2)}</div>
                                                <div className="text-muted-foreground text-xs">Labor</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-muted-foreground py-6 text-center">
                                    <p>No recent completed work</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Active Work Sessions */}
                {activeWorkSessions.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Active Work Sessions</CardTitle>
                            <CardDescription>Currently ongoing work sessions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                {activeWorkSessions.map((session) => (
                                    <div key={session.id} className="flex items-center justify-between rounded-lg border p-3">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">{session.motorcycle}</p>
                                            <p className="text-muted-foreground text-xs">{session.session_type}</p>
                                            <p className="text-muted-foreground text-xs">Started: {session.start_time}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button asChild size="sm" variant="outline">
                                                <Link href={`/work-sessions/${session.id}`}>View</Link>
                                            </Button>
                                            <Button asChild size="sm">
                                                <Link href={`/work-sessions/${session.id}/end`}>End</Link>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
