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
type Metric = "amount" | "orders" | "averagePrice" | "delivered";

const TIME_RANGES: { id: TimeRange; label: string }[] = [
    { id: "lastMonth", label: "Dernier mois" },
    { id: "sixMonths", label: "6 mois" },
    { id: "year", label: "1 an" },
];

const METRICS: { id: Metric; label: string }[] = [
    { id: "amount", label: "Montant dépensé" },
    { id: "orders", label: "Nombre de commandes" },
    { id: "averagePrice", label: "Prix moyen" },
    { id: "delivered", label: "Commandes livrées" },
];

// Données mockées pour le MVP
const STATS_BY_RANGE: Record<
    TimeRange,
    {
        orders: number;
        totalAmount: number;
        averagePrice: number;
        delivered: number;
    }
> = {
    lastMonth: {
        orders: 18,
        totalAmount: 1560,
        averagePrice: 86.6,
        delivered: 15,
    },
    sixMonths: {
        orders: 72,
        totalAmount: 6120,
        averagePrice: 85,
        delivered: 60,
    },
    year: {
        orders: 130,
        totalAmount: 11000,
        averagePrice: 84.6,
        delivered: 110,
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

export function PurchasesOverview() {
    const [timeRange, setTimeRange] = useState<TimeRange>("lastMonth");
    const [metric, setMetric] = useState<Metric>("amount");

    const stats = STATS_BY_RANGE[timeRange];

    return (
        <section className="space-y-6 rounded-2xl border p-6">
            {/* Titre + filtres de période + métrique */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                    <p className="text-2xl font-semibold">
                        {stats.orders.toLocaleString("fr-FR")} commandes
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
                        <SelectTrigger className="w-[220px]">
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
                {/* Colonne de stats (comme sur le visuel) */}
                <dl className="space-y-3 text-sm">
                    <StatRow
                        label="Montant dépensé"
                        value={formatCurrency(stats.totalAmount)}
                    />
                    <StatRow
                        label="Prix moyen"
                        value={formatCurrencyWithCents(stats.averagePrice)}
                    />
                    <StatRow
                        label="Nombre de commandes"
                        value={stats.orders.toString()}
                    />
                    <StatRow
                        label="Commandes livrées"
                        value={stats.delivered.toString()}
                    />
                </dl>

                {/* Graphique placeholder */}
                <Card className="flex h-48 flex-col justify-between rounded-2xl border p-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Graphique des achats ({getTimeRangeLabel(timeRange)})
            </span>
                        <span>{getMetricLabel(metric)}</span>
                    </div>

                    <div className="relative mt-2 flex-1">
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