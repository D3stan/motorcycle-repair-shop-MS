import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface DashboardProps {
    userType?: string;
    upcomingAppointments: Array<{
        id: number;
        date: string;
        time: string;
        type: string;
        motorcycle: string;
        status: string;
    }>;
    activeWorkOrdersCount: number;
    outstandingBalance: number;
    pendingInvoicesCount: number;
    recentActivity: Array<{
        id: number;
        action: string;
        description: string;
        date: string;
        amount: string | null;
    }>;
    motorcyclesCount?: number;
}

export default function Dashboard({ 
    userType = 'customer',
    upcomingAppointments,
    activeWorkOrdersCount,
    outstandingBalance,
    pendingInvoicesCount,
    recentActivity,
    motorcyclesCount = 0
}: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Quick Stats Cards */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                    {/* Current Appointments Status */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Upcoming Appointments</CardTitle>
                            <CardDescription>Your scheduled visits</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold mb-2">{upcomingAppointments.length}</div>
                            {upcomingAppointments.length > 0 && (
                                <div className="text-sm text-muted-foreground">
                                    Next: {upcomingAppointments[0].date} at {upcomingAppointments[0].time}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Active Work Orders */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Active Work Orders</CardTitle>
                            <CardDescription>Services in progress</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold mb-2">{activeWorkOrdersCount}</div>
                            <div className="text-sm text-muted-foreground">
                                {activeWorkOrdersCount > 0 ? 'Services in progress' : 'No active services'}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Total Outstanding */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Outstanding Balance</CardTitle>
                            <CardDescription>Current total costs</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold mb-2">
                                €{Number(outstandingBalance || 0).toFixed(2)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {pendingInvoicesCount > 0 ? `${pendingInvoicesCount} pending invoices` : 'All invoices paid'}
                            </div>
                        </CardContent>
                    </Card>

                    {/* My Motorcycles */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">My Motorcycles</CardTitle>
                            <CardDescription>Registered vehicles</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold mb-2">{motorcyclesCount}</div>
                            <div className="text-sm text-muted-foreground">
                                {motorcyclesCount === 0 ? 'No motorcycles added' : `${motorcyclesCount} registered`}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Area */}
                <div className="grid gap-4 lg:grid-cols-3">
                    {/* Recent Activity */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                                <CardDescription>Your latest service history and transactions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {recentActivity.length > 0 ? (
                                    <div className="space-y-4">
                                        {recentActivity.map((activity) => (
                                            <div key={activity.id} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium">{activity.action}</p>
                                                    <p className="text-xs text-muted-foreground">{activity.description}</p>
                                                    <p className="text-xs text-muted-foreground">{activity.date}</p>
                                                </div>
                                                {activity.amount && (
                                                    <div className="text-sm font-medium">{activity.amount}</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-muted-foreground">
                                        <p>No recent activity</p>
                                        <p className="text-sm">Start by booking an appointment or adding a motorcycle to your garage.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>Common tasks and shortcuts</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button asChild className="w-full justify-start">
                                <Link href="/appointments">Book Appointment</Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full justify-start">
                                <Link href="/garage">Manage Motorcycles</Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full justify-start">
                                <Link href="/work-orders">View Work Orders</Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full justify-start">
                                <Link href="/invoices">Download Invoices</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
