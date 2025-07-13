import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/dashboard',
    },
];

interface AdminDashboardProps {
    userType: string;
    currentMonthRevenue: number;
    activeWorkOrdersCount: number;
    pendingAppointmentsCount: number;
    totalCustomersCount: number;
    recentWorkOrders: Array<{
        id: number;
        type: string;
        customer: string;
        motorcycle: string;
        description: string;
        status: string;
        formatted_date: string;
        mechanics: string;
    }>;
    recentAppointments: Array<{
        id: number;
        customer: string;
        motorcycle: string;
        type: string;
        appointment_date: string;
        appointment_time: string;
        status: string;
    }>;
    workOrdersByStatus: Record<string, number>;
    monthlyRevenue: Array<{
        month: string;
        revenue: number;
    }>;
    lowStockParts: Array<{
        id: number;
        name: string;
        current_stock: number;
        minimum_stock: number;
        supplier: string;
    }>;
}

export default function AdminDashboard({ 
    currentMonthRevenue,
    activeWorkOrdersCount,
    pendingAppointmentsCount,
    totalCustomersCount,
    recentWorkOrders,
    recentAppointments,
    lowStockParts
}: AdminDashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Admin Stats Cards */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                    {/* Monthly Revenue */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Monthly Revenue</CardTitle>
                            <CardDescription>Current month earnings</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold mb-2">
                                €{Number(currentMonthRevenue || 0).toFixed(2)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                From completed work & sessions
                            </div>
                        </CardContent>
                    </Card>

                    {/* Active Work Orders */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Active Work</CardTitle>
                            <CardDescription>Orders & sessions in progress</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold mb-2">{activeWorkOrdersCount}</div>
                            <div className="text-sm text-muted-foreground">
                                Maintenance & sessions
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pending Appointments */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Pending Appointments</CardTitle>
                            <CardDescription>Awaiting confirmation</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold mb-2">{pendingAppointmentsCount}</div>
                            <div className="text-sm text-muted-foreground">
                                Need confirmation
                            </div>
                        </CardContent>
                    </Card>

                    {/* Total Customers */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Total Customers</CardTitle>
                            <CardDescription>Registered users</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold mb-2">{totalCustomersCount}</div>
                            <div className="text-sm text-muted-foreground">
                                Active customer base
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-4 lg:grid-cols-3">
                    {/* Recent Work Orders */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Work Orders & Sessions</CardTitle>
                                <CardDescription>Latest maintenance and sessions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {recentWorkOrders.length > 0 ? (
                                    <div className="space-y-4">
                                        {recentWorkOrders.map((workOrder) => (
                                            <div key={workOrder.id} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-medium">{workOrder.customer}</p>
                                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                                            workOrder.type === 'maintenance' 
                                                                ? 'bg-blue-100 text-blue-700' 
                                                                : 'bg-green-100 text-green-700'
                                                        }`}>
                                                            {workOrder.type === 'maintenance' ? 'Maintenance' : 'Session'}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">{workOrder.motorcycle}</p>
                                                    <p className="text-xs text-muted-foreground">{workOrder.description}</p>
                                                    <p className="text-xs text-muted-foreground">Created: {workOrder.formatted_date}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-medium capitalize">{workOrder.status.replace('_', ' ')}</div>
                                                    <div className="text-xs text-muted-foreground">{workOrder.mechanics || 'Not assigned'}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-muted-foreground">
                                        <p>No recent work orders</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Admin Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Admin Actions</CardTitle>
                            <CardDescription>Management shortcuts</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button asChild className="w-full justify-start">
                                <Link href="/admin/work-orders/create">Create Work Order</Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full justify-start">
                                <Link href="/admin/customers">Manage Customers</Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full justify-start">
                                <Link href="/admin/staff">Manage Staff</Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full justify-start">
                                <Link href="/admin/inventory">Inventory</Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full justify-start">
                                <Link href="/admin/suppliers">Suppliers</Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full justify-start">
                                <Link href="/admin/reports">Financial Reports</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Additional Information Grid */}
                <div className="grid gap-4 lg:grid-cols-2">
                    {/* Recent Appointments */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Appointments</CardTitle>
                            <CardDescription>Latest bookings and scheduling</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {recentAppointments.length > 0 ? (
                                <div className="space-y-4">
                                    {recentAppointments.map((appointment) => (
                                        <div key={appointment.id} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium">{appointment.customer}</p>
                                                <p className="text-xs text-muted-foreground">{appointment.motorcycle}</p>
                                                <p className="text-xs text-muted-foreground">{appointment.type}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-medium">{appointment.appointment_date}</div>
                                                <div className="text-xs text-muted-foreground">{appointment.appointment_time}</div>
                                                <div className="text-xs text-muted-foreground capitalize">{appointment.status}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-muted-foreground">
                                    <p>No recent appointments</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Low Stock Alert */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Low Stock Alert</CardTitle>
                            <CardDescription>Parts requiring restocking</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {lowStockParts.length > 0 ? (
                                <div className="space-y-4">
                                    {lowStockParts.map((part) => (
                                        <div key={part.id} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium">{part.name}</p>
                                                <p className="text-xs text-muted-foreground">Supplier: {part.supplier}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-medium text-orange-600">
                                                    {part.current_stock}/{part.minimum_stock}
                                                </div>
                                                <div className="text-xs text-muted-foreground">Stock/Min</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-muted-foreground">
                                    <p>All parts adequately stocked</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
} 