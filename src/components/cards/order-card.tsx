"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export type OrderRole = "buyer" | "seller";
export type OrderStatus = "in_progress" | "delivered" | "cancelled";

interface OrderCardProps {
    id: string;
    title: string;
    price: number;
    location?: string;
    counterpartName: string;
    date: string;
    status: OrderStatus;
    role: OrderRole;
    imageUrl?: string; // ✅ miniature de l'annonce (optionnelle)
}

/**
 * Carte compacte pour les commandes (achats / ventes).
 * - Format horizontal compact.
 * - Lien de suivi placé sous le statut pour réduire la largeur.
 */
export function OrderCard({
                              id,
                              title,
                              price,
                              location,
                              counterpartName,
                              date,
                              status,
                              role,
                              imageUrl,
                          }: OrderCardProps) {
    const counterpartLabel = role === "buyer" ? "Vendeur" : "Acheteur";

    const statusLabel =
        status === "delivered"
            ? "Livré"
            : status === "cancelled"
                ? "Annulé"
                : "En cours";

    const handleTrackOrder = () => {
        alert("Simulation : suivi de la commande.");
    };

    return (
        <Card className="w-full max-w-sm rounded-2xl border text-sm">
            <div className="flex gap-3 p-3 sm:p-4">
                <Link href={`/orders/${id}`} className="flex flex-1 gap-3">
                    {/* Vignette image */}
                    <div className="hidden h-20 w-20 overflow-hidden rounded-lg bg-muted sm:flex">
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt={title}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-[11px] text-muted-foreground">
                                Photo
                            </div>
                        )}
                    </div>

                    <div className="flex flex-1 flex-col gap-1">
                        <h3 className="line-clamp-2 text-sm font-medium">{title}</h3>
                        <p className="text-xs text-muted-foreground">
                            {counterpartLabel} : {counterpartName}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold">{price} €</p>
                            {location && (
                                <p className="text-xs text-muted-foreground">• {location}</p>
                            )}
                        </div>
                    </div>
                </Link>
            </div>

            {/* Footer : statut + date + bouton en colonne */}
            <div className="flex flex-col border-t px-3 py-2.5 sm:px-4">
                <span className="mb-1 text-xs text-muted-foreground">
                    Statut : {statusLabel} • {date}
                </span>

                {status === "in_progress" && (
                    <Button
                        type="button"
                        variant="link"
                        size="sm"
                        className="self-start px-0 text-xs"
                        onClick={handleTrackOrder}
                    >
                        Suivre la commande
                    </Button>
                )}
            </div>
        </Card>
    );
}
