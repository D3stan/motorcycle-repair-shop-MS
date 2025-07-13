import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

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
        year: number;
        plate: string;
        vin: string;
    };
    appointment: {
        id: number;
        appointment_date: string;
        appointment_time: string;
        type: string;
    } | null;
    invoice: {
        id: number;
        invoice_number: string;
        issue_date: string;
        due_date: string;
        status: string;
        total_amount: number;
    } | null;
    notes: string;
}

interface Part {
    name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
}

interface WorkOrderShowProps {
    workOrder: WorkOrder;
    partsBreakdown: Part[];
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

export default function WorkOrderShow({ workOrder, partsBreakdown }: WorkOrderShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Work Orders',
            href: '/work-orders',
        },
        {
            title: `Work Order #${workOrder.id}`,
            href: `/work-orders/${workOrder.id}`,
        },
    ];

    const formatDateTime = (dateTime: string | null) => {
        if (!dateTime) return 'Not started';
        return new Date(dateTime + ' UTC').toLocaleString();
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString();
    };

    const formatCurrency = (amount: number) => {
        return `€${amount.toFixed(2)}`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Work Order #${workOrder.id}`} />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Work Order #{workOrder.id}</h1>
                        <p className="text-muted-foreground">{workOrder.description}</p>
                    </div>
                    <div className="flex gap-2">
                        <span className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(workOrder.status)}`}>
                            {workOrder.status.charAt(0).toUpperCase() + workOrder.status.slice(1).replace('_', ' ')}
                        </span>
                        <Button asChild variant="outline">
                            <Link href="/work-orders">Back to Work Orders</Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Details */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Work Order Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Work Order Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <h4 className="mb-2 font-medium">Timeline</h4>
                                        <div className="space-y-1 text-sm">
                                            <p>
                                                <strong>Started:</strong> {formatDateTime(workOrder.started_at)}
                                            </p>
                                            <p>
                                                <strong>Completed:</strong> {formatDateTime(workOrder.completed_at)}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="mb-2 font-medium">Costs</h4>
                                        <div className="space-y-1 text-sm">
                                            <p>
                                                <strong>Labor:</strong> {formatCurrency(workOrder.labor_cost)}
                                            </p>
                                            <p>
                                                <strong>Parts:</strong> {formatCurrency(workOrder.parts_cost)}
                                            </p>
                                            <p>
                                                <strong>Total:</strong> {formatCurrency(workOrder.total_cost)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {workOrder.notes && (
                                    <div>
                                        <h4 className="mb-2 font-medium">Notes</h4>
                                        <p className="text-muted-foreground text-sm">{workOrder.notes}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Parts Breakdown */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Parts & Labor Breakdown</CardTitle>
                                <CardDescription>Detailed breakdown of parts used and labor costs</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Parts */}
                                    {partsBreakdown.length > 0 && (
                                        <div>
                                            <h4 className="mb-3 font-medium">Parts Used</h4>
                                            <div className="space-y-2">
                                                {partsBreakdown.map((part, index) => (
                                                    <div key={index} className="flex items-center justify-between border-b py-2">
                                                        <div className="flex-1">
                                                            <p className="font-medium">{part.name}</p>
                                                            <p className="text-muted-foreground text-sm">
                                                                Quantity: {part.quantity} × {formatCurrency(part.unit_price)}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-medium">{formatCurrency(part.total_price)}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                                <div className="flex items-center justify-between pt-2 font-medium">
                                                    <span>Parts Subtotal</span>
                                                    <span>{formatCurrency(workOrder.parts_cost)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Labor */}
                                    <div>
                                        <h4 className="mb-3 font-medium">Labor</h4>
                                        <div className="flex items-center justify-between border-b py-2">
                                            <div>
                                                <p className="font-medium">Technical Labor</p>
                                                <p className="text-muted-foreground text-sm">{workOrder.description}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">{formatCurrency(workOrder.labor_cost)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Total */}
                                    <div className="border-t pt-4">
                                        <div className="flex items-center justify-between text-lg font-semibold">
                                            <span>Total Cost</span>
                                            <span>{formatCurrency(workOrder.total_cost)}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Motorcycle Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Motorcycle</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <p>
                                    <strong>Make & Model:</strong> {workOrder.motorcycle.brand} {workOrder.motorcycle.model}
                                </p>
                                <p>
                                    <strong>Year:</strong> {workOrder.motorcycle.year}
                                </p>
                                <p>
                                    <strong>License Plate:</strong> {workOrder.motorcycle.plate}
                                </p>
                                <p>
                                    <strong>VIN:</strong> {workOrder.motorcycle.vin}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Appointment Information */}
                        {workOrder.appointment && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Related Appointment</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    <p>
                                        <strong>Date:</strong> {formatDate(workOrder.appointment.appointment_date)}
                                    </p>
                                    <p>
                                        <strong>Time:</strong> {workOrder.appointment.appointment_time}
                                    </p>
                                    <p>
                                        <strong>Type:</strong>{' '}
                                        {workOrder.appointment.type.charAt(0).toUpperCase() + workOrder.appointment.type.slice(1).replace('_', ' ')}
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Invoice Information */}
                        {workOrder.invoice && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Invoice</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Status</span>
                                        <span
                                            className={`rounded-full px-2 py-1 text-xs font-medium ${getInvoiceStatusColor(workOrder.invoice.status)}`}
                                        >
                                            {workOrder.invoice.status.charAt(0).toUpperCase() + workOrder.invoice.status.slice(1)}
                                        </span>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <p>
                                            <strong>Invoice #:</strong> {workOrder.invoice.invoice_number}
                                        </p>
                                        <p>
                                            <strong>Issue Date:</strong> {formatDate(workOrder.invoice.issue_date)}
                                        </p>
                                        <p>
                                            <strong>Due Date:</strong> {formatDate(workOrder.invoice.due_date)}
                                        </p>
                                        <p>
                                            <strong>Total:</strong> {formatCurrency(workOrder.invoice.total_amount)}
                                        </p>
                                    </div>
                                    <Button asChild variant="outline" size="sm" className="w-full">
                                        <a href={`/invoices/${workOrder.invoice.id}/download`} target="_blank" rel="noopener noreferrer">
                                            Download Invoice
                                        </a>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
