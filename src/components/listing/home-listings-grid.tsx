"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ProductCard } from "@/components/cards/product-card";
import { useFavorites } from "@/hooks/use-favorites";
import { useCart } from "@/hooks/use-cart";

type HomeProduct = {
    id: string;
    title: string;
    price: number; // centimes
    city: string | null;
    status: string;
    sellerId: string;
    imageUrl?: string;
};

interface HomeListingsGridProps {
    products: HomeProduct[];
    hasError: boolean;
}

export function HomeListingsGrid({ products, hasError }: HomeListingsGridProps) {
    const [userId, setUserId] = useState<string | null>(null);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function loadInitialUser() {
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
        }

        void loadInitialUser();

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

    if (hasError) {
        return null;
    }

    if (products.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                Aucune annonce disponible pour le moment.
            </p>
        );
    }

    // On attend que auth + favorites + panier soient prêts
    if (checking || favoritesLoading || cartLoading) {
        return (
            <p className="text-sm text-muted-foreground">
                Chargement des annonces…
            </p>
        );
    }

    const filteredProducts =
        userId === null
            ? products
            : products.filter((p) => p.sellerId !== userId);

    if (filteredProducts.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                Aucune annonce disponible pour le moment (vos propres annonces
                actives sont masquées).
            </p>
        );
    }

    const visibleProducts = filteredProducts.slice(0, 10);

    return (
        <div className="relative">
            <div
                className="
          flex gap-4 overflow-x-auto pb-3 pt-1
          snap-x snap-mandatory
          [-ms-overflow-style:none] [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
        "
            >
                {visibleProducts.map((p) => (
                    <div
                        key={p.id}
                        className="
              snap-start flex-shrink-0 min-w-[220px] max-w-xs
              transition-transform transition-shadow duration-200
              hover:-translate-y-1 hover:shadow-lg
            "
                    >
                        <ProductCard
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
                    </div>
                ))}
            </div>
        </div>
    );
}