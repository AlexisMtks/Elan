import { Card } from "@/components/ui/card";
import { DetailRow } from "@/components/misc/detail-row";

export interface OverviewItem {
    label: string;
    value: string;
}

interface OverviewCardProps {
    title: string;
    description?: string;
    items: OverviewItem[];
}

/**
 * Carte générique d'aperçu (overview) utilisée pour :
 * - les ventes (SalesOverview)
 * - les achats (PurchasesOverview)
 *
 * Affiche un titre, une description optionnelle, et une liste
 * de lignes label / valeur.
 */
export function OverviewCard({ title, description, items }: OverviewCardProps) {
    return (
        <Card className="space-y-4 rounded-2xl border p-5">
            <div className="space-y-1">
                <h2 className="text-base font-semibold">{title}</h2>
                {description && (
                    <p className="text-sm text-muted-foreground">{description}</p>
                )}
            </div>

            <dl className="space-y-3 text-sm">
                {items.map((item, index) => (
                    <DetailRow
                        key={index}
                        label={item.label}
                        value={item.value}
                        bordered
                        align="right"
                    />
                ))}
            </dl>
        </Card>
    );
}