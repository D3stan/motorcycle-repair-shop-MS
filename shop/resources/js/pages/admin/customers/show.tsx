import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { 
    type BreadcrumbItem, 
    type User, 
    type CustomerMotorcycle, 
    type CustomerAppointment, 
    type CustomerWorkOrder, 
    type CustomerInvoice 
} from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit, Mail, Phone, CreditCard, Calendar, Wrench, FileText, Bike } from 'lucide-react';

interface Props {
    customer: User;
    motorcycles: CustomerMotorcycle[];
    appointments: CustomerAppointment[];
    workOrders: CustomerWorkOrder[];
    invoices: CustomerInvoice[];
}

export default function CustomerShow({ customer, motorcycles, appointments, workOrders, invoices }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Admin Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Customer Management',
            href: '/admin/customers',
        },
        {
            title: `${customer.first_name} ${customer.last_name}`,
            href: `/admin/customers/${customer.id}`,
        },
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="secondary">Pending</Badge>;
            case 'in_progress':
                return <Badge variant="default">In Progress</Badge>;
            case 'completed':
                return <Badge variant="outline">Completed</Badge>;
            case 'cancelled':
                return <Badge variant="destructive">Cancelled</Badge>;
            case 'paid':
                return <Badge variant="outline">Paid</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${customer.first_name} ${customer.last_name} - Customer Details`} />
            
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/admin/customers">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Customers
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                {customer.first_name} {customer.last_name}
                            </h1>
                            <p className="text-muted-foreground">Customer Details</p>
                        </div>
                    </div>
                    <Button asChild>
                        <Link href={route('admin.customers.edit', customer.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Customer
                        </Link>
                    </Button>
                </div>

                {/* Customer Info and Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    {/* Customer Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{customer.email}</span>
                            </div>
                            {customer.phone && (
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{customer.phone}</span>
                                </div>
                            )}
                            {customer.tax_code && (
                                <div className="flex items-center gap-2">
                                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{customer.tax_code}</span>
                                </div>
                            )}
                            <Separator />
                            <div className="text-sm text-muted-foreground">
                                Customer since {customer.created_at}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Activity Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Bike className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">Motorcycles</span>
                                </div>
                                <Badge variant="secondary">{motorcycles.length}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">Appointments</span>
                                </div>
                                <Badge variant="secondary">{appointments.length}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Wrench className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">Work Orders</span>
                                </div>
                                <Badge variant="secondary">{workOrders.length}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">Invoices</span>
                                </div>
                                <Badge variant="secondary">{invoices.length}</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Financial Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Financial Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Total Invoiced</span>
                                <span className="font-medium">
                                    €{invoices.reduce((sum, inv) => sum + inv.total_amount, 0).toFixed(2)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Pending Invoices</span>
                                <span className="font-medium">
                                    {invoices.filter(inv => inv.status === 'pending').length}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Total Work Orders</span>
                                <span className="font-medium">
                                    €{workOrders.reduce((sum, wo) => sum + wo.total_cost, 0).toFixed(2)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Motorcycles */}
                {motorcycles.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Motorcycles ({motorcycles.length})</CardTitle>
                            <CardDescription>Customer's registered motorcycles</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {motorcycles.map((motorcycle) => (
                                    <div key={motorcycle.id} className="border rounded-lg p-4">
                                        <div className="font-medium">
                                            {motorcycle.brand} {motorcycle.model}
                                        </div>
                                        <div className="text-sm text-muted-foreground space-y-1">
                                            <div>Year: {motorcycle.year}</div>
                                            <div>Plate: {motorcycle.plate}</div>
                                            <div>Engine: {motorcycle.engine_size}cc</div>
                                            <div className="text-xs">VIN: {motorcycle.vin}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Recent Activity */}
                <div className="grid gap-4 lg:grid-cols-2">
                    {/* Recent Appointments */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Appointments</CardTitle>
                            <CardDescription>Latest appointment bookings</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {appointments.length > 0 ? (
                                <div className="space-y-4">
                                    {appointments.slice(0, 5).map((appointment) => (
                                        <div key={appointment.id} className="flex items-center justify-between border-b pb-2">
                                            <div>
                                                <div className="font-medium">{appointment.type}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {appointment.appointment_date} at {appointment.appointment_time}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {appointment.motorcycle}
                                                </div>
                                            </div>
                                            {getStatusBadge(appointment.status)}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-muted-foreground">
                                    <p>No appointments found</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Work Orders */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Work Orders</CardTitle>
                            <CardDescription>Latest service work</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {workOrders.length > 0 ? (
                                <div className="space-y-4">
                                    {workOrders.slice(0, 5).map((workOrder) => (
                                        <div key={workOrder.id} className="flex items-center justify-between border-b pb-2">
                                            <div>
                                                <div className="font-medium">{workOrder.description}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {workOrder.motorcycle}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {workOrder.started_at && `Started: ${workOrder.started_at}`}
                                                    {workOrder.completed_at && ` • Completed: ${workOrder.completed_at}`}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                {getStatusBadge(workOrder.status)}
                                                <div className="text-sm font-medium mt-1">
                                                    €{workOrder.total_cost.toFixed(2)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-muted-foreground">
                                    <p>No work orders found</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Invoices */}
                {invoices.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Invoices ({invoices.length})</CardTitle>
                            <CardDescription>Customer invoice history</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left p-2">Invoice #</th>
                                            <th className="text-left p-2">Issue Date</th>
                                            <th className="text-left p-2">Due Date</th>
                                            <th className="text-left p-2">Amount</th>
                                            <th className="text-left p-2">Status</th>
                                            <th className="text-left p-2">Paid Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoices.map((invoice) => (
                                            <tr key={invoice.id} className="border-b">
                                                <td className="p-2 font-medium">{invoice.invoice_number}</td>
                                                <td className="p-2">{invoice.issue_date}</td>
                                                <td className="p-2">{invoice.due_date}</td>
                                                <td className="p-2">€{invoice.total_amount.toFixed(2)}</td>
                                                <td className="p-2">{getStatusBadge(invoice.status)}</td>
                                                <td className="p-2">{invoice.paid_at || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
} 