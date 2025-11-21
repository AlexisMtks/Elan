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
        .limit(30) // 🔁 on prend un peu de marge pour pouvoir en garder 10 après filtrage
        .order("position", { foreignTable: "listing_images", ascending: true })
        .limit(1, { foreignTable: "listing_images" });

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
            <section className="space-y-2">
                <PageTitle
                    title="La plateforme dédiée à la gymnastique"
                    subtitle="Achetez et revendez du matériel de gymnastique artistique en toute confiance."
                />
                <div className="flex flex-wrap gap-3">{/* CTA simulés */}</div>
            </section>

            {/* Produits récents */}
            <section className="space-y-2">
                <h2 className="text-xl font-semibold">Produits récents</h2>

                {error && (
                    <p className="text-sm text-red-600 sapece-y-6">
                        Impossible de charger les produits pour le moment.
                    </p>
                )}

                <HomeListingsGrid products={products} hasError={!!error} />
            </section>
        </div>
    );
}