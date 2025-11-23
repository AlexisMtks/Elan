"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ProductCard } from "@/components/cards/product-card";
import { useFavorites } from "@/hooks/use-favorites";
import { useCart } from "@/hooks/use-cart";

type ListingRow = {
    id: string;
    title: string;
    price: number; // centimes
    city: string | null;
    sellerId: string;
    imageUrl?: string;
};

interface SuggestedListingsGridProps {
    listings: ListingRow[];
}

export function SuggestedListingsGrid({
                                          listings,
                                      }: SuggestedListingsGridProps) {
    const [userId, setUserId] = useState<string | null>(null);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const loadUser = async () => {
            try {
                const { data, error } = await supabase.auth.getUser();
                if (cancelled) return;

                if (error || !data.user) {
                    setUserId(null);
                } else {
                    setUserId(data.user.id);
                }
            } finally {
                if (!cancelled) {
                    setChecking(false);
                }
            }
        };

        void loadUser();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (cancelled) return;

            if (session?.user) {
                setUserId(session.user.id);
            } else {
                setUserId(null);
            }
        });

        return () => {
            cancelled = true;
            subscription.unsubscribe();
        };
    }, []);

    const {
        isFavorite,
        toggleFavorite,
        loading: favoritesLoading,
    } = useFavorites(userId ?? undefined);

    const {
        isInCart,
        toggleCart,
        loading: cartLoading,
    } = useCart(userId ?? undefined);

    if (checking || favoritesLoading || cartLoading) {
        return null;
    }

    const filtered = listings.filter(
        (listing) => !userId || listing.sellerId !== userId,
    );

    if (filtered.length === 0) {
        return null;
    }

    return (
        <section className="mt-8 space-y-4">
            <h2 className="text-lg font-semibold">
                D&apos;autres produits qui pourraient vous intéresser
            </h2>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {filtered.map((p) => (
                    <ProductCard
                        key={p.id}
                        id={p.id}
                        title={p.title}
                        price={p.price / 100}
                        location={p.city ?? undefined}
                        variant="compact"
                        imageUrl={p.imageUrl}
                        canFavorite={!!userId}
                        initialIsFavorite={!!userId && isFavorite(p.id)}
                        onToggleFavorite={(next) => {
                            if (!userId) return;
                            void toggleFavorite(p.id, next);
                        }}
                        initialIsInCart={isInCart(p.id)}
                        onToggleCart={(next) => {
                            void toggleCart(p.id, next);
                        }}
                    />
                ))}
            </div>
        </section>
    );
}