"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useCart } from "@/hooks/use-cart";
import { useFavorites } from "@/hooks/use-favorites";

import { PageTitle } from "@/components/misc/page-title";
import { ProductCard } from "@/components/cards/product-card";
import { Button } from "@/components/ui/button";

const GUEST_CART_STORAGE_KEY = "elan_guest_cart_v1";

type CartListing = {
    id: string;
    title: string;
    price: number; // centimes
    city: string | null;
    sellerId: string;
    imageUrl?: string;
    quantity: number;
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

export default function CartPage() {
    const router = useRouter();
    const { user, checking } = useCurrentUser();
    const userId = user?.id ?? undefined;

    const [loading, setLoading] = useState(true);
    const [cartItems, setCartItems] = useState<CartListing[]>([]);
    const [error, setError] = useState<string | null>(null);

    const { toggleCart } = useCart(userId);
    const { isFavorite, toggleFavorite } = useFavorites(userId);

    useEffect(() => {
        if (checking) return;

        let cancelled = false;

        const load = async () => {
            setLoading(true);
            setError(null);

            // 🟢 Mode invité : panier en sessionStorage
            if (!userId) {
                const ids = readGuestCartFromStorage();

                if (ids.length === 0) {
                    if (!cancelled) {
                        setCartItems([]);
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
              seller_id,
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
                    .limit(1, { foreignTable: "listing_images" });

                if (cancelled) return;

                if (error) {
                    console.error("Erreur chargement panier invité :", error);
                    setError("Impossible de charger votre panier.");
                    setCartItems([]);
                    setLoading(false);
                    return;
                }

                const mapped: CartListing[] = (data ?? []).map((row: any) => {
                    const firstImage =
                        Array.isArray(row.listing_images) && row.listing_images.length > 0
                            ? row.listing_images[0].image_url
                            : undefined;

                    return {
                        id: row.id,
                        title: row.title,
                        price: row.price,
                        city: row.city,
                        sellerId: row.seller_id,
                        imageUrl: firstImage,
                        quantity: 1,
                    };
                });

                setCartItems(mapped);
                setLoading(false);
                return;
            }

            // 🟢 Mode connecté : carts + cart_items
            const { data: cart, error: cartError } = await supabase
                .from("carts")
                .select("id")
                .eq("user_id", userId)
                .eq("status", "open")
                .maybeSingle();

            if (cancelled) return;

            if (cartError) {
                console.error("Erreur chargement panier :", cartError);
                setError("Impossible de charger votre panier.");
                setCartItems([]);
                setLoading(false);
                return;
            }

            if (!cart) {
                setCartItems([]);
                setLoading(false);
                return;
            }

            const { data: itemsRows, error: itemsError } = await supabase
                .from("cart_items")
                .select("listing_id, quantity")
                .eq("cart_id", cart.id);

            if (cancelled) return;

            if (itemsError) {
                console.error("Erreur chargement items panier :", itemsError);
                setError("Impossible de charger votre panier.");
                setCartItems([]);
                setLoading(false);
                return;
            }

            const listingIds =
                (itemsRows ?? []).map((row: { listing_id: string }) => row.listing_id) ??
                [];

            if (listingIds.length === 0) {
                setCartItems([]);
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
            seller_id,
            listing_images (
              image_url,
              position
            )
          `,
                )
                .in("id", listingIds)
                .order("created_at", { ascending: false })
                .order("position", { foreignTable: "listing_images", ascending: true })
                .limit(1, { foreignTable: "listing_images" });

            if (cancelled) return;

            if (listingsError) {
                console.error("Erreur chargement listings panier :", listingsError);
                setError("Impossible de charger votre panier.");
                setCartItems([]);
                setLoading(false);
                return;
            }

            const quantityById = new Map<string, number>();
            (itemsRows ?? []).forEach(
                (row: { listing_id: string; quantity: number }) => {
                    quantityById.set(row.listing_id, row.quantity ?? 1);
                },
            );

            const mapped: CartListing[] = (listingsData ?? []).map((row: any) => {
                const firstImage =
                    Array.isArray(row.listing_images) && row.listing_images.length > 0
                        ? row.listing_images[0].image_url
                        : undefined;

                return {
                    id: row.id,
                    title: row.title,
                    price: row.price,
                    city: row.city,
                    sellerId: row.seller_id,
                    imageUrl: firstImage,
                    quantity: quantityById.get(row.id) ?? 1,
                };
            });

            setCartItems(mapped);
            setLoading(false);
        };

        void load();

        return () => {
            cancelled = true;
        };
    }, [userId, checking]);

    const totalCents = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
    );

    if (checking || loading) {
        return (
            <div className="space-y-4">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => router.back()}
                >
                    ← Retour
                </Button>
                <p className="text-sm text-muted-foreground">
                    Chargement de votre panier…
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
            >
                ← Retour
            </Button>

            <PageTitle
                title="Mon panier"
                subtitle="Retrouvez les articles que vous avez ajoutés au panier."
            />

            {error && (
                <p className="text-sm text-red-600">
                    {error}
                </p>
            )}

            {cartItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    Votre panier est vide pour le moment.
                </p>
            ) : (
                <>
                    <section className="space-y-4">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <p className="text-sm text-muted-foreground">
                                {cartItems.length} article
                                {cartItems.length > 1 ? "s" : ""} dans votre panier.
                            </p>
                            <p className="text-base font-semibold">
                                Total : {(totalCents / 100).toFixed(2)} €
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                            {cartItems.map((item) => (
                                <ProductCard
                                    key={item.id}
                                    id={item.id}
                                    title={item.title}
                                    price={item.price / 100}
                                    location={item.city ?? undefined}
                                    imageUrl={item.imageUrl}
                                    canFavorite={!!userId}
                                    initialIsFavorite={!!userId && isFavorite(item.id)}
                                    onToggleFavorite={(next) => {
                                        if (!userId) return;
                                        void toggleFavorite(item.id, next);
                                    }}
                                    initialIsInCart
                                    onToggleCart={(next) => {
                                        void toggleCart(item.id, next);
                                        if (!next) {
                                            setCartItems((prev) =>
                                                prev.filter((p) => p.id !== item.id),
                                            );
                                        }
                                    }}
                                />
                            ))}
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}