import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { ArrowLeft, Calculator, Euro, Clock, Wrench, FileText, Search } from 'lucide-react';

interface WorkOrder {
    id: string;
    description: string;
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

interface InvoiceCreateSelectProps {
    availableWorkOrders: WorkOrder[];
    defaultHourlyRate: number;
}

export default function InvoiceCreateSelect({ availableWorkOrders, defaultHourlyRate }: InvoiceCreateSelectProps) {
    const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
    const [hourlyRate, setHourlyRate] = useState(defaultHourlyRate);
    const [searchTerm, setSearchTerm] = useState('');
    
    const { data, setData, post, processing, errors } = useForm({
        work_order_id: '',
        hourly_rate: defaultHourlyRate,
        notes: '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Financial',
            href: '/admin/financial',
        },
        {
            title: 'Invoices',
            href: '/admin/financial/invoices',
        },
        {
            title: 'Create Invoice',
            href: '/admin/financial/invoices/create',
        },
    ];

    // Filter work orders based on search term
    const filteredWorkOrders = availableWorkOrders.filter(workOrder =>
        workOrder.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workOrder.motorcycle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workOrder.motorcycle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workOrder.motorcycle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workOrder.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleWorkOrderSelect = (workOrder: WorkOrder) => {
        setSelectedWorkOrder(workOrder);
        setData('work_order_id', workOrder.id);
    };

    const handleHourlyRateChange = (value: number) => {
        setHourlyRate(value);
        setData('hourly_rate', value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedWorkOrder) return;
        
        post('/admin/financial/invoices');
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

    // Calculate totals based on current hourly rate and selected work order
    const calculatedLaborCost = selectedWorkOrder ? selectedWorkOrder.labor_hours * hourlyRate : 0;
    const calculatedTotal = selectedWorkOrder ? selectedWorkOrder.parts_cost + calculatedLaborCost : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Invoice" />
            
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Create Invoice</h1>
                        <p className="text-muted-foreground">Select a completed work order to generate an invoice</p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column - Work Order Selection */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Search */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Available Work Orders</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="relative">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search by customer, motorcycle, or description..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-8"
                                        />
                                    </div>
                                    
                                    {filteredWorkOrders.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <p>No completed work orders available for invoicing.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 max-h-96 overflow-y-auto">
                                            {filteredWorkOrders.map((workOrder) => (
                                                <div
                                                    key={workOrder.id}
                                                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                                        selectedWorkOrder?.id === workOrder.id 
                                                            ? 'border-primary bg-primary/5' 
                                                            : 'border-border hover:border-primary/50'
                                                    }`}
                                                    onClick={() => handleWorkOrderSelect(workOrder)}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Badge variant="outline">Work Order #{workOrder.id}</Badge>
                                                                <span className="text-sm text-muted-foreground">
                                                                    Completed: {formatDate(workOrder.completed_at)}
                                                                </span>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="font-medium">{workOrder.customer.name}</p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {workOrder.motorcycle.brand} {workOrder.motorcycle.model} • {workOrder.motorcycle.plate}
                                                                </p>
                                                                <p className="text-sm">{workOrder.description}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-semibold">{formatCurrency(workOrder.total_cost)}</p>
                                                            <p className="text-sm text-muted-foreground">{workOrder.labor_hours}h labor</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Selected Work Order Details */}
                        {selectedWorkOrder && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Selected Work Order Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Customer</Label>
                                            <p className="font-medium">{selectedWorkOrder.customer.name}</p>
                                            <p className="text-sm text-muted-foreground">{selectedWorkOrder.customer.email}</p>
                                            <p className="text-sm text-muted-foreground">CF: {selectedWorkOrder.customer.cf}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Motorcycle</Label>
                                            <p className="font-medium">{selectedWorkOrder.motorcycle.brand} {selectedWorkOrder.motorcycle.model}</p>
                                            <p className="text-sm text-muted-foreground">{selectedWorkOrder.motorcycle.plate}</p>
                                            <p className="text-sm text-muted-foreground">VIN: {selectedWorkOrder.motorcycle.vin}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Work Description</Label>
                                        <p className="font-medium">{selectedWorkOrder.description}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Completed Date</Label>
                                        <p className="font-medium">{formatDate(selectedWorkOrder.completed_at)}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Invoice Form */}
                    <div className="space-y-6">
                        {/* Cost Calculator */}
                        {selectedWorkOrder && (
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
                                                <Wrench className="h-4 w-4 text-muted-foreground" />
                                                <span>Parts</span>
                                            </div>
                                            <span className="font-medium">{formatCurrency(selectedWorkOrder.parts_cost)}</span>
                                        </div>
                                        
                                        <Separator />
                                        
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                <span>Labor ({selectedWorkOrder.labor_hours}h)</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Label htmlFor="hourlyRate" className="text-sm">Hourly Rate</Label>
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
                                                    <span className="text-sm text-muted-foreground">€/h</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Labor Total</span>
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
                        )}

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
                                        {errors.notes && (
                                            <p className="text-sm text-red-600">{errors.notes}</p>
                                        )}
                                    </div>

                                    <Button 
                                        type="submit" 
                                        className="w-full" 
                                        disabled={processing || !selectedWorkOrder}
                                    >
                                        <FileText className="mr-2 h-4 w-4" />
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