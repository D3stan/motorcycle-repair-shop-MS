import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { PageProps, WorkOrder } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import React from 'react';

interface ShowWorkOrderPageProps extends PageProps {
    workOrder: WorkOrder;
}

export default function ShowWorkOrder({ workOrder }: ShowWorkOrderPageProps) {
    const { data, setData, patch, processing, errors } = useForm({
        status: workOrder.Stato,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        patch(route('mechanic.work-orders.update', workOrder.CodiceIntervento));
    }

    return (
        <AppLayout>
            <Head title={`Work Order - ${workOrder.Nome}`} />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle>{workOrder.Nome}</CardTitle>
                                <CardDescription>Work order details</CardDescription>
                            </div>
                            <form onSubmit={submit} className="flex items-center gap-2">
                                <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Update status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button type="submit" disabled={processing}>
                                    Update
                                </Button>
                            </form>
                        </div>
                        {errors.status && <p className="mt-1 text-xs text-red-500">{errors.status}</p>}
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>
                                    <strong>Status:</strong> {workOrder.Stato}
                                </p>
                                <p>
                                    <strong>Description:</strong> {workOrder.Note}
                                </p>
                                <p>
                                    <strong>Hours Worked:</strong> {workOrder.OreImpiegate}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Motorcycle</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>
                                    <strong>Model:</strong> {workOrder.motorcycle.motorcycle_model.Marca} {workOrder.motorcycle.motorcycle_model.Nome}
                                </p>
                                <p>
                                    <strong>License Plate:</strong> {workOrder.motorcycle.Targa}
                                </p>
                                <p>
                                    <strong>Owner:</strong> {workOrder.motorcycle.user.first_name} {workOrder.motorcycle.user.last_name}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Assigned Mechanics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul>
                                    {workOrder.mechanics.map((mechanic) => (
                                        <li key={mechanic.id}>
                                            {mechanic.first_name} {mechanic.last_name}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Parts Used</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {workOrder.parts && workOrder.parts.length > 0 ? (
                                    <ul>
                                        {workOrder.parts.map((part) => (
                                            <li key={part.CodiceRicambio}>
                                                {part.Nome} (x{part.pivot.Quantita})
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>No parts used yet.</p>
                                )}
                            </CardContent>
                        </Card>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
