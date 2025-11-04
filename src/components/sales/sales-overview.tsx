"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type TimeRange = "lastMonth" | "sixMonths" | "year";
type Metric = "sales" | "revenue" | "avgGain" | "priceDiff";

const TIME_RANGES: { id: TimeRange; label: string }[] = [
    { id: "lastMonth", label: "Dernier mois" },
    { id: "sixMonths", label: "6 mois" },
    { id: "year", label: "1 an" },
];

const METRICS: { id: Metric; label: string }[] = [
    { id: "sales", label: "Ventes" },
    { id: "revenue", label: "Gain total" },
    { id: "avgGain", label: "Gain moyen / vente" },
    { id: "priceDiff", label: "Écart prix affiché / vendu" },
];

// Données mockées, on garde les mêmes valeurs pour chaque période pour le MVP
const STATS_BY_RANGE: Record<
    TimeRange,
    {
        totalSales: number;
        totalGain: number;
        averageGainPerSale: number;
        totalPriceDiff: number;
        averagePriceDiffPercent: number;
    }
> = {
    lastMonth: {
        totalSales: 28,
        totalGain: 2450,
        averageGainPerSale: 87.5,
        totalPriceDiff: -230,
        averagePriceDiffPercent: -8,
    },
    sixMonths: {
        totalSales: 120,
        totalGain: 9800,
        averageGainPerSale: 81.6,
        totalPriceDiff: -950,
        averagePriceDiffPercent: -9,
    },
    year: {
        totalSales: 210,
        totalGain: 17400,
        averageGainPerSale: 82.9,
        totalPriceDiff: -1650,
        averagePriceDiffPercent: -8,
    },
};

const formatCurrency = (value: number) =>
    `${value.toLocaleString("fr-FR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    })} €`;

const formatCurrencyWithCents = (value: number) =>
    `${value.toLocaleString("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })} €`;

const formatSignedCurrency = (value: number) => {
    const abs = Math.abs(value);
    const formatted = abs.toLocaleString("fr-FR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
    const sign = value > 0 ? "+" : value < 0 ? "-" : "";
    return `${sign}${formatted} €`;
};

const formatPercent = (value: number) =>
    `${value.toLocaleString("fr-FR", {
        maximumFractionDigits: 0,
    })}%`;

export function SalesOverview() {
    const [timeRange, setTimeRange] = useState<TimeRange>("lastMonth");
    const [metric, setMetric] = useState<Metric>("sales");

    const stats = STATS_BY_RANGE[timeRange];

    return (
        <section className="space-y-6 rounded-2xl border p-6">
            {/* Ligne titre + filtres période + sélection métrique */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                    <p className="text-2xl font-semibold">
                        {stats.totalSales.toLocaleString("fr-FR")} ventes
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {TIME_RANGES.map((range) => (
                            <Button
                                key={range.id}
                                type="button"
                                size="sm"
                                variant={timeRange === range.id ? "default" : "outline"}
                                onClick={() => setTimeRange(range.id)}
                            >
                                {range.label}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col items-start gap-2 lg:items-end">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Métrique affichée
          </span>
                    <Select
                        value={metric}
                        onValueChange={(value) => setMetric(value as Metric)}
                    >
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Métrique" />
                        </SelectTrigger>
                        <SelectContent>
                            {METRICS.map((m) => (
                                <SelectItem key={m.id} value={m.id}>
                                    {m.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Stats + graphique */}
            <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)]">
                {/* Stats en colonne (comme sur le visuel) */}
                <dl className="space-y-3 text-sm">
                    <StatRow label="Gain total" value={formatCurrency(stats.totalGain)} />
                    <StatRow
                        label="Gain moyen / vente"
                        value={formatCurrencyWithCents(stats.averageGainPerSale)}
                    />
                    <StatRow
                        label="Écart total prix affiché / vendu"
                        value={formatSignedCurrency(stats.totalPriceDiff)}
                    />
                    <StatRow
                        label="Écart moyen prix affiché / vendu"
                        value={formatPercent(stats.averagePriceDiffPercent)}
                    />
                </dl>

                {/* Graphique placeholder */}
                <Card className="flex h-48 flex-col justify-between rounded-2xl border p-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Graphique des ventes ({getTimeRangeLabel(timeRange)})
            </span>
                        <span>{getMetricLabel(metric)}</span>
                    </div>

                    <div className="relative mt-2 flex-1">
                        {/* Placeholder graphique très simple */}
                        <div className="absolute inset-0 rounded-xl border border-dashed border-muted" />
                        <div className="absolute inset-4 flex items-center justify-center text-[11px] text-muted-foreground">
                            Graphique (placeholder)
                        </div>
                    </div>
                </Card>
            </div>
        </section>
    );
}

function StatRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-4 border-b pb-2 last:border-b-0">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-medium">{value}</dd>
        </div>
    );
}

function getTimeRangeLabel(range: TimeRange): string {
    const found = TIME_RANGES.find((r) => r.id === range);
    return found ? found.label.toLowerCase() : "";
}

function getMetricLabel(metric: Metric): string {
    const found = METRICS.find((m) => m.id === metric);
    return found ? found.label : "";
}