import AdminListLayout from '@/components/admin/AdminListLayout';
import AdminActionButtons from '@/components/admin/AdminActionButtons';
import { StatusBadge } from '@/components/admin/AdminBadge';
import { useAdminDelete } from '@/hooks/use-admin-delete';
import { type BreadcrumbItem, type AdminStaff } from '@/types';
import { Users, Wrench, Clock } from 'lucide-react';

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
    const { handleDelete } = useAdminDelete();

    // Prepare stats cards data
    const statsCards = [
        {
            title: "Total Staff",
            value: staff.data.length,
            description: "Active mechanics",
            icon: Users,
        },
        {
            title: "Active Work Orders",
            value: staff.data.reduce((sum, s) => sum + s.active_work_orders_count, 0),
            description: "Currently assigned",
            icon: Wrench,
        },
        {
            title: "Total Assignments",
            value: staff.data.reduce((sum, s) => sum + s.assigned_work_orders_count, 0),
            description: "All work orders",
            icon: Clock,
        },
        {
            title: "Avg. Workload",
            value: staff.data.length > 0 
                ? Math.round(staff.data.reduce((sum, s) => sum + s.active_work_orders_count, 0) / staff.data.length * 10) / 10
                : 0,
            description: "Per mechanic",
            icon: Wrench,
        }
    ];

    return (
        <AdminListLayout
            title="Staff Management"
            description="Manage mechanics and staff members"
            pageTitle="Staff Management"
            breadcrumbs={breadcrumbs}
            createRoute="/admin/staff/create"
            createLabel="Add Staff Member"
            statsCards={statsCards}
            contentTitle="Staff Members"
            contentDescription="Manage mechanics and their work assignments"
            contentIcon={Users}
            hasData={staff.data.length > 0}
            emptyStateProps={{
                icon: Users,
                title: "No staff members",
                description: "Get started by adding a new staff member.",
                createRoute: "/admin/staff/create",
                createLabel: "Add Staff Member"
            }}
        >
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
                            
                            <StatusBadge status={member.active_work_orders_count > 0 ? 'Active' : 'Available'} />
                            
                            <AdminActionButtons
                                itemId={member.id}
                                basePath="/admin/staff"
                                onDelete={(id) => handleDelete(
                                    id, 
                                    `/admin/staff/${id}`, 
                                    'Are you sure you want to delete this staff member?'
                                )}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </AdminListLayout>
    );
} 