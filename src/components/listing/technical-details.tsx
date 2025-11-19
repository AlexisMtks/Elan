import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SellerCard } from "./seller-card";
import { DetailRow } from "@/components/misc/detail-row";
import { ListingActions } from "./listing-actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface TechnicalDetailsProps {
    listingId: string;
    seller: {
        id: string;
        name: string;
        listingsCount: number;
        avatarUrl?: string | null;
    };
    title: string;
    price?: number | null;
    category: string;
    brand?: string;
    size?: string;
    condition: string;
    location: string;
}

export function TechnicalDetails({
                                     listingId,
                                     seller,
                                     title,
                                     price,
                                     category,
                                     brand = "-",
                                     size = "-",
                                     condition,
                                     location,
                                 }: TechnicalDetailsProps) {
    const hasPrice = typeof price === "number" && !Number.isNaN(price);

    const formattedPrice = hasPrice
        ? `${price!.toLocaleString("fr-FR", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        })} €`
        : "Prix non renseigné";

    return (
        <Card className="rounded-2xl border p-5">
            {/* 1. Profil vendeur (marge réduite) */}
            <div className="">
                <SellerCard
                    id={seller.id}
                    name={seller.name}
                    listingsCount={seller.listingsCount}
                    avatarUrl={seller.avatarUrl}
                    showContactButton={false}
                    showProfileButton={false}
                />
            </div>

            <Separator className="-my-2"/>

            {/* 2. Titre + prix + actions (moins d'espace) */}
            <div className="space-y-2">
                <h1 className="text-xl font-semibold leading-snug">
                    {title}
                </h1>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-2xl font-semibold">{formattedPrice}</p>
                    <ListingActions/>
                </div>
            </div>

            <Separator className="-my-2"/>

            {/* 3. Détails techniques (écart réduit) */}
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <DetailRow label="Catégorie" value={category} layout="stacked" size="sm"/>
                <DetailRow label="Lieu" value={location} layout="stacked" size="sm"/>
                <DetailRow label="Marque" value={brand} layout="stacked" size="sm"/>
                <DetailRow label="Taille" value={size} layout="stacked" size="sm"/>
                <DetailRow label="État" value={condition} layout="stacked" size="sm"/>
            </dl>

            <Separator className="-my-2"/>

            {/* 4. Boutons contacter / voir profil */}
            <div className="flex flex-col gap-2">
                <Button asChild>
                    <Link
                        href={{
                            pathname: "/messages",
                            query: {
                                seller: seller.id,
                                listing: listingId,
                            },
                        }}
                    >
                        Contacter le vendeur
                    </Link>
                </Button>

                <Button variant="outline" asChild>
                    <Link href={`/profile/${seller.id}`}>
                        Voir le profil
                    </Link>
                </Button>
            </div>
        </Card>
    );
}