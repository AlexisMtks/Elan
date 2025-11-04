import { ProductCard } from "@/components/cards/product-card";
import { PageTitle } from "@/components/misc/page-title";

const MOCK_PRODUCTS = [
    { id: "1", title: "Paire d’anneaux", price: 120 },
    { id: "2", title: "Justaucorps rouge", price: 35 },
    { id: "3", title: "Poutre d’équilibre", price: 290 },
    { id: "4", title: "Cerceau de gymnastique", price: 40 },
];

export default function HomePage() {
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
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                    {MOCK_PRODUCTS.map((p) => (
                        <ProductCard
                            key={p.id}
                            id={p.id}
                            title={p.title}
                            price={p.price}
                            variant="compact"
                        />
                    ))}
                </div>
            </section>
        </div>
    );
}