import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type AdminPart } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit, Package, Wrench, Bike } from 'lucide-react';

interface Props {
    part: AdminPart;
    compatibleModels: Array<{
        id: number;
        brand: string;
        name: string;
        model_code: string;
        engine_size: number;
        segment: string;
    }>;
    workOrderUsage: Array<{
        id: number;
        description: string;
        status: string;
        customer: string;
        quantity: number;
        unit_price: number;
        total_price: number;
        created_at: string;
    }>;
}

export default function InventoryShow({ part, compatibleModels, workOrderUsage }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Admin Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Inventory',
            href: '/admin/inventory',
        },
        {
            title: `${part.brand} ${part.name}`,
            href: `/admin/inventory/${part.id}`,
        },
    ];

    const getCategoryBadge = (category: string) => {
        const colors = {
            'Engine': 'bg-red-100 text-red-800',
            'Brake': 'bg-orange-100 text-orange-800',
            'Suspension': 'bg-blue-100 text-blue-800',
            'Electrical': 'bg-yellow-100 text-yellow-800',
            'Body': 'bg-green-100 text-green-800',
            'Transmission': 'bg-purple-100 text-purple-800',
            'Exhaust': 'bg-gray-100 text-gray-800',
            'Fuel System': 'bg-pink-100 text-pink-800',
        };
        return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${part.brand} ${part.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">{part.brand} {part.name}</h1>
                        <p className="text-muted-foreground">Part Code: {part.part_code}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild>
                            <Link href={route('admin.inventory.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Inventory
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={route('admin.inventory.edit', part.id)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Part
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid gap-4 lg:grid-cols-3">
                    {/* Part Details */}
                    <div className="lg:col-span-2 space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Part Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Part Code</p>
                                        <p className="text-lg font-mono">{part.part_code}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Brand</p>
                                        <p className="text-lg">{part.brand}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Name</p>
                                        <p className="text-lg">{part.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Category</p>
                                        <Badge className={getCategoryBadge(part.category)}>
                                            {part.category}
                                        </Badge>
                                    </div>
                                </div>
                                {part.description && (
                                    <>
                                        <Separator />
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Description</p>
                                            <p className="text-sm">{part.description}</p>
                                        </div>
                                    </>
                                )}
                                <Separator />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Supplier</p>
                                    <p className="text-lg">{part.supplier_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Created</p>
                                    <p className="text-sm">{part.created_at}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Compatible Models */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Bike className="h-5 w-5" />
                                    Compatible Motorcycle Models
                                </CardTitle>
                                <CardDescription>
                                    Motorcycle models that can use this part
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {compatibleModels.length > 0 ? (
                                    <div className="grid gap-3">
                                        {compatibleModels.map((model) => (
                                            <div key={model.id} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                                                <div>
                                                    <p className="font-medium">{model.brand} {model.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {model.model_code} • {model.engine_size}cc • {model.segment}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">No compatible models assigned</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Work Order Usage */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Wrench className="h-5 w-5" />
                                    Work Order Usage
                                </CardTitle>
                                <CardDescription>
                                    History of this part being used in work orders
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {workOrderUsage.length > 0 ? (
                                    <div className="space-y-3">
                                        {workOrderUsage.map((usage) => (
                                            <div key={usage.id} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                                                <div>
                                                    <p className="font-medium">{usage.description}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Customer: {usage.customer} • Status: {usage.status}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {usage.created_at}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium">Qty: {usage.quantity}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        €{usage.unit_price.toFixed(2)} each
                                                    </p>
                                                    <p className="text-sm font-medium">
                                                        Total: €{usage.total_price.toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">This part has not been used in any work orders yet</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
} 