import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type AdminWorkOrder, type AdminWorkOrderStatistics } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Edit, Trash2, Plus, Wrench, Clock, Users, CheckCircle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Work Orders',
        href: '/admin/work-orders',
    },
];

interface Props {
    workOrders: {
        data: AdminWorkOrder[];
        links?: any[];
        meta?: any;
    };
    statistics: AdminWorkOrderStatistics;
}

export default function WorkOrdersIndex({ workOrders, statistics }: Props) {
    const handleDelete = (workOrderId: number) => {
        if (confirm('Are you sure you want to delete this work order?')) {
            router.delete(`/admin/work-orders/${workOrderId}`);
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
            <Head title="Work Orders Management" />
            
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Work Orders</h1>
                        <p className="text-muted-foreground">Manage all work orders and assignments</p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/work-orders/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Work Order
                        </Link>
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-5">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Total Orders</CardTitle>
                            <CardDescription>All work orders</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold mb-2">
                                {statistics.total}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Total created
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Pending</CardTitle>
                            <CardDescription>Awaiting assignment</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold mb-2 text-yellow-600">
                                {statistics.pending}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Need attention
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">In Progress</CardTitle>
                            <CardDescription>Currently active</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold mb-2 text-blue-600">
                                {statistics.in_progress}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Being worked on
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Completed</CardTitle>
                            <CardDescription>Finished orders</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold mb-2 text-green-600">
                                {statistics.completed}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Successfully done
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Cancelled</CardTitle>
                            <CardDescription>Cancelled orders</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold mb-2 text-red-600">
                                {statistics.cancelled}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Not completed
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Work Orders List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Work Orders</CardTitle>
                        <CardDescription>
                            Manage all work orders and mechanic assignments
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {workOrders.data.length > 0 ? (
                            <div className="space-y-4">
                                {workOrders.data.map((workOrder) => (
                                    <div key={workOrder.id} className="flex items-center justify-between border-b pb-4 last:border-b-0">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                                <Wrench className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <div className="font-medium">
                                                        #{workOrder.id}
                                                    </div>
                                                    <Badge className={getStatusBadge(workOrder.status)}>
                                                        {workOrder.status.replace('_', ' ')}
                                                    </Badge>
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {workOrder.description}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Customer: {workOrder.customer} • {workOrder.motorcycle}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Created: {workOrder.created_at}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center space-x-4">
                                            <div className="text-right">
                                                <div className="text-sm font-medium">
                                                    €{workOrder.total_cost.toFixed(2)}
                                                </div>
                                                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                                    <Users className="h-3 w-3" />
                                                    <span>
                                                        {workOrder.mechanics.length} mechanic{workOrder.mechanics.length !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                                {workOrder.mechanics.length > 0 && (
                                                    <div className="text-xs text-muted-foreground">
                                                        {workOrder.mechanics.map(m => m.name).join(', ')}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="flex items-center space-x-2">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/admin/work-orders/${workOrder.id}`}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/admin/work-orders/${workOrder.id}/edit`}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => handleDelete(workOrder.id)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Wrench className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-2 text-sm font-medium">No work orders</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Get started by creating a new work order.
                                </p>
                                <div className="mt-6">
                                    <Button asChild>
                                        <Link href="/admin/work-orders/create">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Create Work Order
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