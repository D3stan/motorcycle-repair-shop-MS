import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, FileText, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

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
];

interface Invoice {
    id: number;
    invoice_number: string;
    customer: string;
    customer_email: string;
    motorcycle: string;
    issue_date: string;
    due_date: string;
    total_amount: number;
    status: string;
    paid_at: string | null;
    is_overdue: boolean;
    created_at: string;
}

interface Props {
    invoices: {
        data: Invoice[];
        links?: any[];
        meta?: any;
    };
    filters: {
        status?: string;
        work_type?: string;
        search?: string;
        date_from?: string;
        date_to?: string;
    };
}

export default function InvoicesIndex({ invoices, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status && filters.status !== '' ? filters.status : 'all');
    const [workType, setWorkType] = useState(filters.work_type && filters.work_type !== '' ? filters.work_type : 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [initialLoad, setInitialLoad] = useState(true);

    // Auto-apply filters when status or work type changes
    useEffect(() => {
        if (!initialLoad) {
            router.get(
                '/admin/financial/invoices',
                {
                    search,
                    status: status === 'all' ? '' : status,
                    work_type: workType === 'all' ? '' : workType,
                    date_from: dateFrom,
                    date_to: dateTo,
                },
                {
                    preserveState: true,
                },
            );
        } else {
            setInitialLoad(false);
        }
    }, [status, workType]);

    const handleSearch = () => {
        router.get(
            '/admin/financial/invoices',
            {
                search,
                status: status === 'all' ? '' : status,
                work_type: workType === 'all' ? '' : workType,
                date_from: dateFrom,
                date_to: dateTo,
            },
            {
                preserveState: true,
            },
        );
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('all');
        setWorkType('all');
        setDateFrom('');
        setDateTo('');
        router.get('/admin/financial/invoices');
    };

    const getStatusBadge = (invoice: Invoice) => {
        if (invoice.is_overdue || invoice.status === 'overdue') {
            return <Badge variant="destructive">Overdue</Badge>;
        }

        switch (invoice.status) {
            case 'paid':
                return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
            default:
                return <Badge variant="secondary">{invoice.status}</Badge>;
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
            <Head title="Invoices Management" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Invoices</h1>
                        <p className="text-muted-foreground">Manage and track all invoices</p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/financial/invoices/create">
                            <FileText className="mr-2 h-4 w-4" />
                            Create Invoice
                        </Link>
                    </Button>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                        <CardDescription>Search and filter invoices</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Search</label>
                                <div className="relative">
                                    <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
                                    <Input
                                        placeholder="Invoice number, customer..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-8"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All statuses</SelectItem>
                                        <SelectItem value="paid">Paid</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="overdue">Overdue</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Work Type</label>
                                <Select value={workType} onValueChange={setWorkType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All types</SelectItem>
                                        <SelectItem value="maintenance">Maintenance</SelectItem>
                                        <SelectItem value="session">Session</SelectItem>
                                        <SelectItem value="combined">Combined</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Date From</label>
                                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Date To</label>
                                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">&nbsp;</label>
                                <div className="flex gap-2">
                                    <Button onClick={handleSearch}>Search</Button>
                                    <Button variant="outline" onClick={clearFilters}>
                                        Clear
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Invoices List */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Invoices</CardTitle>
                        <CardDescription>Total: {invoices.meta?.total || invoices.data.length} invoices</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {invoices.data.length > 0 ? (
                            <div className="space-y-4">
                                {invoices.data.map((invoice) => (
                                    <div key={invoice.id} className="flex items-center justify-between border-b pb-4 last:border-b-0">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                                <FileText className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <div className="font-medium">
                                                        <Link href={`/admin/financial/invoices/${invoice.id}`} className="hover:underline">
                                                            {invoice.invoice_number}
                                                        </Link>
                                                    </div>
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
                                                    {getStatusBadge(invoice)}
                                                </div>
                                                <div className="text-muted-foreground text-sm">Customer: {invoice.customer}</div>
                                                <div className="text-muted-foreground text-sm">Motorcycle: {invoice.motorcycle}</div>
                                                <div className="text-muted-foreground text-xs">
                                                    Issue: {new Date(invoice.issue_date).toLocaleDateString()} • Due:{' '}
                                                    {new Date(invoice.due_date).toLocaleDateString()}
                                                    {invoice.paid_at && ` • Paid: ${new Date(invoice.paid_at).toLocaleDateString()}`}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-4">
                                            <div className="text-right">
                                                <div className="text-lg font-semibold">{formatCurrency(invoice.total_amount)}</div>
                                                <div className="text-muted-foreground text-sm">Total: {formatCurrency(invoice.total_amount)}</div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/admin/financial/invoices/${invoice.id}`}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-muted-foreground py-8 text-center">
                                <FileText className="mx-auto mb-4 h-12 w-12 opacity-50" />
                                <p className="text-lg font-medium">No invoices found</p>
                                <p>Try adjusting your search filters</p>
                            </div>
                        )}

                        {/* Pagination */}
                        {invoices.links && (
                            <div className="mt-6 flex justify-center space-x-2">
                                {invoices.links.map((link: any, index: number) => (
                                    <Button
                                        key={index}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url)}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
