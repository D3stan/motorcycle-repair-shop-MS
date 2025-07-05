import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type AdminPart } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Edit, Trash2, Plus, Package, AlertTriangle, DollarSign } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Inventory',
        href: '/admin/inventory',
    },
];

interface Props {
    parts: {
        data: AdminPart[];
        links?: any[];
        meta?: any;
    };
}

export default function InventoryIndex({ parts }: Props) {
    const handleDelete = (part: AdminPart) => {
        if (confirm(`Are you sure you want to delete ${part.name}?`)) {
            router.delete(route('admin.inventory.destroy', part.id));
        }
    };

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

    const getStockBadge = (part: AdminPart) => {
        if (part.is_low_stock) {
            return 'bg-red-100 text-red-800';
        }
        return 'bg-green-100 text-green-800';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventory Management" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Inventory Management</h1>
                        <p className="text-muted-foreground">Manage parts, stock levels, and suppliers</p>
                    </div>
                    <Button asChild>
                        <Link href={route('admin.inventory.create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Part
                        </Link>
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Total Parts</CardTitle>
                            <CardDescription>Available in inventory</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{parts.data.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Low Stock Items</CardTitle>
                            <CardDescription>Need restocking</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">
                                {parts.data.filter(part => part.is_low_stock).length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Categories</CardTitle>
                            <CardDescription>Different part types</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {new Set(parts.data.map(part => part.category)).size}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Total Value</CardTitle>
                            <CardDescription>Inventory worth</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                €{parts.data.reduce((sum, part) => sum + (part.stock_quantity * part.supplier_price), 0).toFixed(2)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Parts Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Parts Inventory
                        </CardTitle>
                        <CardDescription>Manage your parts inventory and stock levels</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {parts.data.length > 0 ? (
                            <div className="space-y-4">
                                {parts.data.map((part) => (
                                    <div key={part.id} className="flex items-center justify-between border-b pb-4 last:border-b-0 last:pb-0">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                                                <Package className="h-6 w-6" />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-medium">{part.brand} {part.name}</h3>
                                                    <Badge variant="outline">{part.part_code}</Badge>
                                                    <Badge className={getCategoryBadge(part.category)}>
                                                        {part.category}
                                                    </Badge>
                                                    {part.is_low_stock && (
                                                        <Badge variant="destructive" className="flex items-center gap-1">
                                                            <AlertTriangle className="h-3 w-3" />
                                                            Low Stock
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <span>Stock: {part.stock_quantity}/{part.minimum_stock}</span>
                                                    <span>Supplier: {part.supplier_name}</span>
                                                    <span className="flex items-center gap-1">
                                                        <DollarSign className="h-3 w-3" />
                                                        €{part.supplier_price.toFixed(2)} → €{part.selling_price.toFixed(2)}
                                                    </span>
                                                </div>
                                                {part.description && (
                                                    <p className="text-sm text-muted-foreground">{part.description}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={route('admin.inventory.show', part.id)}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={route('admin.inventory.edit', part.id)}>
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => handleDelete(part)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-medium">No parts found</h3>
                                <p className="mt-2 text-muted-foreground">
                                    Get started by adding your first part to the inventory.
                                </p>
                                <Button asChild className="mt-4">
                                    <Link href={route('admin.inventory.create')}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add New Part
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
} 