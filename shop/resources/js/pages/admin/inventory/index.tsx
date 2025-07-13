import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type AdminPart, type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Eye, Package, Plus, Trash2 } from 'lucide-react';

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
        links: any[];
        meta: any;
    };
}

export default function InventoryIndex({ parts }: Props) {
    const handleDelete = (part: AdminPart) => {
        if (confirm(`Are you sure you want to delete ${part.name}?`)) {
            router.delete(route('admin.inventory.destroy', part.id));
        }
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
                            <div className="text-2xl font-bold text-orange-600">0</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Categories</CardTitle>
                            <CardDescription>Different part types</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{new Set(parts.data.map((p) => p.category)).size}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Total Value</CardTitle>
                            <CardDescription>Inventory worth</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">€{parts.data.reduce((sum, part) => sum + part.supplier_price, 0).toFixed(2)}</div>
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
                                            <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-lg">
                                                <Package className="h-6 w-6" />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-medium">
                                                        {part.brand} {part.name}
                                                    </h3>
                                                    <Badge variant="outline">{part.part_code}</Badge>
                                                    <Badge variant="secondary">{part.category}</Badge>
                                                </div>
                                                <div className="text-muted-foreground flex items-center gap-4 text-sm">
                                                    <span>Supplier: {part.supplier_name}</span>
                                                    <span className="flex items-center gap-1">€{part.supplier_price.toFixed(2)}</span>
                                                </div>
                                                {part.description && <p className="text-muted-foreground text-sm">{part.description}</p>}
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
                            <div className="py-12 text-center">
                                <Package className="text-muted-foreground mx-auto h-12 w-12" />
                                <h3 className="mt-4 text-lg font-medium">No parts found</h3>
                                <p className="text-muted-foreground mt-2">Get started by adding your first part to the inventory.</p>
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
