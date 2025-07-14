import { router } from '@inertiajs/react';
import { useCallback } from 'react';

interface UseAdminDeleteOptions {
    routeName?: string;
    confirmMessage?: string;
    onSuccess?: () => void;
    onError?: (error: Record<string, string>) => void;
}

export function useAdminDelete(options: UseAdminDeleteOptions = {}) {
    const { routeName, confirmMessage = 'Are you sure you want to delete this item?', onSuccess, onError } = options;

    const handleDelete = useCallback(
        (itemId: number | string, customRoute?: string, customMessage?: string) => {
            const message = customMessage || confirmMessage;
            const deleteRoute = customRoute || (routeName ? route(routeName, itemId) : `${itemId}`);

            if (confirm(message)) {
                router.delete(deleteRoute, {
                    onSuccess: () => {
                        onSuccess?.();
                    },
                    onError: (errors) => {
                        onError?.(errors);
                    },
                });
            }
        },
        [routeName, confirmMessage, onSuccess, onError],
    );

    const handleDeleteWithName = useCallback(
        (itemId: number | string, itemName: string, customRoute?: string) => {
            const message = `Are you sure you want to delete ${itemName}?`;
            handleDelete(itemId, customRoute, message);
        },
        [handleDelete],
    );

    return {
        handleDelete,
        handleDeleteWithName,
    };
}
