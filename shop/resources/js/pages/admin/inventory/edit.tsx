import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type AdminPartDetails, type SupplierOption } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Package } from 'lucide-react';

const categories = [
    'Engine',
    'Brake',
    'Suspension',
    'Electrical',
    'Body',
    'Transmission',
    'Exhaust',
    'Fuel System',
];

interface Props {
    part: AdminPartDetails;
    suppliers: SupplierOption[];
}

export default function InventoryEdit({ part, suppliers }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        part_code: part.part_code,
        brand: part.brand,
        name: part.name,
        description: part.description || '',
        supplier_price: part.supplier_price.toString(),
        selling_price: part.selling_price.toString(),
        category: part.category,
        stock_quantity: part.stock_quantity.toString(),
        minimum_stock: part.minimum_stock.toString(),
        supplier_id: part.supplier_id.toString(),
    });

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
        {
            title: 'Edit',
            href: `/admin/inventory/${part.id}/edit`,
        },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin.inventory.update', part.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${part.brand} ${part.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Edit Part</h1>
                        <p className="text-muted-foreground">Update part information</p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href={route('admin.inventory.show', part.id)}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Part
                        </Link>
                    </Button>
                </div>

                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Part Information
                        </CardTitle>
                        <CardDescription>Update the details for this part</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Part Code */}
                                <div className="space-y-2">
                                    <Label htmlFor="part_code">Part Code *</Label>
                                    <Input
                                        id="part_code"
                                        type="text"
                                        value={data.part_code}
                                        onChange={(e) => setData('part_code', e.target.value)}
                                        required
                                    />
                                    {errors.part_code && (
                                        <p className="text-sm text-red-600">{errors.part_code}</p>
                                    )}
                                </div>

                                {/* Brand */}
                                <div className="space-y-2">
                                    <Label htmlFor="brand">Brand *</Label>
                                    <Input
                                        id="brand"
                                        type="text"
                                        value={data.brand}
                                        onChange={(e) => setData('brand', e.target.value)}
                                        required
                                    />
                                    {errors.brand && (
                                        <p className="text-sm text-red-600">{errors.brand}</p>
                                    )}
                                </div>

                                {/* Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">Part Name *</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                {/* Category */}
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category *</Label>
                                    <Select value={data.category} onValueChange={(value) => setData('category', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category} value={category}>
                                                    {category}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.category && (
                                        <p className="text-sm text-red-600">{errors.category}</p>
                                    )}
                                </div>

                                {/* Supplier */}
                                <div className="space-y-2">
                                    <Label htmlFor="supplier_id">Supplier *</Label>
                                    <Select value={data.supplier_id} onValueChange={(value) => setData('supplier_id', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {suppliers.map((supplier) => (
                                                <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                                    {supplier.name} ({supplier.supplier_code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.supplier_id && (
                                        <p className="text-sm text-red-600">{errors.supplier_id}</p>
                                    )}
                                </div>

                                {/* Supplier Price */}
                                <div className="space-y-2">
                                    <Label htmlFor="supplier_price">Supplier Price (€) *</Label>
                                    <Input
                                        id="supplier_price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.supplier_price}
                                        onChange={(e) => setData('supplier_price', e.target.value)}
                                        required
                                    />
                                    {errors.supplier_price && (
                                        <p className="text-sm text-red-600">{errors.supplier_price}</p>
                                    )}
                                </div>

                                {/* Selling Price */}
                                <div className="space-y-2">
                                    <Label htmlFor="selling_price">Selling Price (€) *</Label>
                                    <Input
                                        id="selling_price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.selling_price}
                                        onChange={(e) => setData('selling_price', e.target.value)}
                                        required
                                    />
                                    {errors.selling_price && (
                                        <p className="text-sm text-red-600">{errors.selling_price}</p>
                                    )}
                                </div>

                                {/* Stock Quantity */}
                                <div className="space-y-2">
                                    <Label htmlFor="stock_quantity">Stock Quantity *</Label>
                                    <Input
                                        id="stock_quantity"
                                        type="number"
                                        min="0"
                                        value={data.stock_quantity}
                                        onChange={(e) => setData('stock_quantity', e.target.value)}
                                        required
                                    />
                                    {errors.stock_quantity && (
                                        <p className="text-sm text-red-600">{errors.stock_quantity}</p>
                                    )}
                                </div>

                                {/* Minimum Stock */}
                                <div className="space-y-2">
                                    <Label htmlFor="minimum_stock">Minimum Stock *</Label>
                                    <Input
                                        id="minimum_stock"
                                        type="number"
                                        min="0"
                                        value={data.minimum_stock}
                                        onChange={(e) => setData('minimum_stock', e.target.value)}
                                        required
                                    />
                                    {errors.minimum_stock && (
                                        <p className="text-sm text-red-600">{errors.minimum_stock}</p>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <textarea
                                    id="description"
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Optional description of the part"
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-600">{errors.description}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" asChild>
                                    <Link href={route('admin.inventory.show', part.id)}>Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Updating...' : 'Update Part'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
} 