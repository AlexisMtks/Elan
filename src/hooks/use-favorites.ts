"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type FavoriteRow = {
    listing_id: string;
};

export function useFavorites(userId?: string) {
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Charge les favorites de l'utilisateur
    useEffect(() => {
        if (!userId) {
            setFavorites(new Set());
            setLoading(false);
            setError(null);
            return;
        }

        let cancelled = false;

        const load = async () => {
            setLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from("favorites")
                .select("listing_id")
                .eq("user_id", userId);

            if (cancelled) return;

            if (error) {
                console.error("Erreur chargement favorites :", error);
                setFavorites(new Set());
                setError("Impossible de charger vos favorites.");
                setLoading(false);
                return;
            }

            const ids = new Set<string>(
                (data ?? []).map((row: FavoriteRow) => row.listing_id),
            );

            setFavorites(ids);
            setLoading(false);
        };

        void load();

        return () => {
            cancelled = true;
        };
    }, [userId]);

    const isFavorite = useCallback(
        (listingId: string) => favorites.has(listingId),
        [favorites],
    );

    const toggleFavorite = useCallback(
        async (listingId: string, next?: boolean) => {
            if (!userId) return;

            const currentlyFavorite = favorites.has(listingId);
            const shouldBeFavorite =
                typeof next === "boolean" ? next : !currentlyFavorite;

            // Mise à jour optimiste locale
            setFavorites((prev) => {
                const copy = new Set(prev);
                if (shouldBeFavorite) {
                    copy.add(listingId);
                } else {
                    copy.delete(listingId);
                }
                return copy;
            });

            if (shouldBeFavorite) {
                const { error } = await supabase
                    .from("favorites")
                    .insert({ user_id: userId, listing_id: listingId });

                if (error) {
                    console.error("Erreur ajout favori :", error);
                    // rollback
                    setFavorites((prev) => {
                        const copy = new Set(prev);
                        copy.delete(listingId);
                        return copy;
                    });
                    setError("Impossible d’ajouter aux favorites.");
                    return;
                }

                // 🔔 Notifie le reste de l’app que les favorites ont changé
                if (typeof window !== "undefined") {
                    window.dispatchEvent(
                        new CustomEvent("elan_favorites_updated", {
                            detail: { listingId, inFavorites: true },
                        }),
                    );
                }
            } else {
                const { error } = await supabase
                    .from("favorites")
                    .delete()
                    .eq("user_id", userId)
                    .eq("listing_id", listingId);

                if (error) {
                    console.error("Erreur suppression favori :", error);
                    // rollback
                    setFavorites((prev) => {
                        const copy = new Set(prev);
                        copy.add(listingId);
                        return copy;
                    });
                    setError("Impossible de retirer des favorites.");
                    return;
                }

                if (typeof window !== "undefined") {
                    window.dispatchEvent(
                        new CustomEvent("elan_favorites_updated", {
                            detail: { listingId, inFavorites: false },
                        }),
                    );
                }
            }
        },
        [favorites, userId],
    );

    return {
        favorites,
        isFavorite,
        toggleFavorite,
        loading,
        error,
    };
}