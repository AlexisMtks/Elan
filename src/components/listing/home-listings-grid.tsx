// src/components/listing/home-listings-grid.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ProductCard } from "@/components/cards/product-card";

type HomeProduct = {
    id: string;
    title: string;
    price: number;       // en centimes
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

    // Le message d'erreur est déjà géré par le parent
    if (hasError) {
        return null;
    }

    // Cas : aucune annonce en base
    if (products.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                Aucune annonce disponible pour le moment.
            </p>
        );
    }

    // Pendant qu'on vérifie la session → petit message de chargement
    if (checking) {
        return (
            <p className="text-sm text-muted-foreground">
                Chargement des annonces...
            </p>
        );
    }

    const filteredProducts =
        userId === null ? products : products.filter((p) => p.sellerId !== userId);

    // Cas : il y avait des annonces, mais elles sont toutes à l'utilisateur connecté
    if (filteredProducts.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                Aucune annonce disponible pour le moment (vos propres annonces actives sont masquées).
            </p>
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {filteredProducts.map((p) => (
                <ProductCard
                    key={p.id}
                    id={p.id}
                    title={p.title}
                    // prix en euros (stocké en centimes en base)
                    price={p.price / 100}
                    location={p.city ?? undefined}
                    variant="compact"
                    imageUrl={p.imageUrl}
                />
            ))}
        </div>
    );
}