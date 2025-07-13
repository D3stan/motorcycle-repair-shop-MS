import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { PageProps, PaginatedResponse, Part } from '@/types';
import { Head } from '@inertiajs/react';

interface InventoryPageProps extends PageProps {
    parts: PaginatedResponse<Part>;
}

export default function Inventory({ parts }: InventoryPageProps) {
    return (
        <AppLayout>
            <Head title="Parts Inventory" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Parts Inventory</h1>
                        <p className="text-muted-foreground">Browse available parts and inventory stock levels</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Available Parts</CardTitle>
                        <CardDescription>Current inventory of motorcycle parts and components.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flow-root">
                            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                                    <table className="divide-border min-w-full divide-y">
                                        <thead>
                                            <tr>
                                                <th scope="col" className="text-foreground py-3.5 pr-3 pl-4 text-left text-sm font-semibold sm:pl-0">
                                                    Part Name
                                                </th>
                                                <th scope="col" className="text-foreground px-3 py-3.5 text-left text-sm font-semibold">
                                                    Category
                                                </th>
                                                <th scope="col" className="text-foreground px-3 py-3.5 text-left text-sm font-semibold">
                                                    Supplier
                                                </th>
                                                <th scope="col" className="text-foreground px-3 py-3.5 text-left text-sm font-semibold">
                                                    Price
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-border divide-y">
                                            {parts.data.map((part) => (
                                                <tr key={part.CodiceRicambio}>
                                                    <td className="text-foreground py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap sm:pl-0">
                                                        {part.Nome}
                                                    </td>
                                                    <td className="text-muted-foreground px-3 py-4 text-sm whitespace-nowrap">{part.Categoria}</td>
                                                    <td className="text-muted-foreground px-3 py-4 text-sm whitespace-nowrap">
                                                        {part.supplier?.Nome ?? 'N/A'}
                                                    </td>
                                                    <td className="text-muted-foreground px-3 py-4 text-sm whitespace-nowrap">
                                                        €{part.PrezzoFornitore}
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
