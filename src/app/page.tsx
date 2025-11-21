// src/app/page.tsx

import { PageTitle } from "@/components/misc/page-title";
import { HomeListingsGrid } from "@/components/listing/home-listings-grid";
import { supabase } from "@/lib/supabaseClient";

type HomeProduct = {
    id: string;
    title: string;
    price: number;
    city: string | null;
    status: string;
    sellerId: string;
    imageUrl?: string;
};

export default async function HomePage() {
    // Récupération des annonces actives les plus récentes
    const { data, error } = await supabase
        .from("listings")
        .select(
            `
        id,
        title,
        price,
        city,
        status,
        seller_id,
        listing_images (
          image_url,
          position
        )
      `
        )
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(20) // 🔁 on récupère plus que 4 pour pouvoir compenser les annonces de l'utilisateur
        .order("position", { foreignTable: "listing_images", ascending: true }) // trie des images
        .limit(1, { foreignTable: "listing_images" }); // une seule image par annonce

    const products: HomeProduct[] = (data ?? []).map((row: any) => {
        const firstImage =
            Array.isArray(row.listing_images) && row.listing_images.length > 0
                ? row.listing_images[0].image_url
                : undefined;

        return {
            id: row.id,
            title: row.title,
            price: row.price,
            city: row.city,
            status: row.status,
            sellerId: row.seller_id,
            imageUrl: firstImage,
        };
    });

    return (
        <div className="space-y-10">
            {/* Hero */}
            <section className="space-y-6">
                <PageTitle
                    title="La plateforme dédiée à la gymnastique"
                    subtitle="Achetez et revendez du matériel de gymnastique artistique en toute confiance."
                />
                <div className="flex flex-wrap gap-3">{/* CTA simulés */}</div>
            </section>

            {/* Produits récents */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Produits récents</h2>

                {error && (
                    <p className="text-sm text-red-600">
                        Impossible de charger les produits pour le moment.
                    </p>
                )}

                <HomeListingsGrid products={products} hasError={!!error} />
            </section>
        </div>
    );
}