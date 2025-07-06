import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type AdminFinancialAnalytics, type AdminInvoiceStatistics, type AdminInvoice, type AdminTopCustomer } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { DollarSign, FileText, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, Users } from 'lucide-react';

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

export default function FinancialIndex({ 
    revenueAnalytics, 
    invoiceStatistics, 
    recentInvoices, 
    topCustomers 
}: Props) {
    const getStatusBadge = (status: string, isOverdue: boolean = false) => {
        if (isOverdue) {
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
                            <CardTitle className="text-base flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Monthly Revenue
                            </CardTitle>
                            <CardDescription>Current month earnings</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold mb-2">
                                {formatCurrency(revenueAnalytics.current_month_revenue)}
                            </div>
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
                            <CardTitle className="text-base flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Total Invoices
                            </CardTitle>
                            <CardDescription>All time invoices</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold mb-2">{invoiceStatistics.total_invoices}</div>
                            <div className="text-sm text-muted-foreground">
                                {invoiceStatistics.paid_invoices} paid, {invoiceStatistics.pending_invoices} pending
                            </div>
                        </CardContent>
                    </Card>

                    {/* Outstanding Payments */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Outstanding
                            </CardTitle>
                            <CardDescription>Pending payments</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold mb-2">
                                {formatCurrency(invoiceStatistics.outstanding_payments)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                From {invoiceStatistics.pending_invoices} invoices
                            </div>
                        </CardContent>
                    </Card>

                    {/* Overdue Invoices */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                Overdue
                            </CardTitle>
                            <CardDescription>Require attention</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold mb-2 text-red-600">
                                {invoiceStatistics.overdue_invoices}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {invoiceStatistics.overdue_invoices > 0 ? 'Need follow-up' : 'All up to date'}
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
                                                    <p className="text-sm font-medium">
                                                        <Link 
                                                            href={`/admin/financial/invoices/${invoice.id}`}
                                                            className="hover:underline"
                                                        >
                                                            {invoice.invoice_number}
                                                        </Link>
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">{invoice.customer}</p>
                                                    <p className="text-xs text-muted-foreground">{invoice.motorcycle}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Due: {new Date(invoice.due_date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="text-right space-y-1">
                                                    <div className="text-sm font-medium">
                                                        {formatCurrency(invoice.total_amount)}
                                                    </div>
                                                    {getStatusBadge(invoice.status, invoice.is_overdue)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-muted-foreground">
                                        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
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
                                                    <Link 
                                                        href={`/admin/customers/${customer.id}`}
                                                        className="hover:underline"
                                                    >
                                                        {customer.name}
                                                    </Link>
                                                </p>
                                                <p className="text-xs text-muted-foreground">{customer.email}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-medium">
                                                    {formatCurrency(customer.total_revenue)}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    #{index + 1}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-muted-foreground">
                                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
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
                                    <Clock className="h-4 w-4 mr-2" />
                                    Pending Invoices
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="justify-start">
                                <Link href="/admin/financial/invoices?status=pending&date_to=" 
                                      replace={false}>
                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                    Overdue Invoices
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="justify-start">
                                <Link href="/admin/work-orders/create">
                                    <FileText className="h-4 w-4 mr-2" />
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