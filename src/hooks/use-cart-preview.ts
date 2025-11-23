"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const GUEST_CART_STORAGE_KEY = "elan_guest_cart_v1";

type CartPreviewItem = {
    id: string;
    title: string;
    price: number; // centimes
    city: string | null;
    imageUrl?: string;
};

function readGuestCartFromStorage(): string[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = window.sessionStorage.getItem(GUEST_CART_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter((id) => typeof id === "string");
    } catch {
        return [];
    }
}

export function useCartPreview(userId?: string) {
    const [items, setItems] = useState<CartPreviewItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            setError(null);

            // 🟢 Mode invité : on lit sessionStorage
            if (!userId) {
                const ids = readGuestCartFromStorage();
                if (ids.length === 0) {
                    if (!cancelled) {
                        setItems([]);
                        setLoading(false);
                    }
                    return;
                }

                const { data, error } = await supabase
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
                    .in("id", ids)
                    .order("created_at", { ascending: false })
                    .order("position", {
                        foreignTable: "listing_images",
                        ascending: true,
                    })
                    .limit(10, { foreignTable: "listing_images" });

                if (cancelled) return;

                if (error) {
                    console.error("Erreur chargement preview panier invité :", error);
                    setItems([]);
                    setError("Impossible de charger votre panier.");
                    setLoading(false);
                    return;
                }

                const mapped: CartPreviewItem[] = (data ?? []).map((row: any) => {
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
                });

                setItems(mapped);
                setLoading(false);
                return;
            }

            // 🟢 Mode connecté : on lit carts + cart_items
            const { data: cart, error: cartError } = await supabase
                .from("carts")
                .select("id")
                .eq("user_id", userId)
                .eq("status", "open")
                .maybeSingle();

            if (cancelled) return;

            if (cartError) {
                console.error("Erreur chargement panier preview :", cartError);
                setItems([]);
                setError("Impossible de charger votre panier.");
                setLoading(false);
                return;
            }

            if (!cart) {
                setItems([]);
                setLoading(false);
                return;
            }

            const { data: itemsRows, error: itemsError } = await supabase
                .from("cart_items")
                .select("listing_id")
                .eq("cart_id", cart.id);

            if (cancelled) return;

            if (itemsError) {
                console.error("Erreur chargement items panier preview :", itemsError);
                setItems([]);
                setError("Impossible de charger votre panier.");
                setLoading(false);
                return;
            }

            const listingIds =
                (itemsRows ?? []).map((row: { listing_id: string }) => row.listing_id) ??
                [];

            if (listingIds.length === 0) {
                setItems([]);
                setLoading(false);
                return;
            }

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
                console.error(
                    "Erreur chargement listings panier preview :",
                    listingsError,
                );
                setItems([]);
                setError("Impossible de charger votre panier.");
                setLoading(false);
                return;
            }

            const mapped: CartPreviewItem[] = (listingsData ?? []).map((row: any) => {
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
            });

            setItems(mapped);
            setLoading(false);
        };

        void load();

        const handler = () => {
            void load();
        };

        if (typeof window !== "undefined") {
            window.addEventListener("elan_cart_updated", handler as EventListener);
        }

        return () => {
            cancelled = true;
            if (typeof window !== "undefined") {
                window.removeEventListener(
                    "elan_cart_updated",
                    handler as EventListener,
                );
            }
        };
    }, [userId]);

    return { items, loading, error };
}