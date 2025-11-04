// src/app/research/page.tsx
import { FilterPanel } from "@/components/filters/filter-panel";
import { FilterChips } from "@/components/filters/filter-chips";
import { ProductCard } from "@/components/cards/product-card";
import { PageTitle } from "@/components/misc/page-title";

const MOCK_RESULTS = Array.from({ length: 8 }).map((_, i) => ({
    id: `${i + 1}`,
    title: "Tapis de gymnastique",
    price: 80 + i * 10,
    location: i % 2 === 0 ? "Paris" : "À 3 km",
}));

export default function SearchPage() {
    const activeFilters = ["Tapis", "Bon état", "Moins de 100 €"];

    return (
        <div className="flex gap-8">
            <FilterPanel />

            <div className="flex-1 space-y-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3">
                        <PageTitle title="36 résultats" />
                        <FilterChips filters={activeFilters} />
                    </div>

                    <div className="text-sm text-muted-foreground">
                        Trier par : <span className="font-medium">Prix croissant</span>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {MOCK_RESULTS.map((p) => (
                        <ProductCard
                            key={p.id}
                            id={p.id}
                            title={p.title}
                            price={p.price}
                            location={p.location}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
