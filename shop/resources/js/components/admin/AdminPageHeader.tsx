import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';

interface AdminPageHeaderProps {
    title: string;
    description: string;
    createRoute?: string;
    createLabel?: string;
    children?: React.ReactNode;
}

export default function AdminPageHeader({ 
    title, 
    description, 
    createRoute, 
    createLabel = "Add New", 
    children 
}: AdminPageHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold">{title}</h1>
                <p className="text-muted-foreground">{description}</p>
            </div>
            <div className="flex items-center gap-2">
                {children}
                {createRoute && (
                    <Button asChild>
                        <Link href={createRoute}>
                            <Plus className="mr-2 h-4 w-4" />
                            {createLabel}
                        </Link>
                    </Button>
                )}
            </div>
        </div>
    );
} 