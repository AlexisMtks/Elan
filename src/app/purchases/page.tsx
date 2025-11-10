import { PageTitle } from "@/components/misc/page-title";
import { PurchasesOverview } from "@/components/purchases/purchases-overview";
import { MyPurchaseCard } from "@/components/cards/my-purchase-card";
import { BackToAccountButton } from "@/components/navigation/back-to-account-button";
import { supabase } from "@/lib/supabaseClient";

type PurchaseStatus = "in_progress" | "delivered" | "cancelled";

type OrderItemRow = {
    title_snapshot: string | null;
    price_snapshot: number | null;
};

type OrderRow = {
    id: number;
    created_at: string;
    status: string;
    total_amount: number | null;
    seller: { display_name: string } | null;
    order_items: OrderItemRow[] | null;
};

// ⚠️ TEMP : on simule l’utilisateur connecté = Marie
const CURRENT_USER_ID = "87dd7120-b634-4cbc-a67b-c134fb1a0c15";

function mapOrderStatusToPurchaseStatus(status: string): PurchaseStatus {
    if (status === "delivered") return "delivered";
    if (status === "cancelled") return "cancelled";
    return "in_progress"; // pending, paid, processing, shipped...
}

export default async function MyPurchasesPage() {
    const { data, error } = await supabase
        .from("orders")
        .select(
            `
      id,
      created_at,
      status,
      total_amount,
      seller:profiles!orders_seller_id_fkey(display_name),
      order_items (
        title_snapshot,
        price_snapshot
      )
    `
        )
        .eq("buyer_id", CURRENT_USER_ID)
        .order("created_at", { ascending: false });

    const orders = (data ?? []) as OrderRow[];

    // Stats pour l’overview
    const totalAmountCents = orders.reduce(
        (sum, order) => sum + (order.total_amount ?? 0),
        0
    );
    const ordersCount = orders.length;
    const averagePriceCents = ordersCount
        ? totalAmountCents / ordersCount
        : 0;
    const deliveredCount = orders.filter(
        (order) => order.status === "delivered"
    ).length;

    const stats = {
        totalAmount: totalAmountCents / 100,
        averagePrice: averagePriceCents / 100,
        orders: ordersCount,
        delivered: deliveredCount,
    };

    return (
        <div className="space-y-10">
            <BackToAccountButton />
            <PageTitle
                title="Mes achats"
                subtitle="Suivez vos dépenses, vos commandes et l’historique de vos achats."
            />

            <PurchasesOverview stats={stats} />

            <section className="space-y-4">
                <h2 className="text-lg font-semibold">Historique de mes achats</h2>

                {error && (
                    <p className="text-sm text-red-600">
                        Impossible de charger vos achats pour le moment.
                    </p>
                )}

                {orders.length === 0 && !error ? (
                    <p className="text-sm text-muted-foreground">
                        Vous n’avez pas encore effectué d’achat.
                    </p>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {orders.map((order) => {
                            const firstItem = order.order_items?.[0] ?? null;
                            const title =
                                firstItem?.title_snapshot ?? `Commande #${order.id}`;
                            const priceCents =
                                order.total_amount ??
                                firstItem?.price_snapshot ??
                                0;
                            const sellerName =
                                order.seller?.display_name ?? "Vendeur inconnu";
                            const date = new Date(order.created_at).toLocaleDateString(
                                "fr-FR"
                            );
                            const status = mapOrderStatusToPurchaseStatus(order.status);

                            return (
                                <MyPurchaseCard
                                    key={order.id}
                                    id={order.id.toString()}
                                    title={title}
                                    price={priceCents / 100}
                                    seller={sellerName}
                                    date={date}
                                    status={status}
                                />
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}