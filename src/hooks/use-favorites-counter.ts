"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type FavoritesUpdatedDetail = { listingId: string; inFavorites: boolean };

export function useFavoritesCounter(userId?: string) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            if (!userId) {
                setCount(0);
                return;
            }

            const { count, error } = await supabase
                .from("favorites")
                .select("id", { count: "exact", head: true })
                .eq("user_id", userId);

            if (cancelled) return;

            if (error) {
                console.error("Erreur chargement compteur favorites :", error);
                setCount(0);
                return;
            }

            setCount(count ?? 0);
        };

        void load();

        const handler = (event: Event) => {
            const custom = event as CustomEvent<FavoritesUpdatedDetail>;
            setCount((prev) =>
                custom.detail.inFavorites ? prev + 1 : Math.max(0, prev - 1),
            );
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

    return count;
}