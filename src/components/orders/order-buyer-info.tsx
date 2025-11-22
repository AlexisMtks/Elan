// components/orders/order-buyer-info.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { SellerCard } from "@/components/listing/seller-card";
import { RatingStars } from "@/components/rating/rating-stars";

interface OrderBuyerInfoProps {
    id: string; // acheteur
    name: string;
    completedOrdersCount: number;
    avatarUrl?: string | null;
    rating: number;
    submitting: boolean;
    onChangeRating: (newRating: number) => void;
}

/**
 * Bloc d'informations sur l'acheteur + note (sans commentaire).
 */
export function OrderBuyerInfo({
                                   id,
                                   name,
                                   completedOrdersCount,
                                   avatarUrl,
                                   rating,
                                   submitting,
                                   onChangeRating,
                               }: OrderBuyerInfoProps) {
    const [clientOrdersCount, setClientOrdersCount] =
        useState<number | null>(null);

    // 🔢 Nombre de commandes de l'acheteur
    useEffect(() => {
        if (!id) {
            setClientOrdersCount(null);
            return;
        }

        const fetchBuyerOrdersCount = async () => {
            const { count, error } = await supabase
                .from("orders")
                .select("id", { head: true, count: "exact" })
                .eq("buyer_id", id)
                .neq("status", "cancelled");

            if (!error) {
                setClientOrdersCount(count ?? 0);
            }
        };

        void fetchBuyerOrdersCount();
    }, [id]);

    const displayedOrdersCount =
        clientOrdersCount !== null ? clientOrdersCount : completedOrdersCount;

    return (
        <div className="flex flex-col gap-4">
            {/* Haut : acheteur + note */}
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2 md:flex-1">
                    <p className="text-sm font-semibold">Acheteur</p>
                    <SellerCard
                        id={id}
                        name={name}
                        avatarUrl={avatarUrl ?? undefined}
                        listingsCount={displayedOrdersCount}
                        showContactButton
                        showProfileButton
                    />
                </div>

                <div className="flex flex-col items-start gap-1 md:items-end md:pl-4">
          <span className="text-xs font-medium text-muted-foreground">
            Votre note
          </span>
                    <RatingStars
                        size="sm"
                        value={rating}
                        onChange={onChangeRating}
                        readOnly={submitting}
                    />
                </div>
            </div>
        </div>
    );
}