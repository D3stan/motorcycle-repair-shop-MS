import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type AdminMotorcycleModel, type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

interface Props {
    motorcycleModel: AdminMotorcycleModel;
}

const segments = [
    { value: 'sport', label: 'Sport' },
    { value: 'touring', label: 'Touring' },
    { value: 'naked', label: 'Naked' },
    { value: 'cruiser', label: 'Cruiser' },
    { value: 'adventure', label: 'Adventure' },
    { value: 'enduro', label: 'Enduro' },
    { value: 'scooter', label: 'Scooter' },
];

export default function MotorcycleEdit({ motorcycleModel }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        brand: motorcycleModel.brand,
        name: motorcycleModel.name,
        model_code: motorcycleModel.model_code,
        engine_size: motorcycleModel.engine_size.toString(),
        segment: motorcycleModel.segment,
        power: motorcycleModel.power.toString(),
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Admin Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Motorcycle Management',
            href: '/admin/motorcycles',
        },
        {
            title: `${motorcycleModel.brand} ${motorcycleModel.name}`,
            href: `/admin/motorcycles/${motorcycleModel.id}`,
        },
        {
            title: 'Edit',
            href: `/admin/motorcycles/${motorcycleModel.id}/edit`,
        },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin.motorcycles.update', motorcycleModel.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${motorcycleModel.brand} ${motorcycleModel.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={route('admin.motorcycles.show', motorcycleModel.id)}>
                                <ArrowLeft className="h-4 w-4" />
                                Back to Model
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Edit Motorcycle Model</h1>
                            <p className="text-muted-foreground">
                                Update {motorcycleModel.brand} {motorcycleModel.name} specifications
                            </p>
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Model Information</CardTitle>
                        <CardDescription>Update the motorcycle model details and specifications</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="brand">Brand</Label>
                                    <Input
                                        id="brand"
                                        type="text"
                                        value={data.brand}
                                        onChange={(e) => setData('brand', e.target.value)}
                                        className={errors.brand ? 'border-red-500' : ''}
                                        placeholder="e.g., Honda, Yamaha, Ducati"
                                        required
                                    />
                                    {errors.brand && <p className="text-sm text-red-500">{errors.brand}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="name">Model Name</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={errors.name ? 'border-red-500' : ''}
                                        placeholder="e.g., CBR1000RR, R1, Panigale V4"
                                        required
                                    />
                                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="model_code">Model Code</Label>
                                <Input
                                    id="model_code"
                                    type="text"
                                    value={data.model_code}
                                    onChange={(e) => setData('model_code', e.target.value)}
                                    className={errors.model_code ? 'border-red-500' : ''}
                                    placeholder="e.g., CBR1000RR-R, YZF-R1, 1299-PANIGALE"
                                    required
                                />
                                {errors.model_code && <p className="text-sm text-red-500">{errors.model_code}</p>}
                                <p className="text-muted-foreground text-sm">Unique identifier for this model</p>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="engine_size">Engine Size (cc)</Label>
                                    <Input
                                        id="engine_size"
                                        type="number"
                                        value={data.engine_size}
                                        onChange={(e) => setData('engine_size', e.target.value)}
                                        className={errors.engine_size ? 'border-red-500' : ''}
                                        placeholder="e.g., 1000"
                                        min="50"
                                        max="2500"
                                        required
                                    />
                                    {errors.engine_size && <p className="text-sm text-red-500">{errors.engine_size}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="power">Power (hp)</Label>
                                    <Input
                                        id="power"
                                        type="number"
                                        value={data.power}
                                        onChange={(e) => setData('power', e.target.value)}
                                        className={errors.power ? 'border-red-500' : ''}
                                        placeholder="e.g., 200"
                                        min="5"
                                        max="300"
                                        required
                                    />
                                    {errors.power && <p className="text-sm text-red-500">{errors.power}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="segment">Segment</Label>
                                <Select value={data.segment} onValueChange={(value) => setData('segment', value)}>
                                    <SelectTrigger className={errors.segment ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Select motorcycle segment" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {segments.map((segment) => (
                                            <SelectItem key={segment.value} value={segment.value}>
                                                {segment.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.segment && <p className="text-sm text-red-500">{errors.segment}</p>}
                            </div>

                            <div className="flex items-center gap-4 pt-4">
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href={route('admin.motorcycles.show', motorcycleModel.id)}>Cancel</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
