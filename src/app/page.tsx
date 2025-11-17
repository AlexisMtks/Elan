import { ProductCard } from "@/components/cards/product-card";
import { PageTitle } from "@/components/misc/page-title";
import { supabase } from "@/lib/supabaseClient";

type HomeProduct = {
    id: string;
    title: string;
    price: number;
    city: string | null;
    status: string;
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
      listing_images (
        image_url,
        position
      )
    `
        )
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(4) // on limite le nombre d'annonces
        .order("position", { foreignTable: "listing_images", ascending: true }) // on trie les images par position
        .limit(1, { foreignTable: "listing_images" }); // ✅ on ne charge que la première image par annonce

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
                <div className="flex flex-wrap gap-3">
                    {/* CTA simulés */}
                </div>
            </section>

            {/* Produits récents */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Produits récents</h2>

                {error && (
                    <p className="text-sm text-red-600">
                        Impossible de charger les produits pour le moment.
                    </p>
                )}

                {products.length === 0 && !error ? (
                    <p className="text-sm text-muted-foreground">
                        Aucune annonce disponible pour le moment.
                    </p>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                        {products.map((p) => (
                            <ProductCard
                                key={p.id}
                                id={p.id}
                                title={p.title}
                                // Prix en euros (stocké en centimes en base)
                                price={p.price / 100}
                                location={p.city ?? undefined}
                                variant="compact"
                                imageUrl={p.imageUrl}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}