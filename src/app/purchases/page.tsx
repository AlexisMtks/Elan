import { PageTitle } from "@/components/misc/page-title";
import { PurchasesOverview } from "@/components/purchases/purchases-overview";
import { MyPurchaseCard } from "@/components/cards/my-purchase-card";
import { BackToAccountButton } from "@/components/navigation/back-to-account-button";

const MOCK_PURCHASES = [
    {
        id: "1",
        title: "Paire d’anneaux",
        price: 120,
        seller: "Club Gym Paris",
        date: "15/04/2024",
        status: "delivered" as const,
    },
    {
        id: "2",
        title: "Justaucorps rouge",
        price: 35,
        seller: "Jeanne Dupont",
        date: "10/04/2024",
        status: "delivered" as const,
    },
    {
        id: "3",
        title: "Poutre d’équilibre",
        price: 290,
        seller: "Club Gym Lyon",
        date: "02/04/2024",
        status: "delivered" as const,
    },
    {
        id: "4",
        title: "Cerceau de gymnastique",
        price: 20,
        seller: "Boutique Gym Nantes",
        date: "25/05/2024",
        status: "cancelled" as const,
    },
];

const MOCK_PURCHASE_STATS = (() => {
    if (MOCK_PURCHASES.length === 0) {
        return {
            totalAmount: 0,
            averagePrice: 0,
            orders: 0,
            delivered: 0,
        };
    }

    const totalAmount = MOCK_PURCHASES.reduce(
        (sum, purchase) => sum + purchase.price,
        0
    );

    const orders = MOCK_PURCHASES.length;
    const averagePrice = totalAmount / orders;
    const delivered = MOCK_PURCHASES.filter(
        (purchase) => purchase.status === "delivered"
    ).length;

    return {
        totalAmount,
        averagePrice,
        orders,
        delivered,
    };
})();

export default function MyPurchasesPage() {
    return (
        <div className="space-y-10">
            <BackToAccountButton />
            <PageTitle
                title="Mes achats"
                subtitle="Suivez vos dépenses, vos commandes et l’historique de vos achats."
            />

            {/* 👇 On passe bien les stats à l’overview */}
            <PurchasesOverview stats={MOCK_PURCHASE_STATS} />

            <section className="space-y-4">
                <h2 className="text-lg font-semibold">Historique de mes achats</h2>

                {MOCK_PURCHASES.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Vous n’avez pas encore effectué d’achat.
                    </p>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {MOCK_PURCHASES.map((purchase) => (
                            <MyPurchaseCard
                                key={purchase.id}
                                id={purchase.id}
                                title={purchase.title}
                                price={purchase.price}
                                seller={purchase.seller}
                                date={purchase.date}
                                status={purchase.status}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}