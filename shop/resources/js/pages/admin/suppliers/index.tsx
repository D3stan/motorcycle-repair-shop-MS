import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type AdminSupplier } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Edit, Trash2, Plus, Building2, Phone, Mail, Package } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Suppliers',
        href: '/admin/suppliers',
    },
];

interface Props {
    suppliers: {
        data: AdminSupplier[];
        links?: any[];
        meta?: any;
    };
}

export default function SuppliersIndex({ suppliers }: Props) {
    const handleDelete = (supplier: AdminSupplier) => {
        if (confirm(`Are you sure you want to delete ${supplier.name}?`)) {
            router.delete(route('admin.suppliers.destroy', supplier.id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Supplier Management" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Supplier Management</h1>
                        <p className="text-muted-foreground">Manage suppliers and their contact information</p>
                    </div>
                    <Button asChild>
                        <Link href={route('admin.suppliers.create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Supplier
                        </Link>
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Total Suppliers</CardTitle>
                            <CardDescription>Registered suppliers</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{suppliers.data.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Active Suppliers</CardTitle>
                            <CardDescription>With parts in stock</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {suppliers.data.filter(supplier => supplier.parts_count > 0).length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Total Parts</CardTitle>
                            <CardDescription>From all suppliers</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {suppliers.data.reduce((sum, supplier) => sum + supplier.parts_count, 0)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Countries</CardTitle>
                            <CardDescription>Global reach</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {new Set(suppliers.data.map(supplier => supplier.country)).size}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Suppliers Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            Suppliers
                        </CardTitle>
                        <CardDescription>Manage your supplier relationships</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {suppliers.data.length > 0 ? (
                            <div className="space-y-4">
                                {suppliers.data.map((supplier) => (
                                    <div key={supplier.id} className="flex items-center justify-between border-b pb-4 last:border-b-0 last:pb-0">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                                                <Building2 className="h-6 w-6" />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-medium">{supplier.name}</h3>
                                                    <Badge variant="outline">{supplier.supplier_code}</Badge>
                                                    <Badge variant="secondary" className="flex items-center gap-1">
                                                        <Package className="h-3 w-3" />
                                                        {supplier.parts_count} parts
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Phone className="h-3 w-3" />
                                                        {supplier.phone}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Mail className="h-3 w-3" />
                                                        {supplier.email}
                                                    </span>
                                                    <span>{supplier.city}, {supplier.country}</span>
                                                </div>
                                                {supplier.notes && (
                                                    <p className="text-sm text-muted-foreground">{supplier.notes}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={route('admin.suppliers.show', supplier.id)}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={route('admin.suppliers.edit', supplier.id)}>
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => handleDelete(supplier)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-medium">No suppliers found</h3>
                                <p className="mt-2 text-muted-foreground">
                                    Get started by adding your first supplier.
                                </p>
                                <Button asChild className="mt-4">
                                    <Link href={route('admin.suppliers.create')}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add New Supplier
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