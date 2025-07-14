import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SupplierOption } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Package, Save } from 'lucide-react';

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
        title: 'Add New Part',
        href: '/admin/inventory/create',
    },
];

const categories = ['Engine', 'Brake', 'Suspension', 'Electrical', 'Body', 'Transmission', 'Exhaust', 'Fuel System'];

interface Props {
    suppliers: SupplierOption[];
}

export default function InventoryCreate({ suppliers }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        part_code: '',
        brand: '',
        name: '',
        description: '',
        supplier_price: '',
        category: '',
        supplier_id: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.inventory.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add New Part" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Add New Part</h1>
                        <p className="text-muted-foreground">Create a new part in your inventory</p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href={route('admin.inventory.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Inventory
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
                        <CardDescription>Enter the details for the new part</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {/* Part Code */}
                                <div className="space-y-2">
                                    <Label htmlFor="part_code">Part Code *</Label>
                                    <Input
                                        id="part_code"
                                        type="text"
                                        value={data.part_code}
                                        onChange={(e) => setData('part_code', e.target.value)}
                                        placeholder="e.g., PRT123456"
                                        required
                                    />
                                    {errors.part_code && <p className="text-sm text-red-600">{errors.part_code}</p>}
                                </div>

                                {/* Brand */}
                                <div className="space-y-2">
                                    <Label htmlFor="brand">Brand *</Label>
                                    <Input
                                        id="brand"
                                        type="text"
                                        value={data.brand}
                                        onChange={(e) => setData('brand', e.target.value)}
                                        placeholder="e.g., OEM, Bosch, Brembo"
                                        required
                                    />
                                    {errors.brand && <p className="text-sm text-red-600">{errors.brand}</p>}
                                </div>

                                {/* Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">Part Name *</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g., Brake Pad, Oil Filter"
                                        required
                                    />
                                    {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                                </div>

                                {/* Category */}
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category *</Label>
                                    <Select value={data.category} onValueChange={(value) => setData('category', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category} value={category}>
                                                    {category}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.category && <p className="text-sm text-red-600">{errors.category}</p>}
                                </div>

                                {/* Supplier */}
                                <div className="space-y-2">
                                    <Label htmlFor="supplier_id">Supplier *</Label>
                                    <Select value={data.supplier_id} onValueChange={(value) => setData('supplier_id', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select supplier" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {suppliers.map((supplier) => (
                                                <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                                    {supplier.name} ({supplier.supplier_code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.supplier_id && <p className="text-sm text-red-600">{errors.supplier_id}</p>}
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
                                        placeholder="0.00"
                                        required
                                    />
                                    {errors.supplier_price && <p className="text-sm text-red-600">{errors.supplier_price}</p>}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <textarea
                                    id="description"
                                    className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Optional description of the part"
                                />
                                {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" asChild>
                                    <Link href={route('admin.inventory.index')}>Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Creating...' : 'Create Part'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
