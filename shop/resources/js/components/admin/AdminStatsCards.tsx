import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCard {
    title: string;
    description?: string;
    value: string | number;
    subtext?: string;
    icon?: LucideIcon;
    variant?: 'default' | 'success' | 'warning' | 'danger';
}

interface AdminStatsCardsProps {
    cards: StatsCard[];
    columns?: 2 | 3 | 4;
}

export default function AdminStatsCards({ cards, columns = 4 }: AdminStatsCardsProps) {
    const getColumnClass = () => {
        switch (columns) {
            case 2:
                return 'md:grid-cols-2';
            case 3:
                return 'md:grid-cols-3';
            case 4:
                return 'md:grid-cols-4';
            default:
                return 'md:grid-cols-4';
        }
    };

    const getValueColor = (variant?: StatsCard['variant']) => {
        switch (variant) {
            case 'success':
                return 'text-green-600';
            case 'warning':
                return 'text-orange-600';
            case 'danger':
                return 'text-red-600';
            default:
                return '';
        }
    };

    return (
        <div className={`grid auto-rows-min gap-4 ${getColumnClass()}`}>
            {cards.map((card, index) => (
                <Card key={index}>
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base">{card.title}</CardTitle>
                                {card.description && <CardDescription>{card.description}</CardDescription>}
                            </div>
                            {card.icon && <card.icon className="text-muted-foreground h-4 w-4" />}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className={`mb-2 text-2xl font-bold ${getValueColor(card.variant)}`}>{card.value}</div>
                        {card.subtext && <div className="text-muted-foreground text-sm">{card.subtext}</div>}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
