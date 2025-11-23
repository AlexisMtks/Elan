// src/components/listing/search-listings-grid.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ProductCard } from "@/components/cards/product-card";
import { useFavorites } from "@/hooks/use-favorites";

type ListingRow = {
    id: string;
    title: string;
    price: number; // centimes
    city: string | null;
    sellerId: string;
    imageUrl?: string;
};

interface SearchListingsGridProps {
    listings: ListingRow[];
    hasError: boolean;
}

export function SearchListingsGrid({
                                       listings,
                                       hasError,
                                   }: SearchListingsGridProps) {
    const [userId, setUserId] = useState<string | null>(null);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const loadInitialUser = async () => {
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

        void loadInitialUser();

        // Écoute live des changements d'auth (login / logout)
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

    const { isFavorite, toggleFavorite } = useFavorites(userId ?? undefined);

    if (hasError) {
        return null;
    }

    if (listings.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                Aucun résultat ne correspond à votre recherche.
            </p>
        );
    }

    if (checking) {
        return (
            <p className="text-sm text-muted-foreground">
                Chargement des résultats...
            </p>
        );
    }

    const filteredListings =
        userId === null ? listings : listings.filter((l) => l.sellerId !== userId);

    if (filteredListings.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                Aucun résultat, vos propres annonces étant masquées.
            </p>
        );
    }

    return (
        <section className="space-y-3">
            <p className="text-sm text-muted-foreground">
                {filteredListings.length} résultat
                {filteredListings.length > 1 ? "s" : ""} trouvé
                {filteredListings.length > 1 ? "s" : ""}.
            </p>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {filteredListings.map((p) => (
                    <div
                        key={p.id}
                        className="
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
                            initialIsFavorite={!!userId && isFavorite(p.id)}
                            onToggleFavorite={(next) => {
                                if (!userId) return;
                                void toggleFavorite(p.id, next);
                            }}
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}