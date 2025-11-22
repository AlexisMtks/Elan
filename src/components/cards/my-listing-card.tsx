"use client";

import { ProductCard } from "@/components/cards/product-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

type ListingStatus = "active" | "draft" | "ended";

interface MyListingCardProps {
    id: string;
    title: string;
    price: number;
    location: string;
    status: ListingStatus;
    imageUrl?: string;
    onDelete?: (id: string) => void | Promise<void>;
}

export function MyListingCard({
                                  id,
                                  title,
                                  price,
                                  location,
                                  status,
                                  imageUrl,
                                  onDelete,
                              }: MyListingCardProps) {
    const router = useRouter();

    const handleEdit = () => {
        // Redirige vers la page d’édition de l’annonce
        router.push(`/sell/${id}`);
    };

    const handleDelete = () => {
        if (onDelete) {
            onDelete(id);
            return;
        }

        // Fallback si onDelete n'est pas fourni
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
            // clickable: par défaut = true → même comportement que la home
            imageUrl={imageUrl}
            showActions={false}
            footer={
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge variant={statusVariant as any}>{statusLabel}</Badge>
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={handleEdit}>
                            Modifier
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleDelete}>
                            Supprimer
                        </Button>
                    </div>
                </div>
            }
        />
    );
}