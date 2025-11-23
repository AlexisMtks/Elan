"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type FavoritePreviewItem = {
    id: string;
    title: string;
    price: number; // centimes
    city: string | null;
    imageUrl?: string;
};

export function useFavoritesPreview(userId?: string) {
    const [items, setItems] = useState<FavoritePreviewItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            if (!userId) {
                setItems([]);
                setLoading(false);
                setError(null);
                return;
            }

            setLoading(true);
            setError(null);

            // 1) Récupère les listing_id des favorites
            const { data: favRows, error: favError } = await supabase
                .from("favorites")
                .select("listing_id")
                .eq("user_id", userId);

            if (cancelled) return;

            if (favError) {
                console.error("Erreur chargement favorites preview :", favError);
                setItems([]);
                setError("Impossible de charger vos favorites.");
                setLoading(false);
                return;
            }

            const listingIds =
                (favRows ?? []).map((row: { listing_id: string }) => row.listing_id) ??
                [];

            if (listingIds.length === 0) {
                setItems([]);
                setLoading(false);
                return;
            }

            // 2) Récupère les infos de listings correspondants (limité à 10 pour la preview)
            const { data: listingsData, error: listingsError } = await supabase
                .from("listings")
                .select(
                    `
            id,
            title,
            price,
            city,
            listing_images (
              image_url,
              position
            )
          `,
                )
                .in("id", listingIds)
                .order("created_at", { ascending: false })
                .order("position", { foreignTable: "listing_images", ascending: true })
                .limit(10, { foreignTable: "listing_images" });

            if (cancelled) return;

            if (listingsError) {
                console.error("Erreur chargement listings favorites preview :", listingsError);
                setItems([]);
                setError("Impossible de charger vos favorites.");
                setLoading(false);
                return;
            }

            const mapped: FavoritePreviewItem[] = (listingsData ?? []).map(
                (row: any) => {
                    const firstImage =
                        Array.isArray(row.listing_images) && row.listing_images.length > 0
                            ? row.listing_images[0].image_url
                            : undefined;

                    return {
                        id: row.id,
                        title: row.title,
                        price: row.price,
                        city: row.city,
                        imageUrl: firstImage,
                    };
                },
            );

            setItems(mapped);
            setLoading(false);
        };

        void load();

        // se resynchronise quand les favorites changent (toggle sur une card)
        const handler = () => {
            void load();
        };

        if (typeof window !== "undefined") {
            window.addEventListener(
                "elan_favorites_updated",
                handler as EventListener,
            );
        }

        return () => {
            cancelled = true;
            if (typeof window !== "undefined") {
                window.removeEventListener(
                    "elan_favorites_updated",
                    handler as EventListener,
                );
            }
        };
    }, [userId]);

    return { items, loading, error };
}