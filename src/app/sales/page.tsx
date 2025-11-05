import { PageTitle } from "@/components/misc/page-title";
import { SalesOverview } from "@/components/sales/sales-overview";
import { BackToAccountButton } from "@/components/navigation/back-to-account-button";
import { MySaleCard } from "@/components/cards/my-sale-card";

const MOCK_SALES = [
    {
        id: "1",
        title: "Paire d’anneaux",
        price: 120,
        buyer: "Club Gym Paris",
        date: "15/04/2024",
        status: "delivered" as const,
    },
    {
        id: "2",
        title: "Justaucorps rouge",
        price: 35,
        buyer: "Sophie Martin",
        date: "10/04/2024",
        status: "delivered" as const,
    },
    {
        id: "3",
        title: "Poutre d’équilibre",
        price: 290,
        buyer: "Club Gym Lyon",
        date: "02/04/2024",
        status: "in_progress" as const,
    },
    {
        id: "4",
        title: "Cerceau de gymnastique",
        price: 20,
        buyer: "Boutique Gym Nantes",
        date: "25/05/2024",
        status: "cancelled" as const,
    },
];

const MOCK_SALES_STATS = (() => {
    if (MOCK_SALES.length === 0) {
        return {
            totalGain: 0,
            averageGainPerSale: 0,
            totalPriceDiff: 0,
            averagePriceDiffPercent: 0,
        };
    }

    const totalGain = MOCK_SALES.reduce((sum, sale) => sum + sale.price, 0);
    const salesCount = MOCK_SALES.length;
    const averageGainPerSale = totalGain / salesCount;

    // Pour l’instant, les écarts de prix ne sont pas calculés
    const totalPriceDiff = 0;
    const averagePriceDiffPercent = 0;

    return {
        totalGain,
        averageGainPerSale,
        totalPriceDiff,
        averagePriceDiffPercent,
    };
})();

export default function MySalesPage() {
    return (
        <div className="space-y-10">
            <BackToAccountButton />
            <PageTitle
                title="Mes ventes"
                subtitle="Visualisez vos performances de vente et l’historique de vos commandes."
            />

            <SalesOverview stats={MOCK_SALES_STATS} />

            <section className="space-y-4">
                <h2 className="text-lg font-semibold">Historique de mes ventes</h2>

                {MOCK_SALES.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Vous n’avez pas encore réalisé de vente.
                    </p>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {MOCK_SALES.map((sale) => (
                            <MySaleCard
                                key={sale.id}
                                id={sale.id}
                                title={sale.title}
                                price={sale.price}
                                buyer={sale.buyer}
                                date={sale.date}
                                status={sale.status}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}