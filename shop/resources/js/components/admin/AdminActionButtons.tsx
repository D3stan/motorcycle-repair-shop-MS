import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { Eye, Edit, Trash2 } from 'lucide-react';

interface AdminActionButtonsProps {
    itemId: number | string;
    basePath: string; // e.g., '/admin/customers', '/admin/staff'
    onDelete?: (id: number | string) => void;
    showView?: boolean;
    showEdit?: boolean;
    showDelete?: boolean;
    size?: 'sm' | 'default';
    variant?: 'ghost' | 'outline';
}

export default function AdminActionButtons({
    itemId,
    basePath,
    onDelete,
    showView = true,
    showEdit = true,
    showDelete = true,
    size = 'sm',
    variant = 'ghost'
}: AdminActionButtonsProps) {
    const handleDelete = () => {
        if (onDelete) {
            onDelete(itemId);
        }
    };

    return (
        <div className="flex items-center gap-2">
            {showView && (
                <Button variant={variant} size={size} asChild>
                    <Link href={`${basePath}/${itemId}`}>
                        <Eye className="h-4 w-4" />
                    </Link>
                </Button>
            )}
            {showEdit && (
                <Button variant={variant} size={size} asChild>
                    <Link href={`${basePath}/${itemId}/edit`}>
                        <Edit className="h-4 w-4" />
                    </Link>
                </Button>
            )}
            {showDelete && onDelete && (
                <Button 
                    variant={variant} 
                    size={size} 
                    onClick={handleDelete}
                    className="text-red-600 hover:text-red-700"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
} 