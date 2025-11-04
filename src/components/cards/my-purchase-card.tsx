"use client";

import { ProductCard } from "@/components/cards/product-card";
import { Button } from "@/components/ui/button";

type PurchaseStatus = "in_progress" | "delivered" | "cancelled";

interface MyPurchaseCardProps {
    id: string; // ici id = identifiant de la commande
    title: string;
    price: number;
    location?: string;
    seller: string;
    date: string;
    status: PurchaseStatus;
}

export function MyPurchaseCard({
                                   id,
                                   title,
                                   price,
                                   location,
                                   seller,
                                   date,
                                   status,
                               }: MyPurchaseCardProps) {
    const handleTrackOrder = () => {
        alert("Simulation : suivi de la commande.");
    };

    const statusLabel =
        status === "delivered"
            ? "Livré"
            : status === "cancelled"
                ? "Annulé"
                : "En cours";

    return (
        <ProductCard
            id={id}
            title={title}
            price={price}
            location={location}
            subtitle={`Vendeur : ${seller}`}
            href={`/orders/${id}`}  // 👈 clic sur la carte → détail de la commande
            // clickable reste true par défaut
            footer={
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-muted-foreground">
                        Statut : {statusLabel} • {date}
                    </span>

                    {status === "in_progress" && (
                        <Button
                            type="button"
                            variant="link"
                            size="sm"
                            className="px-0 text-xs"
                            onClick={handleTrackOrder}
                        >
                            Suivre la commande
                        </Button>
                    )}
                </div>
            }
        />
    );
}
