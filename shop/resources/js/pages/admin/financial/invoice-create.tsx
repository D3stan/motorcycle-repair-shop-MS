import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Calculator, Clock, Euro, Wrench } from 'lucide-react';
import { useState } from 'react';

interface WorkOrder {
    id: string;
    description: string;
    started_at: string;
    completed_at: string;
    labor_hours: number;
    labor_cost: number;
    parts_cost: number;
    total_cost: number;
    motorcycle: {
        brand: string;
        model: string;
        plate: string;
        vin: string;
    };
    customer: {
        id: number;
        name: string;
        email: string;
        cf: string;
    };
}

interface Part {
    name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
}

interface InvoiceCreateProps {
    workOrder: WorkOrder;
    partsBreakdown: Part[];
    defaultHourlyRate: number;
}

export default function InvoiceCreate({ workOrder, partsBreakdown, defaultHourlyRate }: InvoiceCreateProps) {
    const [hourlyRate, setHourlyRate] = useState(defaultHourlyRate);

    const { data, setData, post, processing, errors } = useForm({
        hourly_rate: defaultHourlyRate,
        notes: '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Financial',
            href: '/admin/financial',
        },
        {
            title: 'Work Orders',
            href: '/admin/work-orders',
        },
        {
            title: `Work Order #${workOrder.id}`,
            href: `/admin/work-orders/${workOrder.id}`,
        },
        {
            title: 'Create Invoice',
            href: `/admin/financial/work-orders/${workOrder.id}/create-invoice`,
        },
    ];

    // Calculate totals based on current hourly rate
    const calculatedLaborCost = workOrder.labor_hours * hourlyRate;
    const calculatedTotal = workOrder.parts_cost + calculatedLaborCost;

    const handleHourlyRateChange = (value: number) => {
        setHourlyRate(value);
        setData('hourly_rate', value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.financial.work-orders.store-invoice', workOrder.id));
    };

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('it-IT', {
            style: 'currency',
            currency: 'EUR',
        }).format(amount);
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('it-IT');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Create Invoice - Work Order #${workOrder.id}`} />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Create Invoice</h1>
                        <p className="text-muted-foreground">Generate invoice for completed work order #{workOrder.id}</p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href={route('admin.work-orders.show', workOrder.id)}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Work Order
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column - Work Order & Customer Info */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Customer Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Customer Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label className="text-muted-foreground text-sm font-medium">Name</Label>
                                        <p className="font-medium">{workOrder.customer.name}</p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground text-sm font-medium">Email</Label>
                                        <p className="font-medium">{workOrder.customer.email}</p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground text-sm font-medium">Codice Fiscale</Label>
                                        <p className="font-medium">{workOrder.customer.cf}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Motorcycle Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Motorcycle Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label className="text-muted-foreground text-sm font-medium">Make & Model</Label>
                                        <p className="font-medium">
                                            {workOrder.motorcycle.brand} {workOrder.motorcycle.model}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground text-sm font-medium">License Plate</Label>
                                        <p className="font-medium">{workOrder.motorcycle.plate}</p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground text-sm font-medium">VIN</Label>
                                        <p className="font-medium">{workOrder.motorcycle.vin}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Work Order Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Work Order Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label className="text-muted-foreground text-sm font-medium">Started</Label>
                                        <p className="font-medium">{formatDate(workOrder.started_at)}</p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground text-sm font-medium">Completed</Label>
                                        <p className="font-medium">{formatDate(workOrder.completed_at)}</p>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground text-sm font-medium">Description</Label>
                                    <p className="font-medium">{workOrder.description}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Parts Breakdown */}
                        {partsBreakdown.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Parts Used</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {partsBreakdown.map((part, index) => (
                                            <div key={index} className="flex items-center justify-between border-b py-2 last:border-b-0">
                                                <div>
                                                    <p className="font-medium">{part.name}</p>
                                                    <p className="text-muted-foreground text-sm">
                                                        {part.quantity} × {formatCurrency(part.unit_price)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium">{formatCurrency(part.total_price)}</p>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="flex items-center justify-between pt-3 font-semibold">
                                            <span>Parts Total</span>
                                            <span>{formatCurrency(workOrder.parts_cost)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Invoice Form */}
                    <div className="space-y-6">
                        {/* Cost Calculator */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calculator className="h-4 w-4" />
                                    Cost Calculator
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Wrench className="text-muted-foreground h-4 w-4" />
                                            <span>Parts</span>
                                        </div>
                                        <span className="font-medium">{formatCurrency(workOrder.parts_cost)}</span>
                                    </div>

                                    <Separator />

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Clock className="text-muted-foreground h-4 w-4" />
                                            <span>Labor ({workOrder.labor_hours}h)</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor="hourlyRate" className="text-sm">
                                                Hourly Rate
                                            </Label>
                                            <div className="flex items-center gap-1">
                                                <Input
                                                    id="hourlyRate"
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={hourlyRate}
                                                    onChange={(e) => handleHourlyRateChange(Number(e.target.value))}
                                                    className="w-20 text-sm"
                                                />
                                                <span className="text-muted-foreground text-sm">€/h</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground text-sm">Labor Total</span>
                                            <span className="font-medium">{formatCurrency(calculatedLaborCost)}</span>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="flex items-center justify-between text-lg font-bold">
                                        <div className="flex items-center gap-2">
                                            <Euro className="h-4 w-4" />
                                            <span>Total</span>
                                        </div>
                                        <span>{formatCurrency(calculatedTotal)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Invoice Form */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Generate Invoice</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Notes (Optional)</Label>
                                        <Textarea
                                            id="notes"
                                            placeholder="Additional notes for the invoice..."
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            rows={3}
                                        />
                                        {errors.notes && <p className="text-sm text-red-600">{errors.notes}</p>}
                                    </div>

                                    <Button type="submit" className="w-full" disabled={processing}>
                                        {processing ? 'Creating Invoice...' : 'Create Invoice'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
