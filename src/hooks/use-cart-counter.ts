"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const GUEST_CART_STORAGE_KEY = "elan_guest_cart_v1";

type CartUpdatedDetail = { listingId: string; inCart: boolean };

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

export function useCartCounter(userId?: string) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            if (!userId) {
                const ids = readGuestCartFromStorage();
                if (!cancelled) setCount(ids.length);
                return;
            }

            // utilisateur connecté -> on compte les items du panier "open"
            const { data: cart, error: cartError } = await supabase
                .from("carts")
                .select("id")
                .eq("user_id", userId)
                .eq("status", "open")
                .maybeSingle();

            if (cancelled) return;

            if (cartError || !cart) {
                if (cartError) {
                    console.error("Erreur chargement compteur panier :", cartError);
                }
                setCount(0);
                return;
            }

            const { count, error: itemsError } = await supabase
                .from("cart_items")
                .select("id", { count: "exact", head: true })
                .eq("cart_id", cart.id);

            if (cancelled) return;

            if (itemsError) {
                console.error("Erreur comptage items panier :", itemsError);
                setCount(0);
                return;
            }

            setCount(count ?? 0);
        };

        void load();

        const handler = (event: Event) => {
            const custom = event as CustomEvent<CartUpdatedDetail>;
            setCount((prev) =>
                custom.detail.inCart ? prev + 1 : Math.max(0, prev - 1),
            );
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

    return count;
}