import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SellerCard } from "./seller-card";

interface TechnicalDetailsProps {
    seller: {
        id: number;
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
                    Technical details
                </p>
                <SellerCard id={seller.id} name={seller.name} listingsCount={seller.listingsCount} />
            </div>

            <Separator />

            <dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                <DetailItem label="Category" value={category} />
                <DetailItem label="Location" value={location} />
                <DetailItem label="Brand" value={brand} />
                <DetailItem label="Size" value={size} />
                <DetailItem label="Condition" value={condition} />
            </dl>
        </Card>
    );
}

function DetailItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="space-y-0.5">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="font-medium">{value}</dd>
        </div>
    );
}