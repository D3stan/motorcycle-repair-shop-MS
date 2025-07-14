import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Bike, CheckCircle, Download, Euro, FileText, User } from 'lucide-react';

interface Invoice {
    id: number;
    invoice_number: string;
    issue_date: string;
    due_date: string;
    total_amount: number;
    status: string;
    paid_at: string | null;
    created_at: string;
}

interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string | null;
}

interface WorkOrder {
    id: number;
    type: string;
    description: string;
    status: string;
    started_at: string | null;
    completed_at: string | null;
    labor_cost: number;
    parts_cost: number;
    total_cost: number;
    motorcycle: {
        brand: string;
        model: string;
        year: number;
        plate: string;
        vin: string;
    };
}

interface Props {
    invoice: Invoice;
    customer: Customer;
    workOrder: WorkOrder;
}

export default function InvoiceShow({ invoice, customer, workOrder }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Admin Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Financial',
            href: '/admin/financial',
        },
        {
            title: 'Invoices',
            href: '/admin/financial/invoices',
        },
        {
            title: invoice.invoice_number,
            href: `/admin/financial/invoices/${invoice.id}`,
        },
    ];

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'EUR',
        }).format(amount);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString();
    };

    const formatDateTime = (dateTime: string | null) => {
        if (!dateTime) return 'Not available';
        return new Date(dateTime).toLocaleString();
    };

    const getStatusBadge = (status: string) => {
        const isOverdue = status === 'pending' && new Date(invoice.due_date) < new Date();

        if (isOverdue || status === 'overdue') {
            return <Badge variant="destructive">Overdue</Badge>;
        }

        switch (status) {
            case 'paid':
                return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const markAsPaid = () => {
        if (confirm('Are you sure you want to mark this invoice as paid?')) {
            router.patch(`/admin/financial/invoices/${invoice.id}/mark-as-paid`);
        }
    };

    const canMarkAsPaid = invoice.status === 'pending' || invoice.status === 'overdue';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Invoice ${invoice.invoice_number}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Invoice {invoice.invoice_number}</h1>
                        <p className="text-muted-foreground">Created on {formatDate(invoice.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/admin/financial/invoices">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Invoices
                            </Link>
                        </Button>
                        {canMarkAsPaid && (
                            <Button onClick={markAsPaid}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mark as Paid
                            </Button>
                        )}
                        <Button variant="outline" asChild>
                            <a href={`/invoices/${invoice.id}/download`} target="_blank" rel="noopener noreferrer">
                                <Download className="mr-2 h-4 w-4" />
                                Download PDF
                            </a>
                        </Button>
                    </div>
                </div>

                {/* Status and Amounts */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <FileText className="h-4 w-4" />
                                Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">{getStatusBadge(invoice.status)}</div>
                            {invoice.paid_at && <p className="text-muted-foreground mt-2 text-sm">Paid on {formatDateTime(invoice.paid_at)}</p>}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Euro className="h-4 w-4" />
                                Subtotal
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(invoice.subtotal)}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Euro className="h-4 w-4" />
                                Total Amount
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-primary text-2xl font-bold">{formatCurrency(invoice.total_amount)}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-4 lg:grid-cols-2">
                    {/* Invoice Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Invoice Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground text-sm font-medium">Invoice Number:</span>
                                    <span className="font-medium">{invoice.invoice_number}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground text-sm font-medium">Issue Date:</span>
                                    <span>{formatDate(invoice.issue_date)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground text-sm font-medium">Due Date:</span>
                                    <span>{formatDate(invoice.due_date)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground text-sm font-medium">Created:</span>
                                    <span>{formatDateTime(invoice.created_at)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Customer Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Customer Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground text-sm font-medium">Name:</span>
                                    <span className="font-medium">
                                        <Link href={`/admin/customers/${customer.id}`} className="hover:underline">
                                            {customer.name}
                                        </Link>
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground text-sm font-medium">Email:</span>
                                    <span>{customer.email}</span>
                                </div>
                                {customer.phone && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground text-sm font-medium">Phone:</span>
                                        <span>{customer.phone}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Work Order Information */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bike className="h-4 w-4" />
                                Work Order Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground text-sm font-medium">Work Order ID:</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">
                                                <Link
                                                    href={`/admin/work-orders/${workOrder.id}${workOrder.type === 'session' ? '?type=work_session' : ''}`}
                                                    className="hover:underline"
                                                >
                                                    #{workOrder.id}
                                                </Link>
                                            </span>
                                            <Badge
                                                variant="outline"
                                                className={
                                                    workOrder.type === 'maintenance'
                                                        ? 'border-blue-200 text-blue-700'
                                                        : 'border-green-200 text-green-700'
                                                }
                                            >
                                                {workOrder.type === 'maintenance' ? 'Maintenance' : 'Session'}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground text-sm font-medium">Status:</span>
                                        <Badge variant="secondary">{workOrder.status}</Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground text-sm font-medium">Started:</span>
                                        <span>{workOrder.started_at ? formatDate(workOrder.started_at) : 'Not started'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground text-sm font-medium">Completed:</span>
                                        <span>{workOrder.completed_at ? formatDate(workOrder.completed_at) : 'Not completed'}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground text-sm font-medium">Labor Cost:</span>
                                        <span>{formatCurrency(workOrder.labor_cost)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground text-sm font-medium">Parts Cost:</span>
                                        <span>{formatCurrency(workOrder.parts_cost)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground text-sm font-medium">Total Cost:</span>
                                        <span className="font-semibold">{formatCurrency(workOrder.total_cost)}</span>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <h4 className="mb-2 font-medium">Description</h4>
                                <p className="text-muted-foreground text-sm">{workOrder.description}</p>
                            </div>

                            <Separator />

                            <div>
                                <h4 className="mb-2 font-medium">Motorcycle</h4>
                                <div className="grid gap-2 md:grid-cols-2">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground text-sm font-medium">Brand & Model:</span>
                                        <span>
                                            {workOrder.motorcycle.brand} {workOrder.motorcycle.model}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground text-sm font-medium">Year:</span>
                                        <span>{workOrder.motorcycle.year}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground text-sm font-medium">License Plate:</span>
                                        <span className="font-mono">{workOrder.motorcycle.plate}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground text-sm font-medium">VIN:</span>
                                        <span className="font-mono text-xs">{workOrder.motorcycle.vin}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
