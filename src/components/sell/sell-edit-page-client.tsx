"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
// ✅ bon chemin vers ton hook
import { useRequireAuth } from "@/hooks/use-require-auth";
import { SellForm } from "@/components/forms/sell-form";
import { Loader2 } from "lucide-react";

type ConditionValue = "new" | "like_new" | "very_good" | "good" | "used";

type ListingWithImages = {
    id: string;
    seller_id: string;
    title: string;
    description: string;
    price: number;
    currency: string | null;
    status: string;
    category_id: number | null;
    brand: string | null;
    condition: ConditionValue | null;
    size: string | null;
    city: string | null;
    country: string | null;
    is_negotiable: boolean | null;
    shipping_time: number | null;
    listing_images: { image_url: string }[];
};

interface SellEditPageClientProps {
    listingId: string;
}

export function SellEditPageClient({ listingId }: SellEditPageClientProps) {
    const router = useRouter();
    const { user, checking } = useRequireAuth(); // ✅ on utilise `checking`

    const [loading, setLoading] = useState(true);
    const [listing, setListing] = useState<ListingWithImages | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (checking) return; // on attend la fin de la vérif auth
        if (!user) return; // le hook redirige déjà, mais on sécurise

        const fetchListing = async () => {
            setLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from("listings")
                .select(
                    `
          id,
          seller_id,
          title,
          description,
          price,
          currency,
          status,
          category_id,
          brand,
          condition,
          size,
          city,
          country,
          is_negotiable,
          shipping_time,
          listing_images ( image_url )
        `
                )
                .eq("id", listingId)
                .single();

            if (error) {
                console.error("Error fetching listing for edit:", error);
                setError("Impossible de charger cette annonce.");
                setLoading(false);
                return;
            }

            if (!data) {
                setError("Annonce introuvable.");
                setLoading(false);
                return;
            }

            if (data.seller_id !== user.id) {
                setError("Vous n'êtes pas autorisé à modifier cette annonce.");
                setLoading(false);
                return;
            }

            setListing(data as ListingWithImages);
            setLoading(false);
        };

        void fetchListing();
    }, [checking, user, listingId]);

    if (checking || loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                <span>Chargement de l&apos;annonce…</span>
            </div>
        );
    }

    if (error || !listing) {
        return (
            <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error ?? "Annonce introuvable."}
            </div>
        );
    }

    const imageUrls = listing.listing_images?.map((img) => img.image_url) ?? [];

    return (
        <SellForm
            formMode="edit"
            listingId={listing.id}
            initialValues={{
                title: listing.title,
                description: listing.description,
                price: listing.price / 100,
                categoryId: listing.category_id,
                condition: listing.condition ?? "good",
                imageUrls,
            }}
            onSuccess={() => {
                // redirige vers ta page "Mes annonces"
                router.replace("/listings");
                // ou router.push("/listings"); si tu veux garder l'historique
            }}
        />
    );
}