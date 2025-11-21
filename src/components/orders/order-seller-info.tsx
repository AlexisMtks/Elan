"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { SellerCard } from "@/components/listing/seller-card";

interface OrderSellerInfoProps {
    id: string;
    name: string;
    listingsCount: number; // fallback initial
}

/**
 * Bloc d'informations sur le vendeur pour le détail de commande,
 * basé sur la carte vendeur réutilisable (SellerCard).
 * Recalcule en temps réel le nombre d'annonces actives du vendeur.
 */
export function OrderSellerInfo({ id, name, listingsCount }: OrderSellerInfoProps) {
    const [activeListingsCount, setActiveListingsCount] = useState<number | null>(null);

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

    // Si la requête n'a pas encore répondu, on affiche la valeur fournie par le serveur
    const displayedListingsCount =
        activeListingsCount !== null ? activeListingsCount : listingsCount;

    return (
        <div className="space-y-3">
            <p className="text-sm font-semibold">Vendeur</p>
            <SellerCard
                id={id}
                name={name}
                listingsCount={displayedListingsCount}
                showContactButton
                showProfileButton
            />
        </div>
    );
}