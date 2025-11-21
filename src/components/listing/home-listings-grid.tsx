// src/components/listing/home-listings-grid.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ProductCard } from "@/components/cards/product-card";

type HomeProduct = {
    id: string;
    title: string;
    price: number; // en centimes
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

        // ✅ écoute des changements de session (login / logout)
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
                Aucune annonce disponible pour le moment (vos propres annonces actives
                sont masquées).
            </p>
        );
    }

    // 🔟 On garde les 10 premières après filtrage
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
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}