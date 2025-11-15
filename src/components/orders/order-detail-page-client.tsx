"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useRequireAuth } from "@/hooks/use-require-auth";

import { OrderStatusBar } from "@/components/orders/order-status-bar";
import { OrderSellerInfo } from "@/components/orders/order-seller-info";
// import { OrderTimeline } from "@/components/orders/order-timeline";
import { DetailRow } from "@/components/misc/detail-row";
import { Card } from "@/components/ui/card";

type DbOrderItemRow = {
    title_snapshot: string | null;
    price_snapshot: number | null;
    quantity: number | null;
};

type DbSellerRow = {
    id: string;
    display_name: string | null;
    listings_count: number | null;
} | null;

type DbOrderRow = {
    id: string;
    created_at: string;
    status: string;
    total_amount: number | null;
    shipping_method: string | null;
    shipping_address_line1: string | null;
    shipping_address_line2: string | null;
    shipping_city: string | null;
    shipping_postcode: string | null;
    shipping_country: string | null;
    estimated_delivery_date: string | null;
    seller: DbSellerRow[] | null;
    order_items: DbOrderItemRow[] | null;
};

type UiOrderStatus = "placed" | "shipped" | "delivered";

interface UiOrder {
    id: string;
    productTitle: string;
    originalPrice?: number;
    price: number;
    statusLabel: string;
    currentStatus: UiOrderStatus;
    orderNumber: string;
    orderDate: string;
    shippingMethod: string;
    estimatedDelivery: string;
    addressLine1: string;
    addressLine2: string;
    seller: {
        id: string;
        name: string;
        listingsCount: number;
    };
}

interface OrderDetailPageClientProps {
    orderId: string;
}

function mapDbStatusToUiStatus(status: string | null): UiOrderStatus {
    if (status === "shipped") return "shipped";
    if (status === "delivered") return "delivered";
    return "placed";
}

function mapDbStatusToLabel(status: string | null): string {
    switch (status) {
        case "pending":
        case "processing":
            return "En cours de préparation";
        case "shipped":
            return "En cours de livraison";
        case "delivered":
            return "Commande livrée";
        case "cancelled":
            return "Commande annulée";
        default:
            return "Statut inconnu";
    }
}

function formatDateFr(value: string | null): string {
    if (!value) return "Date inconnue";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

function mapOrderRowToUi(order: DbOrderRow): UiOrder {
    const firstItem = order.order_items?.[0] ?? null;

    const priceCents =
        order.total_amount ?? firstItem?.price_snapshot ?? 0;

    const sellerRow = order.seller?.[0] ?? null;

    const addressLine1 =
        order.shipping_address_line1 ?? "Adresse de livraison non renseignée";

    const addressParts: string[] = [];
    if (order.shipping_postcode) addressParts.push(order.shipping_postcode);
    if (order.shipping_city) addressParts.push(order.shipping_city);
    if (order.shipping_country) addressParts.push(order.shipping_country);
    const addressLine2 =
        addressParts.join(" ") || order.shipping_address_line2 || "";

    return {
        id: order.id,
        productTitle:
            firstItem?.title_snapshot ?? `Commande #${order.id}`,
        price: priceCents / 100,
        statusLabel: mapDbStatusToLabel(order.status),
        currentStatus: mapDbStatusToUiStatus(order.status),
        orderNumber: order.id,
        orderDate: formatDateFr(order.created_at),
        shippingMethod: order.shipping_method ?? "Non renseigné",
        estimatedDelivery: formatDateFr(order.estimated_delivery_date),
        addressLine1,
        addressLine2,
        seller: {
            id: sellerRow?.id ?? "",
            name: sellerRow?.display_name ?? "Vendeur inconnu",
            listingsCount: sellerRow?.listings_count ?? 0,
        },
    };
}

export default function OrderDetailPageClient({
                                                  orderId,
                                              }: OrderDetailPageClientProps) {
    const { user, checking } = useRequireAuth();
    const router = useRouter();

    const [order, setOrder] = useState<UiOrder | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (checking) return;
        if (!user) return; // useRequireAuth s'occupe de la redirection

        const load = async () => {
            setLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from("orders")
                .select(
                    `
          id,
          created_at,
          status,
          total_amount,
          shipping_method,
          shipping_address_line1,
          shipping_address_line2,
          shipping_city,
          shipping_postcode,
          shipping_country,
          estimated_delivery_date,
          seller:profiles!orders_seller_id_fkey(
            id,
            display_name,
            listings_count
          ),
          order_items (
            title_snapshot,
            price_snapshot,
            quantity
          )
        `
                )
                .eq("id", orderId)
                .maybeSingle();

            if (error || !data) {
                console.error("Erreur chargement commande :", error);
                setError("Impossible de charger cette commande.");
                setOrder(null);
            } else {
                setOrder(mapOrderRowToUi(data as DbOrderRow));
            }

            setLoading(false);
        };

        void load();
    }, [checking, user, orderId]);

    if (checking || loading) {
        return (
            <div className="flex min-h-[200px] items-center justify-center">
                <p className="text-sm text-muted-foreground">
                    Chargement de la commande…
                </p>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="space-y-4">
                <p className="text-sm text-destructive">
                    {error ?? "Commande introuvable."}
                </p>
                <button
                    type="button"
                    className="text-xs underline"
                    onClick={() => router.push("/purchases")}
                >
                    Retour à mes achats
                </button>
            </div>
        );
    }

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
                        {order.originalPrice &&
                            order.originalPrice !== order.price && (
                                <p className="text-sm text-muted-foreground line-through">
                                    {order.originalPrice} €
                                </p>
                            )}
                        <p className="text-2xl font-semibold">{order.price} €</p>
                    </div>

                    {/* Statut global */}
                    <div className="space-y-4 self-center">
                        <p className="text-sm font-medium text-muted-foreground">
                            {order.statusLabel}
                        </p>
                        <OrderStatusBar currentStatus={order.currentStatus} />
                    </div>
                </div>
            </section>

            {/* Informations de commande + vendeur */}
            <section>
                <Card className="rounded-2xl border p-6">
                    <div className="grid gap-8 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                        <dl className="space-y-2 text-sm">
                            <DetailRow
                                label="Numéro de commande"
                                value={order.orderNumber}
                                size="sm"
                                align="right"
                                bordered
                            />
                            <DetailRow
                                label="Date de commande"
                                value={order.orderDate}
                                size="sm"
                                align="right"
                                bordered
                            />
                            <DetailRow
                                label="Mode de livraison"
                                value={order.shippingMethod}
                                size="sm"
                                align="right"
                                bordered
                            />
                            <DetailRow
                                label="Estimation de livraison"
                                value={order.estimatedDelivery}
                                size="sm"
                                align="right"
                                bordered
                            />
                            <DetailRow
                                label="Adresse"
                                value={`${order.addressLine1}\n${order.addressLine2}`}
                                size="sm"
                                align="right"
                                bordered
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

            {/* Historique de commande (à brancher plus tard) */}
            {/* <OrderTimeline events={order.events} /> */}
        </div>
    );
}