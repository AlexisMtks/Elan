"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { SellerCard } from "@/components/listing/seller-card";
import { RatingStars } from "@/components/rating/rating-stars";

interface OrderSellerInfoProps {
    id: string;              // vendeur
    name: string;
    listingsCount: number;   // fallback initial
    avatarUrl?: string | null;
    orderId: string;         // commande
    reviewerId: string;      // user connecté (auth.uid())
}

/**
 * Bloc d'informations sur le vendeur pour le détail de commande,
 * basé sur la carte vendeur réutilisable (SellerCard).
 * - Recalcule le nombre d'annonces actives du vendeur
 * - Permet de noter le vendeur (insert dans reviews)
 */
export function OrderSellerInfo({
                                    id,
                                    name,
                                    listingsCount,
                                    avatarUrl,
                                    orderId,
                                    reviewerId,
                                }: OrderSellerInfoProps) {
    const [activeListingsCount, setActiveListingsCount] =
        useState<number | null>(null);
    const [rating, setRating] = useState<number>(0);
    const [submitting, setSubmitting] = useState(false);

    // 🔢 Recalcul du nombre d'annonces actives
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

    // ⭐ Pré-charger une éventuelle review existante
    useEffect(() => {
        if (!reviewerId || !id || !orderId) return;

        const fetchExistingReview = async () => {
            const { data, error } = await supabase
                .from("reviews")
                .select("rating")
                .eq("reviewer_id", reviewerId)
                .eq("reviewed_id", id)
                .eq("order_id", orderId)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();

            if (!error && data?.rating) {
                setRating(data.rating);
            }
        };

        void fetchExistingReview();
    }, [reviewerId, id, orderId]);

    const displayedListingsCount =
        activeListingsCount !== null ? activeListingsCount : listingsCount;

    const handleRatingChange = async (newRating: number) => {
        setRating(newRating);

        // Si on n'a pas les infos essentielles, on s'arrête au front
        if (!reviewerId || !id || !orderId) return;

        setSubmitting(true);

        const { error } = await supabase.from("reviews").insert({
            reviewer_id: reviewerId,
            reviewed_id: id,
            order_id: orderId,
            rating: newRating,
            comment: null,
            reviewer_avatar_url: avatarUrl ?? null,
        });

        if (error) {
            console.error("Erreur enregistrement avis vendeur :", error);
            // En cas d’erreur, tu peux décider de revert la note si tu veux
            // setRating(0);
        }

        setSubmitting(false);
    };

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

            {/* Juste les étoiles, cliquables */}
            <div className="pt-1">
                <RatingStars
                    size="sm"
                    value={rating}
                    onChange={handleRatingChange}
                    readOnly={submitting}
                />
            </div>
        </div>
    );
}