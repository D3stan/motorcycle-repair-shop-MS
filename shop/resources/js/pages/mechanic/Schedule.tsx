import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { PageProps, WorkOrder } from '@/types';
import { Head } from '@inertiajs/react';

interface SchedulePageProps extends PageProps {
    upcomingWorkOrders: WorkOrder[];
}

export default function Schedule({ upcomingWorkOrders }: SchedulePageProps) {
    return (
        <AppLayout>
            <Head title="My Schedule" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">My Schedule</h1>
                        <p className="text-muted-foreground">View your upcoming work orders and assignments</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Upcoming Work Orders</CardTitle>
                        <CardDescription>Work orders assigned to you that are scheduled or in progress.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {upcomingWorkOrders.length > 0 ? (
                            <ul className="space-y-4">
                                {upcomingWorkOrders.map((order) => (
                                    <li key={order.CodiceIntervento} className="border-b pb-2">
                                        <p className="font-semibold">{order.Nome}</p>
                                        <p>
                                            <strong>Motorcycle:</strong> {order.motorcycle.motorcycle_model.Marca}{' '}
                                            {order.motorcycle.motorcycle_model.Nome}
                                        </p>
                                        <p>
                                            <strong>Status:</strong> {order.Stato}
                                        </p>
                                        <p>
                                            <strong>Date Assigned:</strong> {new Date(order.created_at).toLocaleDateString()}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No upcoming work orders found.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
