import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { LucideIcon, Plus } from 'lucide-react';

interface AdminEmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    createRoute?: string;
    createLabel?: string;
}

export default function AdminEmptyState({ icon: Icon, title, description, createRoute, createLabel = 'Get Started' }: AdminEmptyStateProps) {
    return (
        <div className="py-12 text-center">
            <Icon className="text-muted-foreground mx-auto h-12 w-12" />
            <h3 className="mt-4 text-lg font-medium">{title}</h3>
            <p className="text-muted-foreground mt-2">{description}</p>
            {createRoute && (
                <div className="mt-6">
                    <Button asChild>
                        <Link href={createRoute}>
                            <Plus className="mr-2 h-4 w-4" />
                            {createLabel}
                        </Link>
                    </Button>
                </div>
            )}
        </div>
    );
}
