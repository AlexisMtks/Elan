import { Card } from "@/components/ui/card";

interface PieChartPlaceholderProps {
    title: string;
    activeCount: number;
    draftCount: number;
}

export function PieChartPlaceholder({
                                        title,
                                        activeCount,
                                        draftCount,
                                    }: PieChartPlaceholderProps) {
    const total = activeCount + draftCount || 1;
    const activePercent = Math.round((activeCount / total) * 100);
    const draftPercent = 100 - activePercent;

    return (
        <Card className="flex flex-col gap-4 rounded-2xl border p-4">
            <p className="text-sm font-semibold">{title}</p>

            <div className="flex flex-1 items-center gap-6">
                {/* Cercle placeholder */}
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-muted">
          <span className="text-xs text-muted-foreground">
            {activePercent}% / {draftPercent}%
          </span>
                </div>

                {/* Légende */}
                <div className="space-y-2 text-xs">
                    <LegendItem
                        label="Annonces actives"
                        value={activeCount}
                        percent={activePercent}
                    />
                    <LegendItem
                        label="Brouillons"
                        value={draftCount}
                        percent={draftPercent}
                    />
                </div>
            </div>
        </Card>
    );
}

function LegendItem({
                        label,
                        value,
                        percent,
                    }: {
    label: string;
    value: number;
    percent: number;
}) {
    return (
        <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                <span>{label}</span>
            </div>
            <span className="text-muted-foreground">
        {value} ({percent}%)
      </span>
        </div>
    );
}