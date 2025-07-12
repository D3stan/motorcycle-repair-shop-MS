import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { 
    type BreadcrumbItem, 
    type AdminWorkOrderDetails, 
    type AdminWorkOrderCustomer, 
    type AdminWorkOrderMotorcycle,
    type AdminWorkOrderMechanic,
    type AdminWorkOrderPart,
    type AdminWorkOrderAppointment,
    type AdminWorkOrderInvoice
} from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Edit, Trash2, Users, Bike, Calendar, FileText, Wrench, Euro } from 'lucide-react';

interface Props {
    workOrder: AdminWorkOrderDetails;
    customer: AdminWorkOrderCustomer;
    motorcycle: AdminWorkOrderMotorcycle;
    mechanics: AdminWorkOrderMechanic[];
    parts: AdminWorkOrderPart[];
    appointment?: AdminWorkOrderAppointment;
    invoice?: AdminWorkOrderInvoice;
}

export default function WorkOrderShow({ 
    workOrder, 
    customer, 
    motorcycle, 
    mechanics, 
    parts, 
    appointment, 
    invoice 
}: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Admin Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Work Orders',
            href: '/admin/work-orders',
        },
        {
            title: `Work Order #${workOrder.id}`,
            href: `/admin/work-orders/${workOrder.id}`,
        },
    ];

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this work order?')) {
            router.delete(`/admin/work-orders/${workOrder.id}`);
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
            <Head title={`Work Order #${workOrder.id}`} />
            
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Work Order #{workOrder.id}</h1>
                        <p className="text-muted-foreground">Work order details and progress</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" asChild>
                            <Link href="/admin/work-orders">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Work Orders
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={`/admin/work-orders/${workOrder.id}/edit`}>
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

                {/* Status and Summary */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Badge className={getStatusBadge(workOrder.status)}>
                                {workOrder.status.replace('_', ' ')}
                            </Badge>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Total Cost</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                €{(workOrder.total_cost || 0).toFixed(2)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Labor Cost</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-medium">
                                €{(workOrder.labor_cost || 0).toFixed(2)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Parts Cost</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-medium">
                                €{(workOrder.parts_cost || 0).toFixed(2)}
                            </div>
                        </CardContent>
                    </Card>
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
                                <div className="text-sm font-medium text-muted-foreground">Description</div>
                                <div className="mt-1">{workOrder.description}</div>
                            </div>
                            
                            {workOrder.notes && (
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Notes</div>
                                    <div className="mt-1">{workOrder.notes}</div>
                                </div>
                            )}
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Created</div>
                                    <div>{workOrder.created_at}</div>
                                </div>
                                {workOrder.started_at && (
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Started</div>
                                        <div>{workOrder.started_at}</div>
                                    </div>
                                )}
                            </div>
                            
                            {workOrder.completed_at && (
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Completed</div>
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
                                <div className="text-sm font-medium text-muted-foreground">Customer</div>
                                <div className="font-medium">{customer.name}</div>
                                <div className="text-sm text-muted-foreground">{customer.email}</div>
                                {customer.phone && (
                                    <div className="text-sm text-muted-foreground">{customer.phone}</div>
                                )}
                            </div>
                            
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Motorcycle</div>
                                <div className="font-medium">{motorcycle.brand} {motorcycle.model}</div>
                                <div className="text-sm text-muted-foreground">
                                    {motorcycle.year} • {motorcycle.plate}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    VIN: {motorcycle.vin}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Assigned Mechanics */}
                <Card>
                    <CardHeader>
                        <CardTitle>Assigned Mechanics</CardTitle>
                        <CardDescription>
                            Mechanics working on this order
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {mechanics.length > 0 ? (
                            <div className="space-y-4">
                                {mechanics.map((mechanic) => (
                                    <div key={mechanic.id} className="flex items-center justify-between border-b pb-4 last:border-b-0">
                                        <div>
                                            <div className="font-medium">{mechanic.name}</div>
                                            <div className="text-sm text-muted-foreground">{mechanic.email}</div>
                                        </div>
                                        <div className="text-right text-sm">
                                            {mechanic.assigned_at && (
                                                <div>Assigned: {mechanic.assigned_at}</div>
                                            )}
                                            {mechanic.started_at && (
                                                <div>Started: {mechanic.started_at}</div>
                                            )}
                                            {mechanic.completed_at && (
                                                <div>Completed: {mechanic.completed_at}</div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-muted-foreground">
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
                            <CardDescription>
                                Parts and materials for this work order
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {parts.map((part) => (
                                    <div key={part.id} className="flex items-center justify-between border-b pb-4 last:border-b-0">
                                        <div>
                                            <div className="font-medium">{part.name}</div>
                                            <div className="text-sm text-muted-foreground">
                                                Quantity: {part.quantity}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-medium">€{(part.total_price || 0).toFixed(2)}</div>
                                            <div className="text-sm text-muted-foreground">
                                                €{(part.unit_price || 0).toFixed(2)} each
                                            </div>
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
                                        <span className="text-sm font-medium text-muted-foreground">Date & Time:</span>
                                        <div>{appointment.date} at {appointment.time}</div>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-muted-foreground">Type:</span>
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
                                        <span className="text-sm font-medium text-muted-foreground">Invoice Number:</span>
                                        <div>{invoice.invoice_number}</div>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-muted-foreground">Amount:</span>
                                        <div>€{(invoice.total_amount || 0).toFixed(2)}</div>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-muted-foreground">Status:</span>
                                        <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                                            {invoice.status}
                                        </Badge>
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
                        {!invoice && workOrder.status === 'completed' && (
                            <Button asChild variant="outline">
                                <Link href={`/admin/invoices/create?work_order=${workOrder.id}`}>
                                    <Euro className="mr-2 h-4 w-4" />
                                    Create Invoice
                                </Link>
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
} 