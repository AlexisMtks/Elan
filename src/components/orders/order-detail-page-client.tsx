"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useRequireAuth } from "@/hooks/use-require-auth";

import { OrderStatusBar } from "@/components/orders/order-status-bar";
import { OrderSellerInfo } from "@/components/orders/order-seller-info";
import { OrderBuyerInfo } from "@/components/orders/order-buyer-info";
import { DetailRow } from "@/components/misc/detail-row";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type DbListingImageRow = {
    image_url: string;
    position: number | null;
};

type DbListingRow = {
    id: string;
    listing_images?: DbListingImageRow[] | null;
};

type DbListingRowMaybeArray = DbListingRow | DbListingRow[] | null;

type DbOrderItemRow = {
    listing_id: string | null;
    title_snapshot: string | null;
    price_snapshot: number | null;
    quantity: number | null;
    listing?: DbListingRowMaybeArray;
};

type DbSellerRow = {
    id: string;
    display_name: string | null;
    listings_count: number | null;
    avatar_url: string | null;
};

type DbBuyerRow = {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
};

type DbSellerRowMaybeArray = DbSellerRow | DbSellerRow[] | null;
type DbBuyerRowMaybeArray = DbBuyerRow | DbBuyerRow[] | null;

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
    seller: DbSellerRowMaybeArray;
    buyer: DbBuyerRowMaybeArray;
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
        avatarUrl?: string | null;
    };
    buyer: {
        id: string;
        name: string;
        completedOrdersCount: number;
        avatarUrl?: string | null;
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

function normalizeOne<T>(value: T | T[] | null): T | null {
    if (!value) return null;
    return Array.isArray(value) ? value[0] ?? null : value;
}

function mapOrderRowToUi(order: DbOrderRow): UiOrder {
    const firstItem = order.order_items?.[0] ?? null;

    // 💰 Prix : total de la commande ou snapshot de la première ligne
    const priceCents = order.total_amount ?? firstItem?.price_snapshot ?? 0;

    // 👤 Vendeur & acheteur (objet ou tableau → normalisation)
    const sellerRow = normalizeOne(order.seller);
    const buyerRow = normalizeOne(order.buyer);

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
    const normalizedListing = normalizeOne(firstItem?.listing ?? null);
    const listingImages = normalizedListing?.listing_images ?? null;

    if (Array.isArray(listingImages) && listingImages.length > 0) {
        const sorted = [...listingImages].sort(
            (a, b) => (a.position ?? 0) - (b.position ?? 0),
        );
        imageUrl = sorted[0]?.image_url ?? null;
    }

    const uiOrder: UiOrder = {
        id: order.id,
        productTitle: firstItem?.title_snapshot ?? `Commande #${order.id}`,
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
            avatarUrl: sellerRow?.avatar_url ?? null,
        },
        buyer: {
            id: buyerRow?.id ?? "",
            name: buyerRow?.display_name ?? "Acheteur inconnu",
            // valeur de base, raffinée côté client dans OrderBuyerInfo
            completedOrdersCount: 0,
            avatarUrl: buyerRow?.avatar_url ?? null,
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

    // ⭐ Avis du vendeur sur l'acheteur
    const [buyerRating, setBuyerRating] = useState<number>(0);
    const [buyerComment, setBuyerComment] = useState<string>("");
    const [buyerReviewId, setBuyerReviewId] = useState<string | null>(null);
    const [buyerSubmitting, setBuyerSubmitting] = useState(false);

    // ⭐ Avis de l'acheteur sur le vendeur
    const [sellerRating, setSellerRating] = useState<number>(0);
    const [sellerComment, setSellerComment] = useState<string>("");
    const [sellerReviewId, setSellerReviewId] = useState<string | null>(null);
    const [sellerSubmitting, setSellerSubmitting] = useState(false);

    // 1️⃣ Charger la commande
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
            listings_count,
            avatar_url
          ),
          buyer:profiles!orders_buyer_id_fkey(
            id,
            display_name,
            avatar_url
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

    // 2️⃣ Avis du vendeur sur l'acheteur
    useEffect(() => {
        if (!user || !order) return;
        // on s'assure qu'on est bien le vendeur
        if (user.id !== order.seller.id) return;

        const fetchExistingReview = async () => {
            const { data, error } = await supabase
                .from("reviews")
                .select("id, rating, comment")
                .eq("reviewer_id", user.id)
                .eq("reviewed_id", order.buyer.id)
                .eq("order_id", order.id)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();

            if (!error && data) {
                setBuyerRating(data.rating ?? 0);
                setBuyerReviewId(data.id);
                setBuyerComment(data.comment ?? "");
            }
        };

        void fetchExistingReview();
    }, [user, order]);

    // 3️⃣ Avis de l'acheteur sur le vendeur
    useEffect(() => {
        if (!user || !order) return;
        // on s'assure qu'on est bien l'acheteur
        if (user.id !== order.buyer.id) return;

        const fetchExistingReview = async () => {
            const { data, error } = await supabase
                .from("reviews")
                .select("id, rating, comment")
                .eq("reviewer_id", user.id)
                .eq("reviewed_id", order.seller.id)
                .eq("order_id", order.id)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();

            if (!error && data) {
                setSellerRating(data.rating ?? 0);
                setSellerReviewId(data.id);
                setSellerComment(data.comment ?? "");
            }
        };

        void fetchExistingReview();
    }, [user, order]);

    // 4️⃣ Returns conditionnels
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

    const isBuyerView = !!(user && order && user.id === order.buyer.id);
    const isSellerView = !!(user && order && user.id === order.seller.id);

    // ---------- Vendeur → Acheteur ----------
    const upsertBuyerReview = async (newRating: number, newComment: string) => {
        if (!user || !order || !isSellerView) return;
        if (newRating < 1 || newRating > 5) return;

        setBuyerSubmitting(true);

        try {
            if (buyerReviewId) {
                const { error } = await supabase
                    .from("reviews")
                    .update({
                        rating: newRating,
                        comment: newComment,
                        reviewer_avatar_url: order.seller.avatarUrl ?? null,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", buyerReviewId);

                if (error) {
                    console.error("Erreur update avis acheteur :", error);
                }
            } else {
                const { data, error } = await supabase
                    .from("reviews")
                    .insert({
                        reviewer_id: user.id, // vendeur
                        reviewed_id: order.buyer.id, // acheteur
                        order_id: order.id,
                        rating: newRating,
                        comment: newComment,
                        reviewer_avatar_url: order.seller.avatarUrl ?? null,
                    })
                    .select("id")
                    .single();

                if (error) {
                    console.error("Erreur insert avis acheteur :", error);
                } else if (data?.id) {
                    setBuyerReviewId(data.id);
                }
            }
        } finally {
            setBuyerSubmitting(false);
        }
    };

    const handleBuyerRatingChange = (newRating: number) => {
        setBuyerRating(newRating);
        void upsertBuyerReview(newRating, buyerComment);
    };

    const handleBuyerSaveComment = async () => {
        if (!buyerRating) return;
        await upsertBuyerReview(buyerRating, buyerComment);
    };

    const buyerCommentId = `order-${order.id}-buyer-comment`;

    // ---------- Acheteur → Vendeur ----------
    const upsertSellerReview = async (newRating: number, newComment: string) => {
        if (!user || !order || !isBuyerView) return;
        if (newRating < 1 || newRating > 5) return;

        setSellerSubmitting(true);

        try {
            if (sellerReviewId) {
                const { error } = await supabase
                    .from("reviews")
                    .update({
                        rating: newRating,
                        comment: newComment,
                        reviewer_avatar_url: order.buyer.avatarUrl ?? null,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", sellerReviewId);

                if (error) {
                    console.error("Erreur update avis vendeur :", error);
                }
            } else {
                const { data, error } = await supabase
                    .from("reviews")
                    .insert({
                        reviewer_id: user.id, // acheteur
                        reviewed_id: order.seller.id, // vendeur
                        order_id: order.id,
                        rating: newRating,
                        comment: newComment,
                        reviewer_avatar_url: order.buyer.avatarUrl ?? null,
                    })
                    .select("id")
                    .single();

                if (error) {
                    console.error("Erreur insert avis vendeur :", error);
                } else if (data?.id) {
                    setSellerReviewId(data.id);
                }
            }
        } finally {
            setSellerSubmitting(false);
        }
    };

    const handleSellerRatingChange = (newRating: number) => {
        setSellerRating(newRating);
        void upsertSellerReview(newRating, sellerComment);
    };

    const handleSellerSaveComment = async () => {
        if (!sellerRating) return;
        await upsertSellerReview(sellerRating, sellerComment);
    };

    const sellerCommentId = `order-${order.id}-seller-comment`;

    return (
        <div className="space-y-10">
            {/* Résumé haut : image + titre + prix + statut */}
            <section className="space-y-6 rounded-2xl border p-6">
                <div className="grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)_minmax(0,0.9fr)]">
                    {/* Visuel du produit */}
                    <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl bg-muted">
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
                        <h1 className="text-2xl font-semibold">{order.productTitle}</h1>
                        {order.originalPrice && order.originalPrice !== order.price && (
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

                        {/* Côté acheteur → on montre le vendeur */}
                        {isBuyerView && (
                            <OrderSellerInfo
                                id={order.seller.id}
                                name={order.seller.name}
                                listingsCount={order.seller.listingsCount}
                                avatarUrl={order.seller.avatarUrl}
                                rating={sellerRating}
                                submitting={sellerSubmitting}
                                onChangeRating={handleSellerRatingChange}
                            />
                        )}

                        {/* Côté vendeur → on montre l'acheteur */}
                        {isSellerView && (
                            <OrderBuyerInfo
                                id={order.buyer.id}
                                name={order.buyer.name}
                                completedOrdersCount={order.buyer.completedOrdersCount}
                                avatarUrl={order.buyer.avatarUrl}
                                rating={buyerRating}
                                submitting={buyerSubmitting}
                                onChangeRating={handleBuyerRatingChange}
                            />
                        )}

                        {/* Fallback (ni buyer ni seller : cas anormal, on montre le vendeur readonly) */}
                        {!isBuyerView && !isSellerView && (
                            <OrderSellerInfo
                                id={order.seller.id}
                                name={order.seller.name}
                                listingsCount={order.seller.listingsCount}
                                avatarUrl={order.seller.avatarUrl}
                                rating={0}
                                submitting
                                onChangeRating={() => {}}
                            />
                        )}
                    </div>

                    {/* Bloc commentaire pleine largeur côté vendeur (avis sur l'acheteur) */}
                    {isSellerView && (
                        <div className="mt-6 space-y-2">
                            <label
                                htmlFor={buyerCommentId}
                                className="text-xs font-medium text-muted-foreground"
                            >
                                Commentaire sur l&apos;acheteur (optionnel)
                            </label>

                            <Textarea
                                id={buyerCommentId}
                                value={buyerComment}
                                onChange={(e) => setBuyerComment(e.target.value)}
                                placeholder="Ajouter un commentaire sur cette vente"
                                rows={3}
                                className="w-full text-xs"
                            />

                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={handleBuyerSaveComment}
                                    disabled={buyerSubmitting || buyerRating === 0}
                                    className="px-5"
                                >
                                    Enregistrer le commentaire
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Bloc commentaire pleine largeur côté acheteur (avis sur le vendeur) */}
                    {isBuyerView && (
                        <div className="mt-6 space-y-2">
                            <label
                                htmlFor={sellerCommentId}
                                className="text-xs font-medium text-muted-foreground"
                            >
                                Commentaire sur le vendeur (optionnel)
                            </label>

                            <Textarea
                                id={sellerCommentId}
                                value={sellerComment}
                                onChange={(e) => setSellerComment(e.target.value)}
                                placeholder="Ajouter un commentaire sur cette vente"
                                rows={3}
                                className="w-full text-xs"
                            />

                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={handleSellerSaveComment}
                                    disabled={sellerSubmitting || sellerRating === 0}
                                    className="px-5"
                                >
                                    Enregistrer le commentaire
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            </section>

            {/* Historique de commande (à brancher plus tard) */}
            {/* <OrderTimeline events={order.events} /> */}
        </div>
    );
}