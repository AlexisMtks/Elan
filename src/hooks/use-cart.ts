"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const GUEST_CART_STORAGE_KEY = "elan_guest_cart_v1";

type CartItemRow = {
    listing_id: string;
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

function writeGuestCartToStorage(ids: string[]) {
    if (typeof window === "undefined") return;

    try {
        window.sessionStorage.setItem(
            GUEST_CART_STORAGE_KEY,
            JSON.stringify(ids),
        );
    } catch {
        // ignore
    }
}

export function useCart(userId?: string) {
    const [cartId, setCartId] = useState<string | null>(null);
    const [items, setItems] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Chargement initial (guest vs connecté)
    useEffect(() => {
        let cancelled = false;

        const initGuestCart = () => {
            const ids = readGuestCartFromStorage();
            if (cancelled) return;
            setCartId(null);
            setItems(new Set(ids));
            setError(null);
            setLoading(false);
        };

        const initUserCart = async (uid: string) => {
            setLoading(true);
            setError(null);

            const { data: cart, error: cartError } = await supabase
                .from("carts")
                .select("id")
                .eq("user_id", uid)
                .eq("status", "open")
                .maybeSingle();

            if (cancelled) return;

            if (cartError) {
                console.error("Erreur chargement panier :", cartError);
                setCartId(null);
                setItems(new Set());
                setError("Impossible de charger votre panier.");
                setLoading(false);
                return;
            }

            if (!cart) {
                setCartId(null);
                setItems(new Set());
                setLoading(false);
                return;
            }

            const { data: itemsData, error: itemsError } = await supabase
                .from("cart_items")
                .select("listing_id")
                .eq("cart_id", cart.id);

            if (cancelled) return;

            if (itemsError) {
                console.error("Erreur chargement items panier :", itemsError);
                setCartId(cart.id);
                setItems(new Set());
                setError("Impossible de charger les articles du panier.");
                setLoading(false);
                return;
            }

            const ids = new Set<string>(
                (itemsData ?? []).map((row: CartItemRow) => row.listing_id),
            );

            setCartId(cart.id);
            setItems(ids);
            setLoading(false);
        };

        if (!userId) {
            initGuestCart();
        } else {
            void initUserCart(userId);
        }

        return () => {
            cancelled = true;
        };
    }, [userId]);

    const isInCart = useCallback(
        (listingId: string) => items.has(listingId),
        [items],
    );

    const toggleCart = useCallback(
        async (listingId: string, next?: boolean) => {
            const currentlyInCart = items.has(listingId);
            const shouldBeInCart =
                typeof next === "boolean" ? next : !currentlyInCart;

            // 🟢 GUEST MODE
            if (!userId) {
                setItems((prev) => {
                    const copy = new Set(prev);
                    if (shouldBeInCart) {
                        copy.add(listingId);
                    } else {
                        copy.delete(listingId);
                    }
                    writeGuestCartToStorage(Array.from(copy));
                    return copy;
                });

                if (typeof window !== "undefined") {
                    window.dispatchEvent(
                        new CustomEvent("elan_cart_updated", {
                            detail: { listingId, inCart: shouldBeInCart },
                        }),
                    );
                }

                return;
            }

            // 🟢 USER MODE
            setError(null);

            // Ajout au panier
            if (shouldBeInCart) {
                let currentCartId = cartId;

                if (!currentCartId) {
                    const { data: newCart, error: createError } = await supabase
                        .from("carts")
                        .insert({ user_id: userId })
                        .select("id")
                        .single();

                    if (createError || !newCart) {
                        console.error("Erreur création panier :", createError);
                        setError("Impossible de créer votre panier.");
                        return;
                    }

                    currentCartId = newCart.id;
                    setCartId(newCart.id);
                }

                // Optimiste
                setItems((prev) => {
                    const copy = new Set(prev);
                    copy.add(listingId);
                    return copy;
                });

                const { error: insertError } = await supabase.from("cart_items").insert({
                    cart_id: currentCartId,
                    listing_id: listingId,
                    quantity: 1,
                });

                if (insertError) {
                    console.error("Erreur ajout article panier :", insertError);
                    setError("Impossible d’ajouter cet article au panier.");
                    setItems((prev) => {
                        const copy = new Set(prev);
                        copy.delete(listingId);
                        return copy;
                    });
                    return;
                }

                if (typeof window !== "undefined") {
                    window.dispatchEvent(
                        new CustomEvent("elan_cart_updated", {
                            detail: { listingId, inCart: true },
                        }),
                    );
                }

                return;
            }

            // Retrait du panier
            if (!cartId) return;

            setItems((prev) => {
                const copy = new Set(prev);
                copy.delete(listingId);
                return copy;
            });

            const { error: deleteError } = await supabase
                .from("cart_items")
                .delete()
                .eq("cart_id", cartId)
                .eq("listing_id", listingId);

            if (deleteError) {
                console.error("Erreur retrait article panier :", deleteError);
                setError("Impossible de retirer cet article du panier.");
                setItems((prev) => {
                    const copy = new Set(prev);
                    copy.add(listingId);
                    return copy;
                });
                return;
            }

            if (typeof window !== "undefined") {
                window.dispatchEvent(
                    new CustomEvent("elan_cart_updated", {
                        detail: { listingId, inCart: false },
                    }),
                );
            }
        },
        [cartId, items, userId],
    );

    return {
        isInCart,
        toggleCart,
        loading,
        error,
    };
}