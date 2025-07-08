import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type AdminCustomer } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Edit, Trash2, Users, Bike, Calendar, FileText } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Customer Management',
        href: '/admin/customers',
    },
];

interface Props {
    customers: {
        data: AdminCustomer[];
        links?: any[];
        meta?: any;
    };
}

export default function CustomersIndex({ customers }: Props) {
    const handleDelete = (customer: AdminCustomer) => {
        if (confirm(`Are you sure you want to delete ${customer.first_name} ${customer.last_name}?`)) {
            router.delete(route('admin.customers.destroy', customer.id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Customer Management" />
            
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Customer Management</h1>
                        <p className="text-muted-foreground">
                            Manage customer accounts and view their activity
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{customers.meta?.total || customers.data.length}</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {customers.data.filter(c => c.motorcycles_count > 0).length}
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
                                {customers.data.reduce((sum, c) => sum + c.motorcycles_count, 0)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {customers.data.reduce((sum, c) => sum + c.pending_invoices_count, 0)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Customers Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Customers</CardTitle>
                        <CardDescription>
                            A list of all customers in the system
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-2">Customer</th>
                                        <th className="text-left p-2">Contact</th>
                                        <th className="text-left p-2">Motorcycles</th>
                                        <th className="text-left p-2">Activity</th>
                                        <th className="text-left p-2">Status</th>
                                        <th className="text-left p-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customers.data.map((customer) => (
                                        <tr key={customer.id} className="border-b">
                                            <td className="p-2">
                                                <div>
                                                    <div className="font-medium">
                                                        {customer.first_name} {customer.last_name}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        Joined {customer.created_at}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-2">
                                                <div>
                                                    <div className="text-sm">{customer.email}</div>
                                                    {customer.phone && (
                                                        <div className="text-sm text-muted-foreground">
                                                            {customer.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-2">
                                                <Badge variant="secondary">
                                                    {customer.motorcycles_count} motorcycles
                                                </Badge>
                                            </td>
                                            <td className="p-2">
                                                <div className="text-sm space-y-1">
                                                    <div>{customer.appointments_count} appointments</div>
                                                    <div>{customer.work_orders_count} work orders</div>
                                                    <div>{customer.invoices_count} invoices</div>
                                                </div>
                                            </td>
                                            <td className="p-2">
                                                {customer.pending_invoices_count > 0 ? (
                                                    <Badge variant="destructive">
                                                        {customer.pending_invoices_count} pending
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="default">Active</Badge>
                                                )}
                                            </td>
                                            <td className="p-2">
                                                <div className="flex items-center gap-2">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={route('admin.customers.show', customer.id)}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={route('admin.customers.edit', customer.id)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm"
                                                        onClick={() => handleDelete(customer)}
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
                        {customers.links && Array.isArray(customers.links) && customers.links.length > 3 && (
                            <div className="flex items-center justify-center gap-2 mt-4">
                                {customers.links.map((link, index) => (
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