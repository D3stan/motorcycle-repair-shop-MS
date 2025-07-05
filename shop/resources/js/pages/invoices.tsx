import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Download, FileText } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Invoices',
        href: '/invoices',
    },
];

interface Invoice {
    id: number;
    invoice_number: string;
    issue_date: string;
    due_date: string;
    status: 'pending' | 'paid' | 'overdue' | 'cancelled';
    subtotal: number;
    tax_amount: number;
    total_amount: number;
    paid_at: string | null;
    work_order: {
        id: number;
        description: string;
        motorcycle: {
            brand: string;
            model: string;
            plate: string;
        };
    };
}

interface Summary {
    total_outstanding: number;
    total_paid: number;
    pending_count: number;
    overdue_count: number;
}

interface InvoicesProps {
    invoices: Invoice[];
    summary: Summary;
}

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('it-IT', {
        style: 'currency',
        currency: 'EUR',
    }).format(amount);
};

const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('it-IT');
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'paid':
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case 'pending':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        case 'overdue':
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        case 'cancelled':
            return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
};

export default function Invoices({ invoices, summary }: InvoicesProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Invoices" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Invoices</h1>
                        <p className="text-muted-foreground">Manage and download your invoices</p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Total Outstanding</CardTitle>
                            <CardDescription>Unpaid invoices</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold mb-2">{formatCurrency(summary.total_outstanding)}</div>
                            <div className="text-sm text-muted-foreground">
                                {summary.pending_count + summary.overdue_count} unpaid invoices
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Total Paid</CardTitle>
                            <CardDescription>Completed payments</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold mb-2">{formatCurrency(summary.total_paid)}</div>
                            <div className="text-sm text-muted-foreground">All time payments</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Pending</CardTitle>
                            <CardDescription>Awaiting payment</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold mb-2">{summary.pending_count}</div>
                            <div className="text-sm text-muted-foreground">
                                {summary.pending_count > 0 ? 'Action required' : 'All up to date'}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Overdue</CardTitle>
                            <CardDescription>Past due date</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold mb-2 text-red-600">{summary.overdue_count}</div>
                            <div className="text-sm text-muted-foreground">
                                {summary.overdue_count > 0 ? 'Immediate attention needed' : 'None overdue'}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Invoices List */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Invoices</CardTitle>
                        <CardDescription>Complete list of your invoices and their status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {invoices.length > 0 ? (
                            <div className="space-y-4">
                                {invoices.map((invoice) => (
                                    <div key={invoice.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <FileText className="h-5 w-5 text-muted-foreground" />
                                                    <div>
                                                        <h3 className="font-semibold">{invoice.invoice_number}</h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            {invoice.work_order.motorcycle.brand} {invoice.work_order.motorcycle.model} 
                                                            ({invoice.work_order.motorcycle.plate})
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                <div className="grid md:grid-cols-3 gap-4 text-sm mb-3">
                                                    <div>
                                                        <p className="text-muted-foreground">Issue Date</p>
                                                        <p className="font-medium">{formatDate(invoice.issue_date)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground">Due Date</p>
                                                        <p className="font-medium">{formatDate(invoice.due_date)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground">Amount</p>
                                                        <p className="font-bold text-lg">{formatCurrency(invoice.total_amount)}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                                                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                                        </span>
                                                        {invoice.paid_at && (
                                                            <span className="text-xs text-muted-foreground">
                                                                Paid on {formatDate(invoice.paid_at)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    <Button 
                                                        asChild
                                                        variant="outline" 
                                                        size="sm"
                                                        className="flex items-center gap-2"
                                                    >
                                                        <Link href={`/invoices/${invoice.id}/download`}>
                                                            <Download className="h-4 w-4" />
                                                            Download PDF
                                                        </Link>
                                                    </Button>
                                                </div>

                                                <div className="mt-2 text-sm text-muted-foreground">
                                                    <p><strong>Service:</strong> {invoice.work_order.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No invoices found</h3>
                                <p className="text-muted-foreground mb-4">
                                    You don't have any invoices yet. Invoices are generated after completing work orders.
                                </p>
                                <Button asChild>
                                    <Link href="/work-orders">View Work Orders</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
} 