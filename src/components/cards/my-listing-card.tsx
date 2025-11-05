"use client";

import { ProductCard } from "@/components/cards/product-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type ListingStatus = "active" | "draft" | "ended";

interface MyListingCardProps {
    id: string;
    title: string;
    price: number;
    location: string;
    status: ListingStatus;
}

export function MyListingCard({
                                  id,
                                  title,
                                  price,
                                  location,
                                  status,
                              }: MyListingCardProps) {
    const handleEdit = () => {
        alert("Simulation : modification de l’annonce.");
    };

    const handleDelete = () => {
        alert("Simulation : suppression de l’annonce.");
    };

    const statusLabel =
        status === "active"
            ? "En ligne"
            : status === "draft"
                ? "Brouillon"
                : "Terminée";

    const statusVariant =
        status === "active"
            ? "default"
            : status === "draft"
                ? "secondary"
                : "outline";

    return (
        <ProductCard
            id={id}
            title={title}
            price={price}
            location={location}
            variant="default"
            clickable={false} // désactive la navigation sur cette variante
            footer={
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge variant={statusVariant as any}>{statusLabel}</Badge>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleEdit}
                        >
                            Modifier
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleDelete}
                        >
                            Supprimer
                        </Button>
                    </div>
                </div>
            }
        />
    );
}