import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AdminBadgeProps {
    children: React.ReactNode;
    variant?: 'status' | 'category' | 'count' | 'warning' | 'success' | 'danger';
    size?: 'sm' | 'default';
    className?: string;
}

const variantStyles = {
    status: 'bg-blue-100 text-blue-800',
    category: 'bg-gray-100 text-gray-800',
    count: 'bg-purple-100 text-purple-800',
    warning: 'bg-orange-100 text-orange-800',
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800',
};

export default function AdminBadge({ children, variant = 'status', size = 'default', className }: AdminBadgeProps) {
    return <Badge className={cn(variantStyles[variant], size === 'sm' && 'px-2 py-0.5 text-xs', className)}>{children}</Badge>;
}

// Predefined badge components for common use cases
export function StatusBadge({ status, className }: { status: string; className?: string }) {
    const getStatusVariant = (status: string) => {
        const lowerStatus = status.toLowerCase();
        if (['completed', 'paid', 'active', 'confirmed'].includes(lowerStatus)) return 'success';
        if (['pending', 'waiting'].includes(lowerStatus)) return 'warning';
        if (['cancelled', 'failed', 'overdue'].includes(lowerStatus)) return 'danger';
        return 'status';
    };

    return (
        <AdminBadge variant={getStatusVariant(status)} className={className}>
            {status}
        </AdminBadge>
    );
}

export function CountBadge({ count, label }: { count: number; label: string }) {
    return (
        <AdminBadge variant="count">
            {count} {label}
        </AdminBadge>
    );
}
