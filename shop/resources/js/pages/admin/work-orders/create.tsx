import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type CustomerOption, type MechanicOption, type AppointmentOption } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, Wrench } from 'lucide-react';
import { useState } from 'react';

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
        title: 'Create Work Order',
        href: '/admin/work-orders/create',
    },
];

interface Props {
    customers: CustomerOption[];
    mechanics: MechanicOption[];
    appointments: AppointmentOption[];
}

export default function WorkOrderCreate({ customers, mechanics, appointments }: Props) {
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerOption | null>(null);
    const [selectedMechanics, setSelectedMechanics] = useState<number[]>([]);

    const { data, setData, post, processing, errors } = useForm({
        user_id: '',
        motorcycle_id: '',
        appointment_id: '',
        description: '',
        status: 'pending',
        labor_cost: '',
        parts_cost: '',
        notes: '',
        mechanics: [] as number[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Update the form data with selected mechanics before submitting
        setData('mechanics', selectedMechanics);
        post('/admin/work-orders');
    };

    const handleCustomerChange = (customerId: string) => {
        const customer = customers.find(c => c.id.toString() === customerId);
        setSelectedCustomer(customer || null);
        setData('user_id', customerId);
        setData('motorcycle_id', ''); // Reset motorcycle selection
    };

    const handleMechanicToggle = (mechanicId: number) => {
        setSelectedMechanics(prev => {
            if (prev.includes(mechanicId)) {
                return prev.filter(id => id !== mechanicId);
            } else {
                return [...prev, mechanicId];
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Work Order" />
            
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Create Work Order</h1>
                        <p className="text-muted-foreground">Create a new work order for a customer</p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/admin/work-orders">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Work Orders
                        </Link>
                    </Button>
                </div>

                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Wrench className="mr-2 h-5 w-5" />
                            Work Order Information
                        </CardTitle>
                        <CardDescription>
                            Enter the details for the new work order
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Customer and Motorcycle Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="user_id">Customer *</Label>
                                    <Select value={data.user_id} onValueChange={handleCustomerChange}>
                                        <SelectTrigger className={errors.user_id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select a customer" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {customers.map((customer) => (
                                                <SelectItem key={customer.id} value={customer.id.toString()}>
                                                    {customer.name} ({customer.email})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.user_id && (
                                        <p className="text-sm text-red-500">{errors.user_id}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="motorcycle_id">Motorcycle *</Label>
                                    <Select 
                                        value={data.motorcycle_id} 
                                        onValueChange={(value) => setData('motorcycle_id', value)}
                                        disabled={!selectedCustomer}
                                    >
                                        <SelectTrigger className={errors.motorcycle_id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select a motorcycle" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {selectedCustomer?.motorcycles.map((motorcycle) => (
                                                <SelectItem key={motorcycle.id} value={motorcycle.id.toString()}>
                                                    {motorcycle.name} ({motorcycle.plate})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.motorcycle_id && (
                                        <p className="text-sm text-red-500">{errors.motorcycle_id}</p>
                                    )}
                                </div>
                            </div>

                            {/* Appointment Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="appointment_id">Related Appointment (Optional)</Label>
                                <Select value={data.appointment_id} onValueChange={(value) => setData('appointment_id', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select an appointment (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {appointments.map((appointment) => (
                                            <SelectItem key={appointment.id} value={appointment.id.toString()}>
                                                {appointment.customer} - {appointment.motorcycle} ({appointment.date} {appointment.time})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Description *</Label>
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className={`w-full min-h-[100px] px-3 py-2 border rounded-md resize-none ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Describe the work to be performed..."
                                    required
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-500">{errors.description}</p>
                                )}
                            </div>

                            {/* Status and Costs */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status *</Label>
                                    <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="labor_cost">Labor Cost (€)</Label>
                                    <Input
                                        id="labor_cost"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.labor_cost}
                                        onChange={(e) => setData('labor_cost', e.target.value)}
                                        className={errors.labor_cost ? 'border-red-500' : ''}
                                        placeholder="0.00"
                                    />
                                    {errors.labor_cost && (
                                        <p className="text-sm text-red-500">{errors.labor_cost}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="parts_cost">Parts Cost (€)</Label>
                                    <Input
                                        id="parts_cost"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.parts_cost}
                                        onChange={(e) => setData('parts_cost', e.target.value)}
                                        className={errors.parts_cost ? 'border-red-500' : ''}
                                        placeholder="0.00"
                                    />
                                    {errors.parts_cost && (
                                        <p className="text-sm text-red-500">{errors.parts_cost}</p>
                                    )}
                                </div>
                            </div>

                            {/* Mechanics Assignment */}
                            <div className="space-y-2">
                                <Label>Assign Mechanics</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {mechanics.map((mechanic) => (
                                        <div key={mechanic.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`mechanic-${mechanic.id}`}
                                                checked={selectedMechanics.includes(mechanic.id)}
                                                onCheckedChange={() => handleMechanicToggle(mechanic.id)}
                                            />
                                            <Label htmlFor={`mechanic-${mechanic.id}`} className="text-sm">
                                                {mechanic.name} ({mechanic.email})
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md resize-none"
                                    placeholder="Additional notes or instructions..."
                                />
                            </div>

                            <div className="flex items-center justify-end space-x-2">
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/admin/work-orders">Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creating...' : 'Create Work Order'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
} 