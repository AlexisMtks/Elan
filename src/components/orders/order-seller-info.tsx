"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { SellerCard } from "@/components/listing/seller-card";

interface OrderSellerInfoProps {
    id: string;
    name: string;
    listingsCount: number;
}

/**
 * Bloc d'informations sur le vendeur pour le détail de commande,
 * basé sur la carte vendeur réutilisable (SellerCard).
 * On recalcule ici le nombre d'annonces actives du vendeur.
 */
export function OrderSellerInfo(props: OrderSellerInfoProps) {
    const [activeListingsCount, setActiveListingsCount] = useState<number | null>(null);

    useEffect(() => {
        const fetchActiveListingsCount = async () => {
            const { count, error } = await supabase
                .from("listings")
                .select("id", { count: "exact", head: true })
                .eq("seller_id", props.id)
                .eq("status", "active");

            if (!error) {
                setActiveListingsCount(count ?? 0);
            }
        };

        void fetchActiveListingsCount();
    }, [props.id]);

    const effectiveListingsCount =
        activeListingsCount !== null ? activeListingsCount : props.listingsCount ?? 0;

    return (
        <div className="space-y-3">
            <p className="text-sm font-semibold">Vendeur</p>
            <SellerCard
                id={props.id}
                name={props.name}
                listingsCount={effectiveListingsCount}
                showContactButton
                showProfileButton
            />
        </div>
    );
}