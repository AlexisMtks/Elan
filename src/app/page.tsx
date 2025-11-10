import { ProductCard } from "@/components/cards/product-card";
import { PageTitle } from "@/components/misc/page-title";
import { supabase } from "@/lib/supabaseClient";

type ListingRow = {
  id: number;
  title: string;
  price: number;
  city: string | null;
  status: string;
};

export default async function HomePage() {
  // Récupération des annonces actives les plus récentes
  const { data, error } = await supabase
    .from("listings")
    .select("id, title, price, city, status")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(4); // utiliser un caroussel ?

  const products = (data ?? []) as ListingRow[];

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

      {/* Catégories (placeholder) */}
      {/* ... */}

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
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
