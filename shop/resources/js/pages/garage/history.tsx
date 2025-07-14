import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

interface Motorcycle {
    id: number;
    brand: string;
    model: string;
    year: number;
    plate: string;
}

interface ServiceRecord {
    id: number;
    description: string;
    status: string;
    started_at: string | null;
    completed_at: string | null;
    total_cost: number;
    invoice_number: string | null;
}

interface ServiceHistoryProps {
    motorcycle: Motorcycle;
    serviceHistory: ServiceRecord[];
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

const getStatusVariant = (status: string) => {
    switch (status) {
        case 'pending':
            return 'secondary';
        case 'in_progress':
            return 'default';
        case 'completed':
            return 'default';
        case 'cancelled':
            return 'destructive';
        default:
            return 'secondary';
    }
};

export default function ServiceHistory({ motorcycle, serviceHistory }: ServiceHistoryProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'My Garage',
            href: '/garage',
        },
        {
            title: `${motorcycle.brand} ${motorcycle.model}`,
            href: `/garage/${motorcycle.id}/history`,
        },
    ];

    const formatDate = (date: string | null) => {
        if (!date) return 'Not completed';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatCurrency = (amount: number) => {
        return `€${amount.toFixed(2)}`;
    };

    const formatStatus = (status: string) => {
        return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
    };

    const totalSpent = serviceHistory.filter((record) => record.status === 'completed').reduce((sum, record) => sum + record.total_cost, 0);

    const completedServices = serviceHistory.filter((record) => record.status === 'completed').length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Service History - ${motorcycle.brand} ${motorcycle.model}`} />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Service History</h1>
                        <p className="text-muted-foreground">
                            {motorcycle.brand} {motorcycle.model} ({motorcycle.year}) - {motorcycle.plate}
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/garage">Back to Garage</Link>
                    </Button>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Total Services</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{serviceHistory.length}</div>
                            <p className="text-muted-foreground mt-1 text-xs">{completedServices} completed</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Total Spent</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
                            <p className="text-muted-foreground mt-1 text-xs">On completed services</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Last Service</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {serviceHistory.length > 0 ? formatDate(serviceHistory[0].completed_at) : 'None'}
                            </div>
                            <p className="text-muted-foreground mt-1 text-xs">Most recent completion</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Service History List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Service Records</CardTitle>
                        <CardDescription>Complete service history for this motorcycle</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {serviceHistory.length === 0 ? (
                            <div className="py-12 text-center">
                                <p className="text-muted-foreground mb-2 text-lg font-medium">No service history found</p>
                                <p className="text-muted-foreground text-sm">This motorcycle hasn't had any services recorded yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {serviceHistory.map((record, index) => (
                                    <div
                                        key={record.id}
                                        className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4 transition-colors"
                                    >
                                        <div className="flex-1">
                                            <div className="mb-2 flex items-center gap-3">
                                                <h3 className="font-medium">Work Order #{record.id}</h3>
                                                <Badge variant={getStatusVariant(record.status)} className={getStatusColor(record.status)}>
                                                    {formatStatus(record.status)}
                                                </Badge>
                                            </div>
                                            <p className="text-muted-foreground mb-2 text-sm">{record.description}</p>
                                            <div className="text-muted-foreground flex gap-6 text-xs">
                                                <span>
                                                    <strong>Started:</strong> {formatDate(record.started_at)}
                                                </span>
                                                <span>
                                                    <strong>Completed:</strong> {formatDate(record.completed_at)}
                                                </span>
                                                {record.invoice_number && (
                                                    <span>
                                                        <strong>Invoice:</strong> {record.invoice_number}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-semibold">{formatCurrency(record.total_cost)}</div>
                                            <Button variant="outline" size="sm" asChild className="mt-2">
                                                <Link href={`/work-orders/${record.id}`}>View Details</Link>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4">
                    <Button asChild>
                        <Link href="/appointments">Book New Service</Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/work-orders">View All Work Orders</Link>
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
