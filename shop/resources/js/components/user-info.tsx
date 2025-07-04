import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { type User } from '@/types';

export function UserInfo({ user, showEmail = false }: { user?: User; showEmail?: boolean }) {
    const getInitials = useInitials();

    // Provide fallbacks for missing user data
    const firstName = user?.first_name || 'Unknown';
    const lastName = user?.last_name || 'User';
    const fullName = `${firstName} ${lastName}`;
    const userEmail = user?.email || '';

    return (
        <>
            <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                <AvatarImage src={user?.avatar} alt={firstName} />
                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                    {getInitials(fullName)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{firstName}</span>
                {showEmail && <span className="text-muted-foreground truncate text-xs">{userEmail}</span>}
            </div>
        </>
    );
}
