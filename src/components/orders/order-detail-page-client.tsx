"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useRequireAuth } from "@/hooks/use-require-auth";

import { OrderStatusBar } from "@/components/orders/order-status-bar";
import { OrderSellerInfo } from "@/components/orders/order-seller-info";
import { OrderBuyerInfo } from "@/components/orders/order-buyer-info";
// import { OrderTimeline } from "@/components/orders/order-timeline";
import { DetailRow } from "@/components/misc/detail-row";
import { Card } from "@/components/ui/card";

type DbListingImageRow = {
    image_url: string;
    position: number | null;
};

type DbListingRow = {
    id: string;
    listing_images?: DbListingImageRow[] | null;
};

type DbOrderItemRow = {
    listing_id: string | null;
    title_snapshot: string | null;
    price_snapshot: number | null;
    quantity: number | null;
    listing?: DbListingRow | null;
};

type DbSellerRow = {
    id: string;
    display_name: string | null;
    listings_count: number | null;
} | null;

type DbBuyerRow = {
    id: string;
    display_name: string | null;
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
    seller: DbSellerRow;
    buyer: DbBuyerRow;
    order_items: DbOrderItemRow[] | null;
};

type UiOrderStatus = "placed" | "processing" | "shipped" | "delivered";

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
    buyer: {
        id: string;
        name: string;
        completedOrdersCount: number;
    };
    imageUrl?: string | null;
}

interface OrderDetailPageClientProps {
    orderId: string;
}

function mapDbStatusToUiStatus(status: string | null): UiOrderStatus {
    switch (status) {
        case "processing":
            return "processing";
        case "shipped":
            return "shipped";
        case "delivered":
            return "delivered";
        default:
            // "pending", "cancelled", null, etc.
            return "placed";
    }
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

    // 💰 Prix : total de la commande ou snapshot de la première ligne
    const priceCents = order.total_amount ?? firstItem?.price_snapshot ?? 0;

    // 👤 Vendeur & acheteur
    const sellerRow = order.seller ?? null;
    const buyerRow = order.buyer ?? null;

    // 📦 Adresse
    const addressLine1 =
        order.shipping_address_line1 ?? "Adresse de livraison non renseignée";

    const addressParts: string[] = [];
    if (order.shipping_postcode) addressParts.push(order.shipping_postcode);
    if (order.shipping_city) addressParts.push(order.shipping_city);
    if (order.shipping_country) addressParts.push(order.shipping_country);
    const addressLine2 =
        addressParts.join(" ") || order.shipping_address_line2 || "";

    // 🖼 Image principale
    let imageUrl: string | null = null;
    const listingImages = firstItem?.listing?.listing_images;

    if (Array.isArray(listingImages) && listingImages.length > 0) {
        const sorted = [...listingImages].sort(
            (a, b) => (a.position ?? 0) - (b.position ?? 0),
        );
        imageUrl = sorted[0]?.image_url ?? null;
    }

    const uiOrder: UiOrder = {
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
        buyer: {
            id: buyerRow?.id ?? "",
            name: buyerRow?.display_name ?? "Acheteur inconnu",
            // valeur de base, raffinée côté client dans OrderBuyerInfo
            completedOrdersCount: 0,
        },
        imageUrl,
    };

    return uiOrder;
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
    buyer:profiles!orders_buyer_id_fkey(
      id,
      display_name
    ),
    order_items (
      listing_id,
      title_snapshot,
      price_snapshot,
      quantity,
      listing:listings!order_items_listing_id_fkey (
        id,
        listing_images (
          image_url,
          position
        )
      )
    )
  `,
                )
                .eq("id", orderId)
                .maybeSingle();

            if (error || !data) {
                console.error("Erreur chargement commande :", error);
                setError("Impossible de charger cette commande.");
                setOrder(null);
            } else {
                const uiOrder = mapOrderRowToUi(data as DbOrderRow);
                setOrder(uiOrder);
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

    const isBuyerView = user?.id === order.buyer.id;
    const isSellerView = user?.id === order.seller.id;

    return (
        <div className="space-y-10">
            {/* Résumé haut : image + titre + prix + statut */}
            <section className="space-y-6 rounded-2xl border p-6">
                <div className="grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)_minmax(0,0.9fr)]">
                    {/* Visuel du produit */}
                    <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-muted overflow-hidden">
                        {order.imageUrl ? (
                            <img
                                src={order.imageUrl}
                                alt={order.productTitle}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span className="text-xs text-muted-foreground">
                Image du produit
              </span>
                        )}
                    </div>

                    {/* Titre + prix */}
                    <div className="space-y-2 self-center">
                        <h1 className="text-2xl font-semibold">
                            {order.productTitle}
                        </h1>
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

            {/* Informations de commande + profil (vendeur/acheteur) */}
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

                        {/* Côté acheteur → on montre le vendeur, côté vendeur → on montre l'acheteur */}
                        {isBuyerView && (
                            <OrderSellerInfo
                                id={order.seller.id}
                                name={order.seller.name}
                                listingsCount={order.seller.listingsCount}
                            />
                        )}

                        {isSellerView && (
                            <OrderBuyerInfo
                                id={order.buyer.id}
                                name={order.buyer.name}
                                completedOrdersCount={order.buyer.completedOrdersCount}
                            />
                        )}

                        {/* Fallback (cas étrange : ni buyer ni seller) */}
                        {!isBuyerView && !isSellerView && (
                            <OrderSellerInfo
                                id={order.seller.id}
                                name={order.seller.name}
                                listingsCount={order.seller.listingsCount}
                            />
                        )}
                    </div>
                </Card>
            </section>

            {/* Historique de commande (à brancher plus tard) */}
            {/* <OrderTimeline events={order.events} /> */}
        </div>
    );
}