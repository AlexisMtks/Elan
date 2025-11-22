"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { SellerCard } from "@/components/listing/seller-card";
import { RatingStars } from "@/components/rating/rating-stars";

interface OrderSellerInfoProps {
    id: string; // vendeur
    name: string;
    listingsCount: number; // fallback initial
    avatarUrl?: string | null;
    rating: number;
    submitting: boolean;
    onChangeRating: (newRating: number) => void;
}

/**
 * Bloc d'infos du vendeur + note (sans commentaire, ni logique Supabase de review).
 */
export function OrderSellerInfo({
                                    id,
                                    name,
                                    listingsCount,
                                    avatarUrl,
                                    rating,
                                    submitting,
                                    onChangeRating,
                                }: OrderSellerInfoProps) {
    const [activeListingsCount, setActiveListingsCount] =
        useState<number | null>(null);

    // 🔢 Nombre d'annonces actives du vendeur
    useEffect(() => {
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
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2 md:flex-1">
                    <p className="text-sm font-semibold">Vendeur</p>
                    <SellerCard
                        id={id}
                        name={name}
                        avatarUrl={avatarUrl ?? undefined}
                        listingsCount={displayedListingsCount}
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