import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SellerCard } from "./seller-card";
import { DetailRow } from "@/components/misc/detail-row";

interface TechnicalDetailsProps {
    seller: {
        id: string;
        name: string;
        listingsCount: number;
    };
    category: string;
    brand?: string;
    size?: string;
    condition: string;
    location: string;
}

export function TechnicalDetails({
                                     seller,
                                     category,
                                     brand = "-",
                                     size = "-",
                                     condition,
                                     location,
                                 }: TechnicalDetailsProps) {
    return (
        <Card className="space-y-4 rounded-2xl border p-5">
            <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Détails techniques
                </p>
                <SellerCard
                    id={seller.id}
                    name={seller.name}
                    listingsCount={seller.listingsCount}
                    showContactButton
                    showProfileButton
                />
            </div>

            <Separator />

            <dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                <DetailRow
                    label="Catégorie"
                    value={category}
                    layout="stacked"
                    size="sm"
                />
                <DetailRow
                    label="Lieu"
                    value={location}
                    layout="stacked"
                    size="sm"
                />
                <DetailRow
                    label="Marque"
                    value={brand}
                    layout="stacked"
                    size="sm"
                />
                <DetailRow
                    label="Taille"
                    value={size}
                    layout="stacked"
                    size="sm"
                />
                <DetailRow
                    label="État"
                    value={condition}
                    layout="stacked"
                    size="sm"
                />
            </dl>
        </Card>
    );
}