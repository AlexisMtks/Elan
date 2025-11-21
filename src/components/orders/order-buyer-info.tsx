"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { SellerCard } from "@/components/listing/seller-card";
import { RatingStars } from "@/components/rating/rating-stars";

interface OrderBuyerInfoProps {
    id: string;                 // acheteur
    name: string;
    completedOrdersCount: number;
    avatarUrl?: string | null;
    orderId: string;            // commande
    reviewerId: string;         // user connecté (auth.uid())
}

/**
 * Bloc d'informations sur l'acheteur pour le détail de commande.
 * - Affiche la “fiche” de l’acheteur
 * - Permet de le noter sur la commande
 */
export function OrderBuyerInfo({
                                   id,
                                   name,
                                   completedOrdersCount,
                                   avatarUrl,
                                   orderId,
                                   reviewerId,
                               }: OrderBuyerInfoProps) {
    const [clientOrdersCount, setClientOrdersCount] =
        useState<number | null>(null);
    const [rating, setRating] = useState<number>(0);
    const [submitting, setSubmitting] = useState(false);

    // 🔢 Nombre de commandes (hors annulées)
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

    const displayedOrdersCount =
        clientOrdersCount !== null ? clientOrdersCount : completedOrdersCount;

    const handleRatingChange = async (newRating: number) => {
        setRating(newRating);

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
            console.error("Erreur enregistrement avis acheteur :", error);
            // éventuellement : setRating(0);
        }

        setSubmitting(false);
    };

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