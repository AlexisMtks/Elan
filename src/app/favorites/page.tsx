"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useFavorites } from "@/hooks/use-favorites";
import { useCart } from "@/hooks/use-cart";

import { PageTitle } from "@/components/misc/page-title";
import { ProductCard } from "@/components/cards/product-card";
import { Button } from "@/components/ui/button";

type FavoriteListing = {
    id: string;
    title: string;
    price: number; // centimes
    city: string | null;
    sellerId: string;
    imageUrl?: string;
};

export default function FavoritesPage() {
    const router = useRouter();
    const { user, checking } = useRequireAuth();
    const userId = user?.id;

    const [loading, setLoading] = useState(true);
    const [listings, setListings] = useState<FavoriteListing[]>([]);
    const [error, setError] = useState<string | null>(null);

    const { isFavorite, toggleFavorite } = useFavorites(userId);
    const { toggleCart } = useCart(userId);

    useEffect(() => {
        if (!userId) return;

        let cancelled = false;

        const load = async () => {
            setLoading(true);
            setError(null);

            const { data: favRows, error: favError } = await supabase
                .from("favorites")
                .select("listing_id")
                .eq("user_id", userId);

            if (cancelled) return;

            if (favError) {
                console.error("Erreur chargement favoris :", favError);
                setError("Impossible de charger vos favoris pour le moment.");
                setListings([]);
                setLoading(false);
                return;
            }

            const listingIds =
                (favRows ?? []).map((row: { listing_id: string }) => row.listing_id) ??
                [];

            if (listingIds.length === 0) {
                setListings([]);
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
                console.error("Erreur chargement listings favoris :", listingsError);
                setError("Impossible de charger vos favoris pour le moment.");
                setListings([]);
                setLoading(false);
                return;
            }

            const mapped: FavoriteListing[] = (listingsData ?? []).map((row: any) => {
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
                };
            });

            const filtered = mapped.filter((l) => l.sellerId !== userId);

            setListings(filtered);
            setLoading(false);
        };

        void load();

        return () => {
            cancelled = true;
        };
    }, [userId]);

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
                    Chargement de vos favoris…
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
                title="Mes favoris"
                subtitle="Retrouvez les annonces que vous avez ajoutées en favoris."
            />

            {error && (
                <p className="text-sm text-red-600">
                    {error}
                </p>
            )}

            {listings.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    Vous n’avez pas encore de favoris.
                </p>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {listings.map((listing) => (
                        <ProductCard
                            key={listing.id}
                            id={listing.id}
                            title={listing.title}
                            price={listing.price / 100}
                            location={listing.city ?? undefined}
                            imageUrl={listing.imageUrl}
                            canFavorite={!!userId}
                            initialIsFavorite={!!userId && isFavorite(listing.id)}
                            onToggleFavorite={(next) => {
                                if (!next) {
                                    setListings((prev) =>
                                        prev.filter((item) => item.id !== listing.id),
                                    );
                                }
                                void toggleFavorite(listing.id, next);
                            }}
                            initialIsInCart={false}
                            onToggleCart={(next) => {
                                void toggleCart(listing.id, next);
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}