import {
    AnalyticsOverview,
    AnalyticsMetricConfig,
} from "@/components/overview/analytics-overview";
import {
    formatCurrency,
    formatCurrencyWithCents,
} from "@/lib/formatters";

interface PurchasesOverviewProps {
    stats: {
        totalAmount: number;
        averagePrice: number;
        orders: number;
        delivered: number;
    };
}

const PURCHASES_METRICS: AnalyticsMetricConfig[] = [
    { id: "spend", label: "Montant dépensé" },
    { id: "avg_price", label: "Prix moyen" },
    { id: "orders", label: "Nombre de commandes" },
];

/**
 * Aperçu des achats : configuration spécifique (labels + stats)
 * branchée sur le composant générique AnalyticsOverview.
 */
export function PurchasesOverview({ stats }: PurchasesOverviewProps) {
    const items = [
        {
            label: "Montant dépensé",
            value: formatCurrency(stats.totalAmount),
        },
        {
            label: "Prix moyen",
            value: formatCurrencyWithCents(stats.averagePrice),
        },
        {
            label: "Nombre de commandes",
            value: stats.orders.toString(),
        },
        {
            label: "Commandes livrées",
            value: stats.delivered.toString(),
        },
    ];

    return (
        <AnalyticsOverview
            title="Statistiques d’achats"
            description="Aperçu de vos dépenses et commandes."
            statsItems={items}
            chartTitle="Évolution de vos achats"
            metrics={PURCHASES_METRICS}
            initialMetricId="spend"
        />
    );
}