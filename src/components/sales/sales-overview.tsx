import {
    AnalyticsOverview,
    AnalyticsMetricConfig,
} from "@/components/overview/analytics-overview";
import {
    formatCurrency,
    formatCurrencyWithCents,
    formatSignedCurrency,
    formatPercent,
} from "@/lib/formatters";

interface SalesOverviewProps {
    stats: {
        totalGain: number;
        averageGainPerSale: number;
        totalPriceDiff: number;
        averagePriceDiffPercent: number;
    };
}

const SALES_METRICS: AnalyticsMetricConfig[] = [
    { id: "revenue", label: "Chiffre d’affaires" },
    { id: "avg_per_sale", label: "Gain moyen / vente" },
    { id: "price_diff", label: "Écart prix affiché / vendu" },
];

/**
 * Aperçu des ventes : configuration spécifique (labels + stats)
 * branchée sur le composant générique AnalyticsOverview.
 */
export function SalesOverview({ stats }: SalesOverviewProps) {
    const items = [
        {
            label: "Gain total",
            value: formatCurrency(stats.totalGain),
        },
        {
            label: "Gain moyen / vente",
            value: formatCurrencyWithCents(stats.averageGainPerSale),
        },
        {
            label: "Écart total prix affiché / vendu",
            value: formatSignedCurrency(stats.totalPriceDiff),
        },
        {
            label: "Écart moyen prix affiché / vendu",
            value: formatPercent(stats.averagePriceDiffPercent),
        },
    ];

    return (
        <AnalyticsOverview
            title="Statistiques de ventes"
            description="Aperçu de vos performances sur les articles vendus."
            statsItems={items}
            chartTitle="Évolution des ventes"
            metrics={SALES_METRICS}
            initialMetricId="revenue"
        />
    );
}