import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type AdminWorkOrder, type AdminWorkOrderStatistics, type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Eye, Plus, Trash2, Users, Wrench } from 'lucide-react';

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
    const handleDelete = (workItem: AdminWorkOrder) => {
        const itemType = workItem.type === 'work_session' ? 'work session' : 'work order';
        if (confirm(`Are you sure you want to delete this ${itemType}?`)) {
            if (workItem.type === 'work_session') {
                router.delete(`/admin/work-orders/${workItem.id}?type=work_session`);
            } else {
                router.delete(`/admin/work-orders/${workItem.id}`);
            }
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
                        <h1 className="text-3xl font-bold">Work Orders & Sessions</h1>
                        <p className="text-muted-foreground">Manage all work orders and work sessions</p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/work-orders/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Work Order
                        </Link>
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Total Work</CardTitle>
                            <CardDescription>Orders & Sessions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-2 text-2xl font-bold">{statistics.total}</div>
                            <div className="text-muted-foreground text-xs">
                                {statistics.work_orders_count || 0} orders / {statistics.work_sessions_count || 0} sessions
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Pending</CardTitle>
                            <CardDescription>Awaiting assignment</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-2 text-2xl font-bold text-yellow-600">{statistics.pending}</div>
                            <div className="text-muted-foreground text-sm">Need attention</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">In Progress</CardTitle>
                            <CardDescription>Currently active</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-2 text-2xl font-bold text-blue-600">{statistics.in_progress}</div>
                            <div className="text-muted-foreground text-sm">Being worked on</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Completed</CardTitle>
                            <CardDescription>Finished orders</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-2 text-2xl font-bold text-green-600">{statistics.completed}</div>
                            <div className="text-muted-foreground text-sm">Successfully done</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Cancelled</CardTitle>
                            <CardDescription>Cancelled orders</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-2 text-2xl font-bold text-red-600">{statistics.cancelled}</div>
                            <div className="text-muted-foreground text-sm">Not completed</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Work Orders & Sessions List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Work Orders & Sessions</CardTitle>
                        <CardDescription>Manage all work orders and work sessions with mechanic assignments</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {workOrders.data.length > 0 ? (
                            <div className="space-y-4">
                                {workOrders.data.map((workItem) => (
                                    <div key={workItem.id} className="flex items-center justify-between border-b pb-4 last:border-b-0">
                                        <div className="flex items-center space-x-4">
                                            <div
                                                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                                    workItem.type === 'work_order' ? 'bg-blue-100' : 'bg-green-100'
                                                }`}
                                            >
                                                <Wrench
                                                    className={`h-5 w-5 ${workItem.type === 'work_order' ? 'text-blue-600' : 'text-green-600'}`}
                                                />
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <div className="font-medium">#{workItem.id}</div>
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            workItem.type === 'work_order'
                                                                ? 'border-blue-200 text-blue-700'
                                                                : 'border-green-200 text-green-700'
                                                        }
                                                    >
                                                        {workItem.type_label}
                                                    </Badge>
                                                    <Badge className={getStatusBadge(workItem.status)}>{workItem.status.replace('_', ' ')}</Badge>
                                                </div>
                                                <div className="text-muted-foreground text-sm">{workItem.description}</div>
                                                <div className="text-muted-foreground text-xs">
                                                    Customer: {workItem.customer} • {workItem.motorcycle}
                                                </div>
                                                <div className="text-muted-foreground text-xs">Created: {workItem.created_at}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-4">
                                            <div className="text-right">
                                                <div className="text-sm font-medium">€{(workItem.total_cost || 0).toFixed(2)}</div>
                                                <div className="text-muted-foreground flex items-center space-x-1 text-xs">
                                                    <Users className="h-3 w-3" />
                                                    <span>
                                                        {workItem.mechanics.length} mechanic{workItem.mechanics.length !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                                {workItem.mechanics.length > 0 && (
                                                    <div className="text-muted-foreground text-xs">
                                                        {workItem.mechanics.map((m) => m.name).join(', ')}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/admin/work-orders/${workItem.id}?type=${workItem.type}`}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link
                                                        href={`/admin/work-orders/${workItem.id}/edit${workItem.type === 'work_session' ? '?type=work_session' : ''}`}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(workItem)}
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
                            <div className="py-8 text-center">
                                <Wrench className="text-muted-foreground mx-auto h-12 w-12" />
                                <h3 className="mt-2 text-sm font-medium">No work orders or sessions</h3>
                                <p className="text-muted-foreground mt-1 text-sm">Get started by creating a new work order.</p>
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

                {/* Pagination */}
                {workOrders.meta && workOrders.meta.last_page > 1 && (
                    <div className="flex justify-center space-x-2">
                        {Array.from({ length: workOrders.meta.last_page }, (_, i) => i + 1).map((page) => (
                            <Button key={page} variant={workOrders.meta.current_page === page ? 'default' : 'outline'} size="sm" asChild>
                                <Link href={`/admin/work-orders?page=${page}`}>{page}</Link>
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
