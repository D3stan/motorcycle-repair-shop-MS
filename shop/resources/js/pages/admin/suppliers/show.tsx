import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type AdminSupplierDetails, type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, Building2, DollarSign, Edit, Mail, MapPin, Package, Phone } from 'lucide-react';

interface Props {
    supplier: AdminSupplierDetails;
    suppliedParts: Array<{
        id: number;
        part_code: string;
        brand: string;
        name: string;
        category: string;
        supplier_price: number;
        selling_price: number;
        stock_quantity: number;
        minimum_stock: number;
        is_low_stock: boolean;
    }>;
}

export default function SupplierShow({ supplier, suppliedParts }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Admin Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Suppliers',
            href: '/admin/suppliers',
        },
        {
            title: supplier.name,
            href: `/admin/suppliers/${supplier.id}`,
        },
    ];

    const getCategoryBadge = (category: string) => {
        const colors = {
            Engine: 'bg-red-100 text-red-800',
            Brake: 'bg-orange-100 text-orange-800',
            Suspension: 'bg-blue-100 text-blue-800',
            Electrical: 'bg-yellow-100 text-yellow-800',
            Body: 'bg-green-100 text-green-800',
            Transmission: 'bg-purple-100 text-purple-800',
            Exhaust: 'bg-gray-100 text-gray-800',
            'Fuel System': 'bg-pink-100 text-pink-800',
        };
        return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={supplier.name} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">{supplier.name}</h1>
                        <p className="text-muted-foreground">Supplier Code: {supplier.supplier_code}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild>
                            <Link href={route('admin.suppliers.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Suppliers
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={route('admin.suppliers.edit', supplier.id)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Supplier
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid gap-4 lg:grid-cols-3">
                    {/* Supplier Details */}
                    <div className="space-y-4 lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5" />
                                    Supplier Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-muted-foreground text-sm font-medium">Supplier Code</p>
                                        <p className="font-mono text-lg">{supplier.supplier_code}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-sm font-medium">Company Name</p>
                                        <p className="text-lg">{supplier.name}</p>
                                    </div>
                                </div>
                                <Separator />
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-muted-foreground text-sm font-medium">Phone</p>
                                        <p className="flex items-center gap-2 text-lg">
                                            <Phone className="h-4 w-4" />
                                            {supplier.phone}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-sm font-medium">Email</p>
                                        <p className="flex items-center gap-2 text-lg">
                                            <Mail className="h-4 w-4" />
                                            {supplier.email}
                                        </p>
                                    </div>
                                </div>
                                {(supplier.address || supplier.city || supplier.country) && (
                                    <>
                                        <Separator />
                                        <div>
                                            <p className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                                                <MapPin className="h-4 w-4" />
                                                Address
                                            </p>
                                            <div className="mt-1 space-y-1 text-sm">
                                                {supplier.address && <p>{supplier.address}</p>}
                                                <p>
                                                    {supplier.city && `${supplier.city}`}
                                                    {supplier.postal_code && `, ${supplier.postal_code}`}
                                                </p>
                                                <p>{supplier.country}</p>
                                            </div>
                                        </div>
                                    </>
                                )}
                                {supplier.notes && (
                                    <>
                                        <Separator />
                                        <div>
                                            <p className="text-muted-foreground text-sm font-medium">Notes</p>
                                            <p className="text-sm">{supplier.notes}</p>
                                        </div>
                                    </>
                                )}
                                <Separator />
                                <div>
                                    <p className="text-muted-foreground text-sm font-medium">Created</p>
                                    <p className="text-sm">{supplier.created_at}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Supplied Parts */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Supplied Parts
                                </CardTitle>
                                <CardDescription>Parts available from this supplier</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {suppliedParts.length > 0 ? (
                                    <div className="space-y-3">
                                        {suppliedParts.map((part) => (
                                            <div key={part.id} className="flex items-center justify-between border-b pb-3 last:border-b-0">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-medium">
                                                            {part.brand} {part.name}
                                                        </h4>
                                                        <Badge variant="outline">{part.part_code}</Badge>
                                                        <Badge className={getCategoryBadge(part.category)}>{part.category}</Badge>
                                                        {part.is_low_stock && (
                                                            <Badge variant="destructive" className="flex items-center gap-1">
                                                                <AlertTriangle className="h-3 w-3" />
                                                                Low Stock
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-muted-foreground flex items-center gap-4 text-sm">
                                                        <span>
                                                            Stock: {part.stock_quantity}/{part.minimum_stock}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <DollarSign className="h-3 w-3" />€{part.supplier_price.toFixed(2)} → €
                                                            {part.selling_price.toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={route('admin.inventory.show', part.id)}>View Part</Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">No parts available from this supplier yet</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* Summary Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Total Parts</span>
                                    <span className="text-lg font-bold">{suppliedParts.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Low Stock Items</span>
                                    <span className="text-lg font-bold text-orange-600">
                                        {suppliedParts.filter((part) => part.is_low_stock).length}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Categories</span>
                                    <span className="text-lg font-bold">{new Set(suppliedParts.map((part) => part.category)).size}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Total Value</span>
                                    <span className="text-lg font-bold">
                                        €{suppliedParts.reduce((sum, part) => sum + part.stock_quantity * part.supplier_price, 0).toFixed(2)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
