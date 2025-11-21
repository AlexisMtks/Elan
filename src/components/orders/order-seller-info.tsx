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
 * Bloc d'infos du vendeur + note liée à la commande.
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
    const [reviewId, setReviewId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // 🔢 Nombre d'annonces actives
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

    // ⭐ Charger une éventuelle review existante pour (reviewer, vendeur, commande)
    useEffect(() => {
        if (!reviewerId || !id || !orderId) return;

        const fetchExistingReview = async () => {
            const { data, error } = await supabase
                .from("reviews")
                .select("id, rating")
                .eq("reviewer_id", reviewerId)
                .eq("reviewed_id", id)
                .eq("order_id", orderId)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();

            if (!error && data) {
                setRating(data.rating ?? 0);
                setReviewId(data.id);
            }
        };

        void fetchExistingReview();
    }, [reviewerId, id, orderId]);

    const displayedListingsCount =
        activeListingsCount !== null ? activeListingsCount : listingsCount;

    const handleRatingChange = async (newRating: number) => {
        setRating(newRating);

        if (!reviewerId || !id || !orderId) return;

        setSubmitting(true);

        try {
            if (reviewId) {
                // 🔁 Review déjà existante → UPDATE
                const { error } = await supabase
                    .from("reviews")
                    .update({
                        rating: newRating,
                        reviewer_avatar_url: avatarUrl ?? null,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", reviewId);

                if (error) {
                    console.error("Erreur update avis vendeur :", error);
                }
            } else {
                // 🆕 Pas encore de review → INSERT
                const { data, error } = await supabase
                    .from("reviews")
                    .insert({
                        reviewer_id: reviewerId,
                        reviewed_id: id,
                        order_id: orderId,
                        rating: newRating,
                        comment: null,
                        reviewer_avatar_url: avatarUrl ?? null,
                    })
                    .select("id")
                    .single();

                if (error) {
                    console.error("Erreur insert avis vendeur :", error);
                } else if (data?.id) {
                    setReviewId(data.id);
                }
            }
        } finally {
            setSubmitting(false);
        }
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