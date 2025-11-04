import { PageTitle } from "@/components/misc/page-title";
import { SalesOverview } from "@/components/sales/sales-overview";
import { ProductCarousel } from "@/components/carousels/product-carousel";

const MOCK_SALES_HISTORY = [
    {
        id: "1",
        title: "Paire d’anneaux",
        price: 120,
        subtitle: "15/04/2024",
    },
    {
        id: "2",
        title: "Justaucorps rouge",
        price: 35,
        subtitle: "10/04/2024",
    },
    {
        id: "3",
        title: "Poutre d’équilibre",
        price: 290,
        subtitle: "02/04/2024",
    },
    {
        id: "4",
        title: "Cerceau de gymnastique",
        price: 20,
        subtitle: "25/05/2024",
    },
];

export default function MySalesPage() {
    return (
        <div className="space-y-10">
            <PageTitle
                title="Mes ventes"
                subtitle="Visualisez vos performances de vente et votre historique."
            />

            <SalesOverview />

            <ProductCarousel
                title="Historique de mes ventes"
                items={MOCK_SALES_HISTORY}
            />
        </div>
    );
}