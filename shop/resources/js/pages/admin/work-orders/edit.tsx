import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type CustomerOption, type MechanicOption } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Wrench } from 'lucide-react';
import { useState, useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Work Orders',
        href: '/admin/work-orders',
    },
];

interface WorkOrderEditData {
    id: number;
    type: 'work_order' | 'work_session';
    user_id: number;
    motorcycle_id: number;
    appointment_id?: number;
    description: string;
    status: string;
    hours_worked: number;
    notes?: string;
    assigned_mechanics: number[];
}

interface Props {
    workOrder: WorkOrderEditData;
    customers: CustomerOption[];
    mechanics: MechanicOption[];
    isSession?: boolean;
}

export default function WorkOrderEdit({ workOrder, customers, mechanics, isSession = false }: Props) {
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerOption | null>(null);
    const [selectedMechanics, setSelectedMechanics] = useState<number[]>(workOrder.assigned_mechanics || []);

    const breadcrumbsWithEdit: BreadcrumbItem[] = [
        ...breadcrumbs,
        {
            title: `Work Order #${workOrder.id}`,
            href: `/admin/work-orders/${workOrder.id}`,
        },
        {
            title: 'Edit',
            href: `/admin/work-orders/${workOrder.id}/edit`,
        },
    ];

    const { data, setData, put, processing, errors } = useForm({
        user_id: workOrder.user_id?.toString() || '',
        motorcycle_id: workOrder.motorcycle_id?.toString() || '',
        appointment_id: workOrder.appointment_id?.toString() || '',
        description: workOrder.description || '',
        status: workOrder.status || 'pending',
        hours_worked: workOrder.hours_worked?.toString() || '',
        notes: workOrder.notes || '',
        mechanics: workOrder.assigned_mechanics || [] as number[],
    });

    // Initialize selected customer on mount
    useEffect(() => {
        const customer = customers.find(c => c.id.toString() === data.user_id);
        setSelectedCustomer(customer || null);
    }, [customers, data.user_id]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Update the form data with selected mechanics before submitting
        setData('mechanics', selectedMechanics);
        
        if (isSession) {
            put(`/admin/work-orders/${workOrder.id}?type=work_session`);
        } else {
            put(`/admin/work-orders/${workOrder.id}`);
        }
    };

    const handleCustomerChange = (customerId: string) => {
        const customer = customers.find(c => c.id.toString() === customerId);
        setSelectedCustomer(customer || null);
        setData('user_id', customerId);
        // Only reset motorcycle if changing to a different customer
        if (customerId !== data.user_id) {
            setData('motorcycle_id', '');
        }
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
        <AppLayout breadcrumbs={breadcrumbsWithEdit}>
            <Head title={`Edit Work Order #${workOrder.id}`} />
            
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Edit {isSession ? 'Session' : 'Maintenance'} #{workOrder.id}</h1>
                        <p className="text-muted-foreground">Update {isSession ? 'session' : 'maintenance'} details and assignments</p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href={`/admin/work-orders/${workOrder.id}${isSession ? '?type=work_session' : ''}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Details
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
                            Update the details for this work order
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

                            {/* Status and Hours Worked */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    <Label htmlFor="hours_worked">Hours Worked</Label>
                                    <Input
                                        id="hours_worked"
                                        type="number"
                                        step="0.25"
                                        min="0"
                                        value={data.hours_worked}
                                        onChange={(e) => setData('hours_worked', e.target.value)}
                                        className={errors.hours_worked ? 'border-red-500' : ''}
                                        placeholder="0.00"
                                    />
                                    {errors.hours_worked && (
                                        <p className="text-sm text-red-500">{errors.hours_worked}</p>
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
                                    <Link href={`/admin/work-orders/${workOrder.id}${isSession ? '?type=work_session' : ''}`}>Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Updating...' : `Update ${isSession ? 'Session' : 'Maintenance'}`}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
} 