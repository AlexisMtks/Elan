// src/app/research/page.tsx
import { FilterPanel } from "@/components/filters/filter-panel";
import { FilterChips } from "@/components/filters/filter-chips";
import { ProductCard } from "@/components/cards/product-card";
import { PageTitle } from "@/components/misc/page-title";
import { SearchListingsGrid } from "@/components/listing/search-listings-grid";
import { supabase } from "@/lib/supabaseClient";

type CategoryValue = "all" | "agres" | "tapis" | "accessoires";
type ConditionValue = "new" | "like_new" | "very_good" | "good" | "used";
type NegotiableValue = "all" | "yes" | "no";

interface SearchPageSearchParams {
    q?: string;
    category?: string;      // ⚠️ string brute (plus CategoryValue ici)
    minPrice?: string;
    maxPrice?: string;
    city?: string;
    conditions?: string;    // CSV: "new,good,used"
    negotiable?: string;    // ⚠️ string brute (plus NegotiableValue ici)
}

interface SearchPageProps {
    searchParams: Promise<SearchPageSearchParams>;
}

type ListingRow = {
    id: string;
    title: string;
    price: number; // centimes
    city: string | null;
    sellerId: string;
    imageUrl?: string;
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

    // ----------------------------
    // 0) Normalisation des paramètres
    // ----------------------------
    const query =
        typeof resolvedParams.q === "string" ? resolvedParams.q.trim() : "";

    // category: string brute -> CategoryValue
    const rawCategory =
        typeof resolvedParams.category === "string"
            ? resolvedParams.category.trim()
            : "";

    const category: CategoryValue =
        rawCategory && rawCategory in CATEGORY_ID_BY_SLUG
            ? (rawCategory as Exclude<CategoryValue, "all">)
            : "all";

    const minPrice = resolvedParams.minPrice
        ? Number.parseInt(resolvedParams.minPrice, 10)
        : undefined;

    const maxPrice = resolvedParams.maxPrice
        ? Number.parseInt(resolvedParams.maxPrice, 10)
        : undefined;

    const city =
        typeof resolvedParams.city === "string" ? resolvedParams.city.trim() : "";

    // negotiable: string brute -> NegotiableValue
    const rawNegotiable =
        typeof resolvedParams.negotiable === "string"
            ? resolvedParams.negotiable.trim()
            : "";

    const negotiable: NegotiableValue =
        rawNegotiable === "yes" || rawNegotiable === "no"
            ? (rawNegotiable as NegotiableValue)
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
            conditions.map((c) => CONDITION_LABELS[c] ?? c).join(" • "),
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
    // ----------------------------
// 2) Requête Supabase
// ----------------------------
    let supaQuery = supabase
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
            { count: "exact" },
        )
        .eq("status", "active");

// Recherche texte
    if (query) {
        supaQuery = supaQuery.ilike("title", `%${query}%`);
    }

// Catégorie (via category_id, basé sur les seeds)
    if (category !== "all") {
        const categoryId = CATEGORY_ID_BY_SLUG[category as Exclude<CategoryValue, "all">];
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
        supaQuery = supaQuery.ilike("city", `${city}%`);
    }

// Négociable (listings.is_negotiable)
    if (negotiable === "yes") {
        supaQuery = supaQuery.eq("is_negotiable", true);
    } else if (negotiable === "no") {
        supaQuery = supaQuery.eq("is_negotiable", false);
    }

// On récupère les données en ne gardant qu'une image par annonce (la première par position)
    const { data, error, count } = await supaQuery
        .order("position", { foreignTable: "listing_images", ascending: true })
        .limit(1, { foreignTable: "listing_images" });

    const listings: ListingRow[] = (data ?? []).map((row: any) => {
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

    const total = count ?? listings.length;

    const title = query
        ? `Résultats pour « ${query} »`
        : "Toutes les annonces";

    // ----------------------------
    // 3) Rendu
    // ----------------------------
    return (
        <div className="flex gap-8">
            <FilterPanel />

            <div className="flex-1 space-y-2">
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

                <SearchListingsGrid listings={listings} hasError={!!error} />
            </div>
        </div>
    );
}
