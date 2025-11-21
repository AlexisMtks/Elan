"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { SellerCard } from "@/components/listing/seller-card";
import { RatingStars } from "@/components/rating/rating-stars";

interface OrderBuyerInfoProps {
    id: string;
    name: string;
    /**
     * Valeur de secours envoyée par le serveur (ex: nombre d’achats),
     * utilisée tant que la requête côté client n’a pas répondu.
     */
    completedOrdersCount: number;
    avatarUrl?: string | null;
}

/**
 * Bloc d'informations sur l'acheteur pour le détail de commande.
 * Très proche de OrderSellerInfo, mais basé sur les commandes
 * où l'utilisateur est buyer.
 */
export function OrderBuyerInfo({
                                   id,
                                   name,
                                   completedOrdersCount,
                                   avatarUrl,
                               }: OrderBuyerInfoProps) {
    const [clientOrdersCount, setClientOrdersCount] =
        useState<number | null>(null);
    const [rating, setRating] = useState<number>(0);

    useEffect(() => {
        // 🛑 Si pas d'id acheteur → aucune requête
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
        <div className="space-y-3">
            <p className="text-sm font-semibold">Acheteur</p>
            <SellerCard
                id={id}
                name={name}
                avatarUrl={avatarUrl ?? undefined}
                listingsCount={displayedOrdersCount}
                showContactButton
                showProfileButton
            />

            {/* Juste les étoiles, sans texte */}
            <div className="pt-1">
                <RatingStars size="sm" value={rating} onChange={setRating} />
            </div>
        </div>
    );
}