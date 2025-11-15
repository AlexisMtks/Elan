// src/app/research/page.tsx
import { FilterPanel } from "@/components/filters/filter-panel";
import { FilterChips } from "@/components/filters/filter-chips";
import { ProductCard } from "@/components/cards/product-card";
import { PageTitle } from "@/components/misc/page-title";
import { supabase } from "@/lib/supabaseClient";

type CategoryValue = "all" | "agres" | "tapis" | "accessoires";
type ConditionValue = "new" | "like_new" | "very_good" | "good" | "used";
type NegotiableValue = "all" | "yes" | "no";

interface SearchPageSearchParams {
    q?: string;
    category?: CategoryValue;
    minPrice?: string;
    maxPrice?: string;
    city?: string;
    conditions?: string; // CSV: "new,good,used"
    negotiable?: NegotiableValue;
}

interface SearchPageProps {
    searchParams: Promise<SearchPageSearchParams>;
}

type ListingRow = {
    id: string;
    title: string;
    price: number; // centimes
    city: string | null;
};

const CATEGORY_LABELS: Record<Exclude<CategoryValue, "all">, string> = {
    agres: "Agrès",
    tapis: "Tapis",
    accessoires: "Accessoires",
};

const CONDITION_LABELS: Record<ConditionValue, string> = {
    new: "Neuf",
    like_new: "Comme neuf",
    very_good: "Très bon état",
    good: "Bon état",
    used: "État correct",
};

const CATEGORY_ID_BY_SLUG: Record<Exclude<CategoryValue, "all">, number> = {
    agres: 1,
    tapis: 2,
    accessoires: 3,
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const resolvedParams = await searchParams;

    const query = typeof resolvedParams.q === "string" ? resolvedParams.q.trim() : "";
    const category =
        (resolvedParams.category as CategoryValue | undefined) && resolvedParams.category !== ""
            ? (resolvedParams.category as CategoryValue)
            : "all";

    const minPrice = resolvedParams.minPrice
        ? Number.parseInt(resolvedParams.minPrice, 10)
        : undefined;
    const maxPrice = resolvedParams.maxPrice
        ? Number.parseInt(resolvedParams.maxPrice, 10)
        : undefined;

    const city =
        typeof resolvedParams.city === "string" ? resolvedParams.city.trim() : "";

    const negotiable =
        (resolvedParams.negotiable as NegotiableValue | undefined) && resolvedParams.negotiable !== ""
            ? (resolvedParams.negotiable as NegotiableValue)
            : "all";

    const conditionsParam =
        typeof resolvedParams.conditions === "string"
            ? resolvedParams.conditions.trim()
            : "";
    const conditions: ConditionValue[] =
        conditionsParam.length > 0
            ? (conditionsParam.split(",").filter(Boolean) as ConditionValue[])
            : [];

    // ----------------------------
    // 1) Filtres actifs (chips)
    // ----------------------------
    const activeFilters: string[] = [];

    if (query) {
        activeFilters.push(`Recherche : "${query}"`);
    }

    if (category !== "all") {
        const label = CATEGORY_LABELS[category];
        if (label) {
            activeFilters.push(label);
        }
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
        const min = minPrice ?? 0;
        const max = maxPrice ?? 500;
        activeFilters.push(`Prix : ${min}€ – ${max}€`);
    }

    if (conditions.length > 0) {
        activeFilters.push(
            conditions
                .map((c) => CONDITION_LABELS[c] ?? c)
                .join(" • "),
        );
    }

    if (city) {
        activeFilters.push(`Ville : ${city}`);
    }

    if (negotiable === "yes") {
        activeFilters.push("Prix négociable");
    } else if (negotiable === "no") {
        activeFilters.push("Prix fixe");
    }

    // ----------------------------
    // 2) Requête Supabase
    // ----------------------------
    let supaQuery = supabase
        .from("listings")
        .select("id, title, price, city", { count: "exact" })
        .eq("status", "active");

    // Recherche texte
    if (query) {
        supaQuery = supaQuery.ilike("title", `%${query}%`);
    }

    // Catégorie (via category_id, basé sur les seeds)
    if (category !== "all") {
        const categoryId = CATEGORY_ID_BY_SLUG[category];
        if (categoryId) {
            supaQuery = supaQuery.eq("category_id", categoryId);
        }
    }

    // Prix (en centimes en base)
    if (minPrice !== undefined) {
        supaQuery = supaQuery.gte("price", minPrice * 100);
    }
    if (maxPrice !== undefined) {
        supaQuery = supaQuery.lte("price", maxPrice * 100);
    }

    // Conditions (in sur la colonne listings.condition)
    if (conditions.length > 0) {
        supaQuery = supaQuery.in("condition", conditions);
    }

    // Ville
    if (city) {
        // on peut faire un ilike pour être un peu tolérant
        supaQuery = supaQuery.ilike("city", `${city}%`);
    }

    // Négociable (listings.is_negotiable)
    if (negotiable === "yes") {
        supaQuery = supaQuery.eq("is_negotiable", true);
    } else if (negotiable === "no") {
        supaQuery = supaQuery.eq("is_negotiable", false);
    }

    const { data, error, count } = await supaQuery;
    const listings = (data ?? []) as ListingRow[];
    const total = count ?? listings.length;

    const title = query
        ? `Résultats pour « ${query} » (${total})`
        : `Toutes les annonces (${total})`;

    // ----------------------------
    // 3) Rendu
    // ----------------------------
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