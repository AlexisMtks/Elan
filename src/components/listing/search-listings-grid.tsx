// src/components/listing/search-listings-grid.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ProductCard } from "@/components/cards/product-card";

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

export function SearchListingsGrid({ listings, hasError }: SearchListingsGridProps) {
    const [userId, setUserId] = useState<string | null>(null);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function loadUser() {
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

        loadUser();

        return () => {
            cancelled = true;
        };
    }, []);

    if (hasError) {
        // le message d'erreur est géré par la page
        return null;
    }

    // Aucun résultat en base (indépendamment de l'utilisateur)
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

    // Toutes les annonces trouvées appartiennent à l'utilisateur connecté
    if (filteredListings.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                Aucun résultat ne correspond à votre recherche (vos propres annonces
                actives sont masquées).
            </p>
        );
    }

    const visibleCount = filteredListings.length;

    return (
        <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
                {visibleCount}{" "}
                {visibleCount > 1 ? "annonces trouvées" : "annonce trouvée"}
            </p>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {filteredListings.map((p) => (
                    <ProductCard
                        key={p.id}
                        id={p.id}
                        title={p.title}
                        price={p.price / 100}
                        location={p.city ?? undefined}
                        variant="compact"
                        imageUrl={p.imageUrl}
                    />
                ))}
            </div>
        </div>
    );
}