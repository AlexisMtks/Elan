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

    // Chargement initial des favoris de l'utilisateur
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
                console.error("Erreur chargement favoris :", error);
                setError("Impossible de charger vos favoris pour le moment.");
                setFavorites(new Set());
                setLoading(false);
                return;
            }

            const ids = new Set<string>(
                (data as FavoriteRow[] | null)?.map((row) => row.listing_id) ?? [],
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

    /**
     * Toggle en BDD + mise à jour optimiste.
     * - next === true  => ajoute en favoris
     * - next === false => supprime des favoris
     */
    const toggleFavorite = useCallback(
        async (listingId: string, next?: boolean) => {
            if (!userId) {
                console.warn("toggleFavorite appelé sans userId");
                return;
            }

            setError(null);

            const currentlyFavorite = favorites.has(listingId);
            const shouldBeFavorite =
                typeof next === "boolean" ? next : !currentlyFavorite;

            // Mise à jour optimiste
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
                    setError("Impossible d’ajouter cette annonce aux favoris.");
                    // rollback
                    setFavorites((prev) => {
                        const copy = new Set(prev);
                        copy.delete(listingId);
                        return copy;
                    });
                }
            } else {
                const { error } = await supabase
                    .from("favorites")
                    .delete()
                    .eq("user_id", userId)
                    .eq("listing_id", listingId);

                if (error) {
                    console.error("Erreur suppression favori :", error);
                    setError("Impossible de retirer cette annonce des favoris.");
                    // rollback
                    setFavorites((prev) => {
                        const copy = new Set(prev);
                        copy.add(listingId);
                        return copy;
                    });
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