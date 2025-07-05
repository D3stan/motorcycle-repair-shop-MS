import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type AdminMotorcycleModel } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Edit, Trash2, Plus, Bike, Settings, Zap } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Motorcycle Management',
        href: '/admin/motorcycles',
    },
];

interface Props {
    motorcycleModels: {
        data: AdminMotorcycleModel[];
        links?: any[];
        meta?: any;
    };
}

export default function MotorcyclesIndex({ motorcycleModels }: Props) {
    const handleDelete = (model: AdminMotorcycleModel) => {
        if (confirm(`Are you sure you want to delete ${model.brand} ${model.name}?`)) {
            router.delete(route('admin.motorcycles.destroy', model.id));
        }
    };

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
            <Head title="Motorcycle Management" />
            
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Motorcycle Management</h1>
                        <p className="text-muted-foreground">
                            Manage motorcycle models and specifications
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={route('admin.motorcycles.create')}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add New Model
                        </Link>
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Models</CardTitle>
                            <Bike className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{motorcycleModels.meta?.total || motorcycleModels.data.length}</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Models</CardTitle>
                            <Settings className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {motorcycleModels.data.filter(m => m.motorcycles_count > 0).length}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Motorcycles</CardTitle>
                            <Bike className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {motorcycleModels.data.reduce((sum, m) => sum + m.motorcycles_count, 0)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Power</CardTitle>
                            <Zap className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {motorcycleModels.data.length > 0 
                                    ? Math.round(motorcycleModels.data.reduce((sum, m) => sum + m.power, 0) / motorcycleModels.data.length)
                                    : 0}hp
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Models Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Motorcycle Models</CardTitle>
                        <CardDescription>
                            Manage motorcycle models and their specifications
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-2">Model</th>
                                        <th className="text-left p-2">Code</th>
                                        <th className="text-left p-2">Specifications</th>
                                        <th className="text-left p-2">Segment</th>
                                        <th className="text-left p-2">In Use</th>
                                        <th className="text-left p-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {motorcycleModels.data.map((model) => (
                                        <tr key={model.id} className="border-b">
                                            <td className="p-2">
                                                <div>
                                                    <div className="font-medium">
                                                        {model.brand} {model.name}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        Added {model.created_at}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-2">
                                                <code className="bg-gray-100 px-2 py-1 rounded text-sm text-black">
                                                    {model.model_code}
                                                </code>
                                            </td>
                                            <td className="p-2">
                                                <div className="text-sm space-y-1">
                                                    <div>{model.engine_size}cc</div>
                                                    <div>{model.power}hp</div>
                                                </div>
                                            </td>
                                            <td className="p-2">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSegmentBadge(model.segment)}`}>
                                                    {model.segment}
                                                </span>
                                            </td>
                                            <td className="p-2">
                                                <Badge variant={model.motorcycles_count > 0 ? "default" : "secondary"}>
                                                    {model.motorcycles_count} motorcycles
                                                </Badge>
                                            </td>
                                            <td className="p-2">
                                                <div className="flex items-center gap-2">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={route('admin.motorcycles.show', model.id)}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={route('admin.motorcycles.edit', model.id)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm"
                                                        onClick={() => handleDelete(model)}
                                                        disabled={model.motorcycles_count > 0}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Pagination */}
                        {motorcycleModels.links && Array.isArray(motorcycleModels.links) && motorcycleModels.links.length > 3 && (
                            <div className="flex items-center justify-center gap-2 mt-4">
                                {motorcycleModels.links.map((link, index) => (
                                    <Button
                                        key={index}
                                        variant={link.active ? "default" : "outline"}
                                        size="sm"
                                        disabled={!link.url}
                                        asChild={!!link.url}
                                    >
                                        {link.url ? (
                                            <Link href={link.url} dangerouslySetInnerHTML={{ __html: link.label }} />
                                        ) : (
                                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                        )}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
} 