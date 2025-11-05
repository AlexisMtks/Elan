"use client";

import { useState } from "react";
import { OverviewCard, OverviewItem } from "@/components/overview/overview-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const TIME_RANGES = [
    { id: "1m", label: "30 derniers jours" },
    { id: "6m", label: "6 derniers mois" },
    { id: "12m", label: "12 derniers mois" },
] as const;

export type AnalyticsTimeRangeId = (typeof TIME_RANGES)[number]["id"];

export interface AnalyticsMetricConfig {
    id: string;
    label: string;
}

interface AnalyticsOverviewProps {
    title: string;
    description?: string;
    statsItems: OverviewItem[];
    chartTitle: string;
    metrics: AnalyticsMetricConfig[];
    initialTimeRangeId?: AnalyticsTimeRangeId;
    initialMetricId?: string;
}

/**
 * Composant générique d'overview analytique :
 * - boutons de période (identiques pour ventes / achats)
 * - select de métrique (configurable)
 * - carte de stats à gauche (OverviewCard)
 * - bloc "graphique" placeholder à droite
 */
export function AnalyticsOverview({
                                      title,
                                      description,
                                      statsItems,
                                      chartTitle,
                                      metrics,
                                      initialTimeRangeId = "6m",
                                      initialMetricId,
                                  }: AnalyticsOverviewProps) {
    const [timeRangeId, setTimeRangeId] =
        useState<AnalyticsTimeRangeId>(initialTimeRangeId);
    const [metricId, setMetricId] = useState<string>(
        initialMetricId ?? (metrics[0]?.id ?? "")
    );

    const currentRangeLabel =
        TIME_RANGES.find((r) => r.id === timeRangeId)?.label ?? "";
    const currentMetricLabel =
        metrics.find((m) => m.id === metricId)?.label ?? "";

    return (
        <section className="space-y-4">
            {/* Contrôles : période + métrique */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    {TIME_RANGES.map((range) => (
                        <Button
                            key={range.id}
                            type="button"
                            size="sm"
                            variant={range.id === timeRangeId ? "default" : "outline"}
                            onClick={() => setTimeRangeId(range.id)}
                        >
                            {range.label}
                        </Button>
                    ))}
                </div>

                <div className="w-full sm:w-56">
                    <Select
                        value={metricId}
                        onValueChange={(value) => setMetricId(value)}
                    >
                        <SelectTrigger className="h-9 text-sm">
                            <SelectValue placeholder="Métrique à afficher" />
                        </SelectTrigger>
                        <SelectContent>
                            {metrics.map((m) => (
                                <SelectItem key={m.id} value={m.id}>
                                    {m.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Grille : stats + graphique */}
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)]">
                <OverviewCard
                    title={title}
                    description={description}
                    items={statsItems}
                />

                <Card className="space-y-3 rounded-2xl border p-5">
                    <div className="space-y-1">
                        <h2 className="text-base font-semibold">{chartTitle}</h2>
                        <p className="text-xs text-muted-foreground">
                            {currentMetricLabel} sur la période : {currentRangeLabel}.
                        </p>
                    </div>

                    <div className="mt-2 flex h-40 items-center justify-center rounded-xl border border-dashed text-xs text-muted-foreground">
                        Graphique à intégrer ici (placeholder)
                    </div>
                </Card>
            </div>
        </section>
    );
}