import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type AdminStaffDetails, type AdminStaffStatistics, type AdminWorkOrder } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Edit, Trash2, Users, Wrench, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface Props {
    staff: AdminStaffDetails;
    assignedWorkOrders: AdminWorkOrder[];
    statistics: AdminStaffStatistics;
}

export default function StaffShow({ staff, assignedWorkOrders, statistics }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Admin Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Staff Management',
            href: '/admin/staff',
        },
        {
            title: `${staff.first_name} ${staff.last_name}`,
            href: `/admin/staff/${staff.id}`,
        },
    ];

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this staff member?')) {
            router.delete(`/admin/staff/${staff.id}`);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusColors = {
            pending: 'bg-yellow-100 text-yellow-800',
            in_progress: 'bg-blue-100 text-blue-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${staff.first_name} ${staff.last_name} - Staff Details`} />
            
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">{staff.first_name} {staff.last_name}</h1>
                        <p className="text-muted-foreground">Mechanic Details</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" asChild>
                            <Link href="/admin/staff">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Staff
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={`/admin/staff/${staff.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Total Work Orders</CardTitle>
                            <CardDescription>All assignments</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold mb-2">
                                {statistics.total_work_orders}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Ever assigned
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Active Orders</CardTitle>
                            <CardDescription>Currently working</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold mb-2">
                                {statistics.active_work_orders}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                In progress
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Completed</CardTitle>
                            <CardDescription>Finished orders</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold mb-2">
                                {statistics.completed_work_orders}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Successfully completed
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Completion Rate</CardTitle>
                            <CardDescription>Success percentage</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold mb-2">
                                {statistics.completion_rate}%
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Overall performance
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    {/* Staff Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Users className="mr-2 h-5 w-5" />
                                Staff Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Full Name</div>
                                <div className="text-lg font-medium">{staff.first_name} {staff.last_name}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Email</div>
                                <div>{staff.email}</div>
                            </div>
                            {staff.phone && (
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Phone</div>
                                    <div>{staff.phone}</div>
                                </div>
                            )}
                            {staff.tax_code && (
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Tax Code</div>
                                    <div>{staff.tax_code}</div>
                                </div>
                            )}
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Member Since</div>
                                <div>{staff.created_at}</div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Current Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <AlertCircle className="mr-2 h-5 w-5" />
                                Current Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Availability</span>
                                <Badge variant={statistics.active_work_orders > 0 ? 'default' : 'secondary'}>
                                    {statistics.active_work_orders > 0 ? 'Busy' : 'Available'}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Workload</span>
                                <span className="text-sm">
                                    {statistics.active_work_orders} active orders
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Performance</span>
                                <div className="flex items-center space-x-1">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span className="text-sm">{statistics.completion_rate}% completion</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button asChild className="w-full justify-start">
                                <Link href={`/admin/work-orders/create?mechanic=${staff.id}`}>
                                    <Wrench className="mr-2 h-4 w-4" />
                                    Assign Work Order
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full justify-start">
                                <Link href={`/admin/staff/${staff.id}/edit`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Information
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full justify-start">
                                <Link href={`/admin/work-orders?mechanic=${staff.id}`}>
                                    <Clock className="mr-2 h-4 w-4" />
                                    View All Work Orders
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Assigned Work Orders */}
                <Card>
                    <CardHeader>
                        <CardTitle>Assigned Work Orders</CardTitle>
                        <CardDescription>
                            Work orders currently assigned to this mechanic
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {assignedWorkOrders.length > 0 ? (
                            <div className="space-y-4">
                                {assignedWorkOrders.map((workOrder) => (
                                    <div key={workOrder.id} className="flex items-center justify-between border-b pb-4 last:border-b-0">
                                        <div className="space-y-1">
                                            <div className="flex items-center space-x-2">
                                                <Link 
                                                    href={`/admin/work-orders/${workOrder.id}`}
                                                    className="font-medium hover:underline"
                                                >
                                                    #{workOrder.id}
                                                </Link>
                                                <Badge className={getStatusBadge(workOrder.status)}>
                                                    {workOrder.status.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {workOrder.description}
                                            </p>
                                            <div className="text-xs text-muted-foreground">
                                                Customer: {workOrder.customer} • Motorcycle: {workOrder.motorcycle}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                Assigned: {workOrder.assigned_at || 'Not specified'}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium">
                                                €{workOrder.total_cost.toFixed(2)}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {workOrder.created_at}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Wrench className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-2 text-sm font-medium">No work orders assigned</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    This mechanic doesn't have any work orders assigned yet.
                                </p>
                                <div className="mt-6">
                                    <Button asChild>
                                        <Link href={`/admin/work-orders/create?mechanic=${staff.id}`}>
                                            <Wrench className="mr-2 h-4 w-4" />
                                            Assign Work Order
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
} 