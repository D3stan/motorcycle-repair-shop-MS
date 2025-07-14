import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type AdminFinancialAnalytics, type AdminInvoice, type AdminInvoiceStatistics, type AdminTopCustomer, type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, Clock, DollarSign, FileText, TrendingDown, TrendingUp, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Financial',
        href: '/admin/financial',
    },
];

interface Props {
    revenueAnalytics: AdminFinancialAnalytics;
    invoiceStatistics: AdminInvoiceStatistics;
    recentInvoices: AdminInvoice[];
    topCustomers: AdminTopCustomer[];
}

export default function FinancialIndex({ revenueAnalytics, invoiceStatistics, recentInvoices, topCustomers }: Props) {
    const getStatusBadge = (status: string, isOverdue: boolean = false) => {
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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'EUR',
        }).format(amount);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Financial Management" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Financial Management</h1>
                        <p className="text-muted-foreground">Revenue analytics and invoice management</p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild>
                            <Link href="/admin/financial/invoices">View All Invoices</Link>
                        </Button>
                    </div>
                </div>

                {/* Revenue Analytics Cards */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                    {/* Current Month Revenue */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <DollarSign className="h-4 w-4" />
                                Monthly Revenue
                            </CardTitle>
                            <CardDescription>Current month earnings</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-2 text-2xl font-bold">{formatCurrency(revenueAnalytics.current_month_revenue)}</div>
                            <div className="flex items-center gap-1 text-sm">
                                {revenueAnalytics.revenue_growth >= 0 ? (
                                    <TrendingUp className="h-3 w-3 text-green-600" />
                                ) : (
                                    <TrendingDown className="h-3 w-3 text-red-600" />
                                )}
                                <span className={revenueAnalytics.revenue_growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                                    {Math.abs(revenueAnalytics.revenue_growth).toFixed(1)}%
                                </span>
                                <span className="text-muted-foreground">vs last month</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Total Invoices */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <FileText className="h-4 w-4" />
                                Total Invoices
                            </CardTitle>
                            <CardDescription>All time invoices</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-2 text-2xl font-bold">{invoiceStatistics.total_invoices}</div>
                            <div className="text-muted-foreground text-sm">
                                {invoiceStatistics.paid_invoices} paid
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-4 lg:grid-cols-3">
                    {/* Recent Invoices */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Invoices</CardTitle>
                                <CardDescription>Latest invoices and payment status</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {recentInvoices.length > 0 ? (
                                    <div className="space-y-4">
                                        {recentInvoices.map((invoice) => (
                                            <div key={invoice.id} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-medium">
                                                            <Link href={`/admin/financial/invoices/${invoice.id}`} className="hover:underline">
                                                                {invoice.invoice_number}
                                                            </Link>
                                                        </p>
                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                invoice.work_type === 'Maintenance'
                                                                    ? 'border-blue-200 text-blue-700'
                                                                    : 'border-green-200 text-green-700'
                                                            }
                                                        >
                                                            {invoice.work_type}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-muted-foreground text-xs">{invoice.customer}</p>
                                                    <p className="text-muted-foreground text-xs">{invoice.motorcycle}</p>
                                                    <p className="text-muted-foreground text-xs">
                                                        Issued: {new Date(invoice.issue_date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="space-y-1 text-right">
                                                    <div className="text-sm font-medium">{formatCurrency(invoice.total_amount)}</div>
                                                    {getStatusBadge(invoice.status, invoice.is_overdue)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-muted-foreground py-6 text-center">
                                        <FileText className="mx-auto mb-2 h-8 w-8 opacity-50" />
                                        <p>No recent invoices</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Top Customers */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Top Customers
                            </CardTitle>
                            <CardDescription>By total revenue</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {topCustomers.length > 0 ? (
                                <div className="space-y-3">
                                    {topCustomers.map((customer, index) => (
                                        <div key={customer.id} className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium">
                                                    <Link href={`/admin/customers/${customer.id}`} className="hover:underline">
                                                        {customer.name}
                                                    </Link>
                                                </p>
                                                <p className="text-muted-foreground text-xs">{customer.email}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-medium">{formatCurrency(customer.total_revenue)}</div>
                                                <div className="text-muted-foreground text-xs">#{index + 1}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-muted-foreground py-6 text-center">
                                    <Users className="mx-auto mb-2 h-8 w-8 opacity-50" />
                                    <p>No revenue data</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Financial management shortcuts</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-2 md:grid-cols-3">
                            <Button asChild variant="outline" className="justify-start">
                                <Link href="/admin/financial/invoices?status=pending">
                                    <Clock className="mr-2 h-4 w-4" />
                                    Pending Invoices
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="justify-start">
                                <Link href="/admin/financial/invoices?status=overdue" replace={false}>
                                    <AlertTriangle className="mr-2 h-4 w-4" />
                                    Overdue Invoices
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="justify-start">
                                <Link href="/admin/work-orders/create">
                                    <FileText className="mr-2 h-4 w-4" />
                                    Create Work Order
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
