// src/app/research/page.tsx
import { FilterPanel } from "@/components/filters/filter-panel";
import { FilterChips } from "@/components/filters/filter-chips";
import { ProductCard } from "@/components/cards/product-card";
import { PageTitle } from "@/components/misc/page-title";
import { supabase } from "@/lib/supabaseClient";

interface SearchPageProps {
    searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const { q } = await searchParams;
    const query = typeof q === "string" ? q.trim() : "";

    // Filtres actifs mockés pour l’instant
    const activeFilters = ["Tapis", "Bon état", "Moins de 100 €"];

    // Requête de base : annonces actives
    let supaQuery = supabase
        .from("listings")
        .select("id, title, price, city", { count: "exact" })
        .eq("status", "active");

    // Si une recherche est saisie, on filtre sur le titre
    if (query) {
        supaQuery = supaQuery.ilike("title", `%${query}%`);
    }

    const { data, error, count } = await supaQuery;
    const listings = data ?? [];
    const total = count ?? listings.length;

    const title =
        query && query.length > 0
            ? `${total} résultat${total > 1 ? "s" : ""} pour “${query}”`
            : `${total} résultat${total > 1 ? "s" : ""}`;

    return (
        <div className="flex gap-8">
            <FilterPanel />

            <div className="flex-1 space-y-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3">
                        <PageTitle title={title} />
                        <FilterChips filters={activeFilters} />
                    </div>

                    <div className="text-sm text-muted-foreground">
                        Trier par : <span className="font-medium">Prix croissant</span>
                    </div>
                </div>

                {error && (
                    <p className="text-sm text-red-600">
                        Impossible de charger les résultats pour le moment.
                    </p>
                )}

                {listings.length === 0 && !error ? (
                    <p className="text-sm text-muted-foreground">
                        Aucun résultat ne correspond à votre recherche.
                    </p>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                        {listings.map((p) => (
                            <ProductCard
                                key={p.id}
                                id={p.id}
                                title={p.title}
                                price={p.price / 100}
                                location={p.city ?? undefined}
                                variant="compact"
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}