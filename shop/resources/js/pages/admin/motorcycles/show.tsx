import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type AdminMotorcycleModel, type BreadcrumbItem, type MotorcycleOwner } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit, Mail, Settings, User, Zap } from 'lucide-react';

interface Props {
    motorcycleModel: AdminMotorcycleModel & {
        created_at: string;
    };
    motorcycles: MotorcycleOwner[];
}

export default function MotorcycleShow({ motorcycleModel, motorcycles }: Props) {
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
    ];

    const getSegmentBadge = (segment: string) => {
        const colors = {
            sport: 'bg-red-100 text-red-800',
            touring: 'bg-blue-100 text-blue-800',
            naked: 'bg-green-100 text-green-800',
            cruiser: 'bg-purple-100 text-purple-800',
            adventure: 'bg-orange-100 text-orange-800',
            enduro: 'bg-yellow-100 text-yellow-800',
            scooter: 'bg-gray-100 text-gray-800',
        };
        return colors[segment as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${motorcycleModel.brand} ${motorcycleModel.name} - Model Details`} />

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
                                {motorcycleModel.brand} {motorcycleModel.name}
                            </h1>
                            <p className="text-muted-foreground">Model Details</p>
                        </div>
                    </div>
                    <Button asChild>
                        <Link href={route('admin.motorcycles.edit', motorcycleModel.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Model
                        </Link>
                    </Button>
                </div>

                {/* Model Info and Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    {/* Model Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Model Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="text-sm font-medium">Brand</div>
                                <div className="text-lg">{motorcycleModel.brand}</div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-sm font-medium">Model Name</div>
                                <div className="text-lg">{motorcycleModel.name}</div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-sm font-medium">Model Code</div>
                                <code className="rounded bg-gray-100 px-2 py-1 text-sm text-black">{motorcycleModel.model_code}</code>
                            </div>
                            <Separator />
                            <div className="text-muted-foreground text-sm">Added {motorcycleModel.created_at}</div>
                        </CardContent>
                    </Card>

                    {/* Technical Specifications */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Technical Specifications</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Settings className="text-muted-foreground h-4 w-4" />
                                    <span className="text-sm">Engine Size</span>
                                </div>
                                <span className="font-medium">{motorcycleModel.engine_size}cc</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Zap className="text-muted-foreground h-4 w-4" />
                                    <span className="text-sm">Power</span>
                                </div>
                                <span className="font-medium">{motorcycleModel.power}hp</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Segment</span>
                                <span
                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getSegmentBadge(motorcycleModel.segment)}`}
                                >
                                    {motorcycleModel.segment}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Usage Statistics */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Usage Statistics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Motorcycles Registered</span>
                                <Badge variant="secondary">{motorcycles.length}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Active Owners</span>
                                <span className="font-medium">{new Set(motorcycles.map((m) => m.owner_email)).size}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Avg. Year</span>
                                <span className="font-medium">
                                    {motorcycles.length > 0
                                        ? Math.round(motorcycles.reduce((sum, m) => sum + m.registration_year, 0) / motorcycles.length)
                                        : '-'}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Registered Motorcycles */}
                {motorcycles.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Registered Motorcycles ({motorcycles.length})</CardTitle>
                            <CardDescription>Motorcycles using this model</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="p-2 text-left">License Plate</th>
                                            <th className="p-2 text-left">Year</th>
                                            <th className="p-2 text-left">VIN</th>
                                            <th className="p-2 text-left">Owner</th>
                                            <th className="p-2 text-left">Contact</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {motorcycles.map((motorcycle) => (
                                            <tr key={motorcycle.id} className="border-b">
                                                <td className="p-2">
                                                    <span className="font-medium">{motorcycle.license_plate}</span>
                                                </td>
                                                <td className="p-2">{motorcycle.registration_year}</td>
                                                <td className="p-2">
                                                    <code className="rounded bg-gray-100 px-2 py-1 text-xs text-black">{motorcycle.vin}</code>
                                                </td>
                                                <td className="p-2">
                                                    <div className="flex items-center gap-2">
                                                        <User className="text-muted-foreground h-4 w-4" />
                                                        <span className="text-sm">{motorcycle.owner}</span>
                                                    </div>
                                                </td>
                                                <td className="p-2">
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="text-muted-foreground h-4 w-4" />
                                                        <span className="text-sm">{motorcycle.owner_email}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* No Motorcycles */}
                {motorcycles.length === 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Registered Motorcycles</CardTitle>
                            <CardDescription>No motorcycles registered with this model yet</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-muted-foreground py-8 text-center">
                                <p>No motorcycles have been registered using this model yet.</p>
                                <p className="mt-2 text-sm">Customers can add motorcycles of this model to their garage from the customer portal.</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
