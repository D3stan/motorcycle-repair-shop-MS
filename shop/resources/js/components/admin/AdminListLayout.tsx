import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';
import AdminEmptyState from './AdminEmptyState';
import AdminPageHeader from './AdminPageHeader';
import AdminStatsCards from './AdminStatsCards';

interface StatsCard {
    title: string;
    description?: string;
    value: string | number;
    subtext?: string;
    icon?: LucideIcon;
    variant?: 'default' | 'success' | 'warning' | 'danger';
}

interface AdminListLayoutProps {
    title: string;
    description: string;
    pageTitle: string;
    breadcrumbs: BreadcrumbItem[];
    createRoute?: string;
    createLabel?: string;
    statsCards?: StatsCard[];
    statsColumns?: 2 | 3 | 4;
    contentTitle: string;
    contentDescription: string;
    contentIcon?: LucideIcon;
    hasData: boolean;
    emptyStateProps?: {
        icon: LucideIcon;
        title: string;
        description: string;
        createRoute?: string;
        createLabel?: string;
    };
    children: React.ReactNode;
    headerActions?: React.ReactNode;
}

export default function AdminListLayout({
    title,
    description,
    pageTitle,
    breadcrumbs,
    createRoute,
    createLabel,
    statsCards,
    statsColumns = 4,
    contentTitle,
    contentDescription,
    contentIcon: ContentIcon,
    hasData,
    emptyStateProps,
    children,
    headerActions,
}: AdminListLayoutProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={pageTitle} />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <AdminPageHeader title={title} description={description} createRoute={createRoute} createLabel={createLabel}>
                    {headerActions}
                </AdminPageHeader>

                {/* Stats Cards */}
                {statsCards && statsCards.length > 0 && <AdminStatsCards cards={statsCards} columns={statsColumns} />}

                {/* Content */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {ContentIcon && <ContentIcon className="h-5 w-5" />}
                            {contentTitle}
                        </CardTitle>
                        <CardDescription>{contentDescription}</CardDescription>
                    </CardHeader>
                    <CardContent>{hasData ? children : emptyStateProps && <AdminEmptyState {...emptyStateProps} />}</CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
