import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type AdminStaff } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Edit, Trash2, Plus, Users, Wrench, Clock } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Staff Management',
        href: '/admin/staff',
    },
];

interface Props {
    staff: {
        data: AdminStaff[];
        links?: any[];
        meta?: any;
    };
}

export default function StaffIndex({ staff }: Props) {
    const handleDelete = (staffId: number) => {
        if (confirm('Are you sure you want to delete this staff member?')) {
            router.delete(`/admin/staff/${staffId}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Staff Management" />
            
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Staff Management</h1>
                        <p className="text-muted-foreground">Manage mechanics and staff members</p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/staff/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Staff Member
                        </Link>
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Total Staff</CardTitle>
                            <CardDescription>Active mechanics</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold mb-2">
                                {staff.data.length}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Registered mechanics
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Active Work Orders</CardTitle>
                            <CardDescription>Currently assigned</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold mb-2">
                                {staff.data.reduce((sum, s) => sum + s.active_work_orders_count, 0)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                In progress
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Total Assignments</CardTitle>
                            <CardDescription>All work orders</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold mb-2">
                                {staff.data.reduce((sum, s) => sum + s.assigned_work_orders_count, 0)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Ever assigned
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Avg. Workload</CardTitle>
                            <CardDescription>Per mechanic</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold mb-2">
                                {staff.data.length > 0 
                                    ? Math.round(staff.data.reduce((sum, s) => sum + s.active_work_orders_count, 0) / staff.data.length * 10) / 10
                                    : 0
                                }
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Active orders
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Staff List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Staff Members</CardTitle>
                        <CardDescription>
                            Manage mechanics and their work assignments
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {staff.data.length > 0 ? (
                            <div className="space-y-4">
                                {staff.data.map((member) => (
                                    <div key={member.id} className="flex items-center justify-between border-b pb-4 last:border-b-0">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                                <Users className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <div className="font-medium">
                                                    {member.first_name} {member.last_name}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {member.email}
                                                </div>
                                                {member.phone && (
                                                    <div className="text-sm text-muted-foreground">
                                                        {member.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center space-x-4">
                                            <div className="text-right">
                                                <div className="flex items-center space-x-2">
                                                    <Wrench className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm font-medium">
                                                        {member.active_work_orders_count} active
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm text-muted-foreground">
                                                        {member.assigned_work_orders_count} total
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <Badge variant={member.active_work_orders_count > 0 ? 'default' : 'secondary'}>
                                                {member.active_work_orders_count > 0 ? 'Active' : 'Available'}
                                            </Badge>
                                            
                                            <div className="flex items-center space-x-2">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/admin/staff/${member.id}`}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/admin/staff/${member.id}/edit`}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => handleDelete(member.id)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-2 text-sm font-medium">No staff members</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Get started by adding a new staff member.
                                </p>
                                <div className="mt-6">
                                    <Button asChild>
                                        <Link href="/admin/staff/create">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Staff Member
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
} 