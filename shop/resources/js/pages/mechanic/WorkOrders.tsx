import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { PageProps, PaginatedResponse, WorkOrder } from '@/types';
import { Head, Link } from '@inertiajs/react';

interface WorkOrdersPageProps extends PageProps {
    workOrders: PaginatedResponse<WorkOrder>;
}

export default function WorkOrders({ workOrders }: WorkOrdersPageProps) {
    return (
        <AppLayout>
            <Head title="My Work Orders" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">My Work Orders</h1>
                        <p className="text-muted-foreground">Work orders assigned to you for maintenance and repairs</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Assigned Work Orders</CardTitle>
                        <CardDescription>A list of all work orders assigned to you.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flow-root">
                            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                                    <table className="divide-border min-w-full divide-y">
                                        <thead>
                                            <tr>
                                                <th scope="col" className="text-foreground py-3.5 pr-3 pl-4 text-left text-sm font-semibold sm:pl-0">
                                                    Work Order
                                                </th>
                                                <th scope="col" className="text-foreground px-3 py-3.5 text-left text-sm font-semibold">
                                                    Motorcycle
                                                </th>
                                                <th scope="col" className="text-foreground px-3 py-3.5 text-left text-sm font-semibold">
                                                    Customer
                                                </th>
                                                <th scope="col" className="text-foreground px-3 py-3.5 text-left text-sm font-semibold">
                                                    Status
                                                </th>
                                                <th scope="col" className="relative py-3.5 pr-4 pl-3 sm:pr-0">
                                                    <span className="sr-only">View</span>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-border divide-y">
                                            {workOrders.data.map((order) => (
                                                <tr key={order.CodiceIntervento}>
                                                    <td className="text-foreground py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap sm:pl-0">
                                                        {order.Nome}
                                                    </td>
                                                    <td className="text-muted-foreground px-3 py-4 text-sm whitespace-nowrap">
                                                        {order.motorcycle.motorcycle_model.Marca} {order.motorcycle.motorcycle_model.Nome}
                                                    </td>
                                                    <td className="text-muted-foreground px-3 py-4 text-sm whitespace-nowrap">
                                                        {order.motorcycle.user.first_name} {order.motorcycle.user.last_name}
                                                    </td>
                                                    <td className="text-muted-foreground px-3 py-4 text-sm whitespace-nowrap">{order.Stato}</td>
                                                    <td className="relative py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-0">
                                                        <Link
                                                            href={route('mechanic.work-orders.show', order.CodiceIntervento)}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            View
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
