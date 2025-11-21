"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { SellerCard } from "@/components/listing/seller-card";
import { RatingStars } from "@/components/rating/rating-stars";

interface OrderSellerInfoProps {
    id: string;
    name: string;
    listingsCount: number; // fallback initial
    avatarUrl?: string | null;
}

/**
 * Bloc d'informations sur le vendeur pour le détail de commande,
 * basé sur la carte vendeur réutilisable (SellerCard).
 * Recalcule en temps réel le nombre d'annonces actives du vendeur.
 */
export function OrderSellerInfo({
                                    id,
                                    name,
                                    listingsCount,
                                    avatarUrl,
                                }: OrderSellerInfoProps) {
    const [activeListingsCount, setActiveListingsCount] =
        useState<number | null>(null);
    const [rating, setRating] = useState<number>(0);

    useEffect(() => {
        // 🛑 Sécurité : si le seller_id est vide → ne pas faire de requête
        if (!id) {
            setActiveListingsCount(null);
            return;
        }

        const fetchActiveListings = async () => {
            const { count, error } = await supabase
                .from("listings")
                .select("id", { head: true, count: "exact" })
                .eq("seller_id", id)
                .eq("status", "active");

            if (!error) {
                setActiveListingsCount(count ?? 0);
            }
        };

        void fetchActiveListings();
    }, [id]);

    const displayedListingsCount =
        activeListingsCount !== null ? activeListingsCount : listingsCount;

    return (
        <div className="space-y-3">
            <p className="text-sm font-semibold">Vendeur</p>
            <SellerCard
                id={id}
                name={name}
                avatarUrl={avatarUrl ?? undefined}
                listingsCount={displayedListingsCount}
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