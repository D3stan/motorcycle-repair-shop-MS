import AdminActionButtons from '@/components/admin/AdminActionButtons';
import { CountBadge, StatusBadge } from '@/components/admin/AdminBadge';
import AdminListLayout from '@/components/admin/AdminListLayout';
import AdminTable from '@/components/admin/AdminTable';
import { useAdminDelete } from '@/hooks/use-admin-delete';
import { type AdminCustomer, type BreadcrumbItem } from '@/types';
import { Bike, FileText, Users } from 'lucide-react';

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
        links: any[];
        meta: any;
    };
}

export default function CustomersIndex({ customers }: Props) {
    const { handleDeleteWithName } = useAdminDelete();

    // Prepare stats cards data
    const statsCards = [
        {
            title: 'Total Customers',
            value: customers.meta?.total || customers.data.length,
            icon: Users,
        },
        {
            title: 'Active Customers',
            value: customers.data.filter((c) => (c.motorcycles_count || 0) > 0).length,
            description: 'With motorcycles',
            icon: Users,
        },
        {
            title: 'Total Motorcycles',
            value: customers.data.reduce((sum, c) => sum + (c.motorcycles_count || 0), 0),
            icon: Bike,
        },
    ];

    // Prepare table columns
    const columns = [
        {
            key: 'customer',
            label: 'Customer',
            render: (customer: AdminCustomer) => (
                <div>
                    <div className="font-medium">
                        {customer.first_name} {customer.last_name}
                    </div>
                    <div className="text-muted-foreground text-sm">Joined {customer.created_at}</div>
                </div>
            ),
        },
        {
            key: 'contact',
            label: 'Contact',
            render: (customer: AdminCustomer) => (
                <div>
                    <div className="text-sm">{customer.email}</div>
                    {customer.phone && <div className="text-muted-foreground text-sm">{customer.phone}</div>}
                </div>
            ),
        },
        {
            key: 'motorcycles',
            label: 'Motorcycles',
            render: (customer: AdminCustomer) => <CountBadge count={customer.motorcycles_count || 0} label="motorcycles" />,
        },
        {
            key: 'activity',
            label: 'Activity',
            render: (customer: AdminCustomer) => (
                <div className="space-y-1 text-sm">
                    <div>{customer.appointments_count || 0} appointments</div>
                    <div>{customer.work_orders_count || 0} work orders</div>
                    <div>{customer.invoices_count || 0} invoices</div>
                </div>
            ),
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (customer: AdminCustomer) => (
                <AdminActionButtons
                    itemId={customer.id}
                    basePath="/admin/customers"
                    onDelete={(id) => handleDeleteWithName(id, `${customer.first_name} ${customer.last_name}`, route('admin.customers.destroy', id))}
                />
            ),
        },
    ];

    return (
        <AdminListLayout
            title="Customer Management"
            description="Manage customer accounts and view their activity"
            pageTitle="Customer Management"
            breadcrumbs={breadcrumbs}
            statsCards={statsCards}
            contentTitle="Customers"
            contentDescription="A list of all customers in the system"
            contentIcon={Users}
            hasData={customers.data.length > 0}
            emptyStateProps={{
                icon: Users,
                title: 'No customers found',
                description: 'Get started by adding your first customer to the system.',
            }}
        >
            <AdminTable data={customers.data} columns={columns} />
        </AdminListLayout>
    );
}
