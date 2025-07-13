import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Work Orders',
        href: '/work-orders',
    },
];

interface WorkOrder {
    id: number;
    description: string;
    status: string;
    started_at: string | null;
    completed_at: string | null;
    labor_cost: number;
    parts_cost: number;
    total_cost: number;
    motorcycle: {
        id: number;
        brand: string;
        model: string;
        plate: string;
    };
    appointment: {
        id: number;
        appointment_date: string;
        type: string;
    } | null;
    invoice: {
        id: number;
        invoice_number: string;
        status: string;
    } | null;
    notes: string;
}

interface WorkOrdersProps {
    activeWorkOrders: WorkOrder[];
    completedWorkOrders: WorkOrder[];
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'pending':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        case 'in_progress':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        case 'completed':
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case 'cancelled':
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
};

const getInvoiceStatusColor = (status: string) => {
    switch (status) {
        case 'paid':
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case 'pending':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        case 'overdue':
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
};

export default function WorkOrders({ activeWorkOrders, completedWorkOrders }: WorkOrdersProps) {
    const handleViewDetails = (workOrderId: number) => {
        window.location.href = `/work-orders/${workOrderId}`;
    };

    const formatDateTime = (dateTime: string | null) => {
        if (!dateTime) return 'Not started';
        return new Date(dateTime + ' UTC').toLocaleString();
    };

    const formatCurrency = (amount: number) => {
        return `€${amount.toFixed(2)}`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Work Orders" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Work Orders</h1>
                        <p className="text-muted-foreground">Track your motorcycle repairs and maintenance</p>
                    </div>
                </div>

                {/* Active Work Orders */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Active Work Orders</h2>

                    {activeWorkOrders.length > 0 ? (
                        <div className="grid gap-4">
                            {activeWorkOrders.map((workOrder) => (
                                <Card key={workOrder.id}>
                                    <CardHeader>
                                        <CardTitle className="flex items-center justify-between">
                                            <span>
                                                {workOrder.motorcycle.brand} {workOrder.motorcycle.model}
                                            </span>
                                            <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(workOrder.status)}`}>
                                                {workOrder.status.charAt(0).toUpperCase() + workOrder.status.slice(1).replace('_', ' ')}
                                            </span>
                                        </CardTitle>
                                        <CardDescription>{workOrder.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid gap-4 text-sm md:grid-cols-2">
                                            <div>
                                                <p>
                                                    <strong>Motorcycle:</strong> {workOrder.motorcycle.plate}
                                                </p>
                                                {workOrder.appointment && (
                                                    <p>
                                                        <strong>Appointment:</strong> {workOrder.appointment.appointment_date} (
                                                        {workOrder.appointment.type})
                                                    </p>
                                                )}
                                                <p>
                                                    <strong>Started:</strong> {formatDateTime(workOrder.started_at)}
                                                </p>
                                            </div>
                                            <div>
                                                <p>
                                                    <strong>Labor Cost:</strong> {formatCurrency(workOrder.labor_cost)}
                                                </p>
                                                <p>
                                                    <strong>Parts Cost:</strong> {formatCurrency(workOrder.parts_cost)}
                                                </p>
                                                <p>
                                                    <strong>Total Cost:</strong> {formatCurrency(workOrder.total_cost)}
                                                </p>
                                            </div>
                                        </div>

                                        {workOrder.notes && (
                                            <div className="text-sm">
                                                <p>
                                                    <strong>Notes:</strong> {workOrder.notes}
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => handleViewDetails(workOrder.id)} className="flex-1">
                                                View Details
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <h3 className="mb-2 text-lg font-semibold">No active work orders</h3>
                                <p className="text-muted-foreground mb-4 text-center">
                                    All your repairs are up to date! Book an appointment if you need service.
                                </p>
                                <Button asChild>
                                    <Link href="/appointments">Book Appointment</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Completed Work Orders */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Completed Work Orders</h2>

                    {completedWorkOrders.length > 0 ? (
                        <div className="space-y-3">
                            {completedWorkOrders.map((workOrder) => (
                                <Card key={workOrder.id}>
                                    <CardContent className="pt-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium">
                                                        {workOrder.motorcycle.brand} {workOrder.motorcycle.model} • {workOrder.description}
                                                    </p>
                                                    <span
                                                        className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(workOrder.status)}`}
                                                    >
                                                        Completed
                                                    </span>
                                                </div>

                                                <div className="text-muted-foreground grid gap-4 text-sm md:grid-cols-2">
                                                    <div>
                                                        <p>Completed: {formatDateTime(workOrder.completed_at)}</p>
                                                        {workOrder.appointment && <p>Appointment: {workOrder.appointment.appointment_date}</p>}
                                                    </div>
                                                    <div>
                                                        <p>Total Cost: {formatCurrency(workOrder.total_cost)}</p>
                                                        {workOrder.invoice && (
                                                            <div className="flex items-center gap-2">
                                                                <span>Invoice: {workOrder.invoice.invoice_number}</span>
                                                                <span
                                                                    className={`rounded-full px-2 py-1 text-xs font-medium ${getInvoiceStatusColor(workOrder.invoice.status)}`}
                                                                >
                                                                    {workOrder.invoice.status.charAt(0).toUpperCase() +
                                                                        workOrder.invoice.status.slice(1)}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {workOrder.notes && <p className="text-muted-foreground text-sm">{workOrder.notes}</p>}
                                            </div>

                                            <div className="ml-4">
                                                <Button variant="outline" size="sm" onClick={() => handleViewDetails(workOrder.id)}>
                                                    View Details
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-8">
                                <p className="text-muted-foreground text-center">No completed work orders yet.</p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Quick Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Active Orders</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{activeWorkOrders.length}</div>
                            <p className="text-muted-foreground text-sm">in progress</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Completed</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{completedWorkOrders.length}</div>
                            <p className="text-muted-foreground text-sm">total orders</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Total Spent</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatCurrency(completedWorkOrders.reduce((sum, order) => sum + order.total_cost, 0))}
                            </div>
                            <p className="text-muted-foreground text-sm">on repairs</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
