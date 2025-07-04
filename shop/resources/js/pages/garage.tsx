import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'My Garage',
        href: '/garage',
    },
];

interface Motorcycle {
    id: number;
    brand: string;
    model: string;
    year: number;
    plate: string;
    vin: string;
    color?: string;
    engine_size?: number;
}

interface GarageProps {
    motorcycles: Motorcycle[];
    pendingServicesCount: number;
    lastServiceDate: string;
}

export default function Garage({ motorcycles, pendingServicesCount, lastServiceDate }: GarageProps) {
    const handleAddMotorcycle = () => {
        // TODO: Implement modal/form to add new motorcycle
        console.log('Add new motorcycle functionality to be implemented');
    };

    const handleEditMotorcycle = (motorcycleId: number) => {
        // TODO: Implement edit motorcycle functionality
        console.log(`Edit motorcycle ${motorcycleId} functionality to be implemented`);
    };

    const handleRemoveMotorcycle = (motorcycleId: number) => {
        // TODO: Implement remove motorcycle functionality
        console.log(`Remove motorcycle ${motorcycleId} functionality to be implemented`);
    };

    const handleViewHistory = (motorcycleId: number) => {
        // TODO: Implement view motorcycle service history
        window.location.href = `/garage/${motorcycleId}/history`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Garage" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">My Garage</h1>
                        <p className="text-muted-foreground">Manage your motorcycles and view their service history</p>
                    </div>
                    <Button onClick={handleAddMotorcycle}>
                        Add New Motorcycle
                    </Button>
                </div>

                {/* Motorcycles Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {motorcycles.map((motorcycle) => (
                        <Card key={motorcycle.id} className="relative">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>{motorcycle.brand} {motorcycle.model}</span>
                                    <span className="text-sm font-normal text-muted-foreground">{motorcycle.year}</span>
                                </CardTitle>
                                <CardDescription>
                                    Plate: {motorcycle.plate}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-sm">
                                    <p><strong>VIN:</strong> {motorcycle.vin}</p>
                                    {motorcycle.color && <p><strong>Color:</strong> {motorcycle.color}</p>}
                                    {motorcycle.engine_size && <p><strong>Engine:</strong> {motorcycle.engine_size}cc</p>}
                                </div>
                                
                                <div className="flex flex-col gap-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => handleViewHistory(motorcycle.id)}
                                        className="w-full"
                                    >
                                        View Service History
                                    </Button>
                                    <div className="flex gap-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => handleEditMotorcycle(motorcycle.id)}
                                            className="flex-1"
                                        >
                                            Edit
                                        </Button>
                                        <Button 
                                            variant="destructive" 
                                            size="sm"
                                            onClick={() => handleRemoveMotorcycle(motorcycle.id)}
                                            className="flex-1"
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Empty State */}
                {motorcycles.length === 0 && (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <h3 className="text-lg font-semibold mb-2">No motorcycles in your garage</h3>
                            <p className="text-muted-foreground mb-4 text-center">
                                Add your first motorcycle to start managing your service history and appointments.
                            </p>
                            <Button onClick={handleAddMotorcycle}>
                                Add Your First Motorcycle
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Quick Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Total Motorcycles</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{motorcycles.length}</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Pending Services</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{pendingServicesCount}</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Last Service</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{lastServiceDate}</div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
} 