import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import {
    type AdminWorkOrderAppointment,
    type AdminWorkOrderCustomer,
    type AdminWorkOrderDetails,
    type AdminWorkOrderInvoice,
    type AdminWorkOrderMechanic,
    type AdminWorkOrderMotorcycle,
    type AdminWorkOrderPart,
    type BreadcrumbItem,
} from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Calendar, CheckCircle, Edit, FileText, Trash2, Users, Wrench } from 'lucide-react';

interface Props {
    workOrder: AdminWorkOrderDetails;
    customer: AdminWorkOrderCustomer;
    motorcycle: AdminWorkOrderMotorcycle;
    mechanics: AdminWorkOrderMechanic[];
    parts: AdminWorkOrderPart[];
    appointment?: AdminWorkOrderAppointment;
    invoice?: AdminWorkOrderInvoice;
}

export default function WorkOrderShow({ workOrder, customer, motorcycle, mechanics, parts, appointment, invoice }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Admin Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Work Orders & Sessions',
            href: '/admin/work-orders',
        },
        {
            title: `${workOrder.type_label} #${workOrder.id}`,
            href: `/admin/work-orders/${workOrder.id}`,
        },
    ];

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this work order?')) {
            router.delete(`/admin/work-orders/${workOrder.id}`);
        }
    };

    const handleMarkCompleted = () => {
        if (confirm('Are you sure you want to mark this work order as completed?')) {
            router.patch(`/admin/work-orders/${workOrder.id}/mark-completed`);
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
            <Head title={`${workOrder.type_label} #${workOrder.id}`} />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center space-x-3">
                            <h1 className="text-3xl font-bold">
                                {workOrder.type_label} #{workOrder.id}
                            </h1>
                            <Badge
                                variant="outline"
                                className={workOrder.type === 'work_order' ? 'border-blue-200 text-blue-700' : 'border-green-200 text-green-700'}
                            >
                                {workOrder.type_label}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground">
                            {workOrder.type === 'work_order' ? 'Work order details and progress' : 'Work session details and progress'}
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" asChild>
                            <Link href="/admin/work-orders">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Work Orders & Sessions
                            </Link>
                        </Button>
                        {workOrder.type === 'work_order' && (
                            <>
                                <Button variant="outline" asChild>
                                    <Link href={`/admin/work-orders/${workOrder.id}/edit`}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                    </Link>
                                </Button>
                                {workOrder.status !== 'completed' && (
                                    <Button variant="default" onClick={handleMarkCompleted}>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Mark as Completed
                                    </Button>
                                )}
                                <Button variant="destructive" onClick={handleDelete}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Status and Summary */}
                <div className={`grid auto-rows-min gap-4 ${workOrder.type === 'work_order' ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Badge className={getStatusBadge(workOrder.status)}>{workOrder.status.replace('_', ' ')}</Badge>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Total Cost</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">€{(workOrder.total_cost || 0).toFixed(2)}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Hours Worked</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-medium">{workOrder.hours_worked} hours</div>
                        </CardContent>
                    </Card>

                    {workOrder.type === 'work_order' && (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">Parts Cost</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-lg font-medium">€{(workOrder.parts_cost || 0).toFixed(2)}</div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    {/* Work Order Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Wrench className="mr-2 h-5 w-5" />
                                Work Order Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="text-muted-foreground text-sm font-medium">Description</div>
                                <div className="mt-1">{workOrder.description}</div>
                            </div>

                            {workOrder.notes && (
                                <div>
                                    <div className="text-muted-foreground text-sm font-medium">Notes</div>
                                    <div className="mt-1">{workOrder.notes}</div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-muted-foreground text-sm font-medium">Created</div>
                                    <div>{workOrder.created_at}</div>
                                </div>
                                {workOrder.started_at && (
                                    <div>
                                        <div className="text-muted-foreground text-sm font-medium">Started</div>
                                        <div>{workOrder.started_at}</div>
                                    </div>
                                )}
                            </div>

                            {workOrder.completed_at && (
                                <div>
                                    <div className="text-muted-foreground text-sm font-medium">Completed</div>
                                    <div>{workOrder.completed_at}</div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Customer and Motorcycle */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Users className="mr-2 h-5 w-5" />
                                Customer & Motorcycle
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="text-muted-foreground text-sm font-medium">Customer</div>
                                <div className="font-medium">{customer.name}</div>
                                <div className="text-muted-foreground text-sm">{customer.email}</div>
                                {customer.phone && <div className="text-muted-foreground text-sm">{customer.phone}</div>}
                            </div>

                            <div>
                                <div className="text-muted-foreground text-sm font-medium">Motorcycle</div>
                                <div className="font-medium">
                                    {motorcycle.brand} {motorcycle.model}
                                </div>
                                <div className="text-muted-foreground text-sm">
                                    {motorcycle.year} • {motorcycle.plate}
                                </div>
                                <div className="text-muted-foreground text-sm">VIN: {motorcycle.vin}</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Assigned Mechanics */}
                <Card>
                    <CardHeader>
                        <CardTitle>Assigned Mechanics</CardTitle>
                        <CardDescription>Mechanics working on this order</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {mechanics.length > 0 ? (
                            <div className="space-y-4">
                                {mechanics.map((mechanic) => (
                                    <div key={mechanic.id} className="flex items-center justify-between border-b pb-4 last:border-b-0">
                                        <div>
                                            <div className="font-medium">{mechanic.name}</div>
                                            <div className="text-muted-foreground text-sm">{mechanic.email}</div>
                                        </div>
                                        <div className="text-right text-sm">
                                            {mechanic.assigned_at && <div>Assigned: {mechanic.assigned_at}</div>}
                                            {mechanic.started_at && <div>Started: {mechanic.started_at}</div>}
                                            {mechanic.completed_at && <div>Completed: {mechanic.completed_at}</div>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-muted-foreground py-6 text-center">
                                <p>No mechanics assigned yet</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Parts Used */}
                {parts.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Parts Used</CardTitle>
                            <CardDescription>Parts and materials for this work order</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {parts.map((part) => (
                                    <div key={part.id} className="flex items-center justify-between border-b pb-4 last:border-b-0">
                                        <div>
                                            <div className="font-medium">{part.name}</div>
                                            <div className="text-muted-foreground text-sm">Quantity: {part.quantity}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-medium">€{(part.total_price || 0).toFixed(2)}</div>
                                            <div className="text-muted-foreground text-sm">€{(part.unit_price || 0).toFixed(2)} each</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Related Information */}
                <div className="grid gap-4 lg:grid-cols-2">
                    {/* Related Appointment */}
                    {appointment && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Calendar className="mr-2 h-5 w-5" />
                                    Related Appointment
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div>
                                        <span className="text-muted-foreground text-sm font-medium">Date & Time:</span>
                                        <div>
                                            {appointment.date} at {appointment.time}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground text-sm font-medium">Type:</span>
                                        <div className="capitalize">{appointment.type.replace('_', ' ')}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Invoice Information */}
                    {invoice && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <FileText className="mr-2 h-5 w-5" />
                                    Invoice
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div>
                                        <span className="text-muted-foreground text-sm font-medium">Invoice Number:</span>
                                        <div>{invoice.invoice_number}</div>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground text-sm font-medium">Amount:</span>
                                        <div>€{(invoice.total_amount || 0).toFixed(2)}</div>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground text-sm font-medium">Status:</span>
                                        <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>{invoice.status}</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        <Button asChild variant="outline">
                            <Link href={`/admin/work-orders/${workOrder.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Work Order
                            </Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href={`/admin/customers/${customer.id}`}>
                                <Users className="mr-2 h-4 w-4" />
                                View Customer
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
