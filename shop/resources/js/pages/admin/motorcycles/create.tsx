import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

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
        title: 'Add New Model',
        href: '/admin/motorcycles/create',
    },
];

const segments = [
    { value: 'sport', label: 'Sport' },
    { value: 'touring', label: 'Touring' },
    { value: 'naked', label: 'Naked' },
    { value: 'cruiser', label: 'Cruiser' },
    { value: 'adventure', label: 'Adventure' },
    { value: 'enduro', label: 'Enduro' },
    { value: 'scooter', label: 'Scooter' },
];

export default function MotorcycleCreate() {
    const { data, setData, post, processing, errors } = useForm({
        brand: '',
        name: '',
        model_code: '',
        engine_size: '',
        segment: '',
        power: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.motorcycles.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add New Motorcycle Model" />
            
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/admin/motorcycles">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Models
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                Add New Motorcycle Model
                            </h1>
                            <p className="text-muted-foreground">
                                Create a new motorcycle model with specifications
                            </p>
                        </div>
                    </div>
                </div>

                {/* Create Form */}
                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Model Information</CardTitle>
                        <CardDescription>
                            Enter the details for the new motorcycle model
                        </CardDescription>
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
                                    {errors.brand && (
                                        <p className="text-sm text-red-500">{errors.brand}</p>
                                    )}
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
                                    {errors.name && (
                                        <p className="text-sm text-red-500">{errors.name}</p>
                                    )}
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
                                {errors.model_code && (
                                    <p className="text-sm text-red-500">{errors.model_code}</p>
                                )}
                                <p className="text-sm text-muted-foreground">
                                    Unique identifier for this model
                                </p>
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
                                    {errors.engine_size && (
                                        <p className="text-sm text-red-500">{errors.engine_size}</p>
                                    )}
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
                                    {errors.power && (
                                        <p className="text-sm text-red-500">{errors.power}</p>
                                    )}
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
                                {errors.segment && (
                                    <p className="text-sm text-red-500">{errors.segment}</p>
                                )}
                            </div>

                            <div className="flex items-center gap-4 pt-4">
                                <Button type="submit" disabled={processing}>
                                    <Save className="h-4 w-4 mr-2" />
                                    {processing ? 'Creating...' : 'Create Model'}
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href="/admin/motorcycles">
                                        Cancel
                                    </Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
} 