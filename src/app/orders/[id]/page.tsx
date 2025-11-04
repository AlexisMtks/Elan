import { OrderStatusBar } from "@/components/orders/order-status-bar";
import { OrderSellerInfo } from "@/components/orders/order-seller-info";
import { OrderTimeline } from "@/components/orders/order-timeline";
import { Card } from "@/components/ui/card";

interface OrderDetailPageProps {
    params: { id: string };
}

// Données mockées pour le MVP
const MOCK_ORDER = {
    id: "123456",
    productTitle: "Cheval d’arçons",
    originalPrice: 250,
    price: 250,
    statusLabel: "En cours de livraison",
    currentStatus: "shipped" as const,
    orderNumber: "123456",
    orderDate: "5 avril 2024",
    shippingMethod: "Colissimo",
    estimatedDelivery: "9 avril 2024",
    addressLine1: "32 rue des Acacias",
    addressLine2: "75000 Paris",
    seller: {
        id: "42",                 // 👈 ajout d’un id
        name: "Pierre Durand",
        listingsCount: 15,
    },
    events: [
        {
            id: "1",
            label: "Commande validée",
            date: "5 avril 2024",
            action: "track" as const,
        },
        {
            id: "2",
            label: "Article expédié",
            date: "7 avril 2024",
            action: "contact" as const,
        },
        {
            id: "3",
            label: "Livraison prévue",
            date: "9 avril 2024",
        },
    ],
};

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
    // Plus tard : fetch par params.id ; pour l’instant on utilise MOCK_ORDER
    const order = { ...MOCK_ORDER, id: params.id ?? MOCK_ORDER.id };

    return (
        <div className="space-y-10">
            {/* Résumé haut : image + titre + prix + statut */}
            <section className="space-y-6 rounded-2xl border p-6">
                <div className="grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)_minmax(0,0.9fr)]">
                    {/* Placeholder visuel du produit */}
                    <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-muted">
            <span className="text-xs text-muted-foreground">
              Image du produit
            </span>
                    </div>

                    {/* Titre + prix */}
                    <div className="space-y-2 self-center">
                        <h1 className="text-2xl font-semibold">{order.productTitle}</h1>
                        {order.originalPrice && order.originalPrice !== order.price && (
                            <p className="text-sm text-muted-foreground line-through">
                                {order.originalPrice} €
                            </p>
                        )}
                        <p className="text-2xl font-semibold">{order.price} €</p>
                    </div>

                    {/* Statut global */}
                    <div className="flex items-start justify-end">
                        <div className="rounded-full bg-muted px-4 py-2 text-sm font-medium">
                            {order.statusLabel}
                        </div>
                    </div>
                </div>

                {/* Barre de progression horizontale */}
                <OrderStatusBar currentStatus={order.currentStatus} />
            </section>

             Informations de commande + vendeur
            <section>
                <Card className="rounded-2xl border p-6">
                    <div className="grid gap-8 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                        <dl className="space-y-2 text-sm">
                            <OrderDetailRow
                                label="Numéro de commande"
                                value={order.orderNumber}
                            />
                            <OrderDetailRow
                                label="Date de commande"
                                value={order.orderDate}
                            />
                            <OrderDetailRow
                                label="Mode de livraison"
                                value={order.shippingMethod}
                            />
                            <OrderDetailRow
                                label="Estimation de livraison"
                                value={order.estimatedDelivery}
                            />
                            <OrderDetailRow
                                label="Adresse"
                                value={`${order.addressLine1}\n${order.addressLine2}`}
                                multiline
                            />
                        </dl>

                        <OrderSellerInfo
                            id={order.seller.id}
                            name={order.seller.name}
                            listingsCount={order.seller.listingsCount}
                        />
                    </div>
                </Card>
            </section>

            {/* Historique de commande */}
            <OrderTimeline events={order.events} />
        </div>
    );
}

function OrderDetailRow({
                            label,
                            value,
                            multiline,
                        }: {
    label: string;
    value: string;
    multiline?: boolean;
}) {
    return (
        <div className="flex items-start justify-between gap-6 border-b pb-2 last:border-b-0">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="text-sm font-medium whitespace-pre-line text-right">
                {value}
            </dd>
        </div>
    );
}