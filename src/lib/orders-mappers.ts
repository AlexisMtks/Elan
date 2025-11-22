// src/lib/orders-mappers.ts

export type DbListingImageRow = {
    image_url: string;
    position: number | null;
};

export type DbListingRow = {
    id: string;
    listing_images?: DbListingImageRow[] | null;
};

export type DbListingRowMaybeArray = DbListingRow | DbListingRow[] | null;

export type DbOrderItemRow = {
    listing_id: string | null;
    title_snapshot: string | null;
    price_snapshot: number | null;
    quantity: number | null;
    listing?: DbListingRowMaybeArray;
};

export type DbSellerRow = {
    id: string;
    display_name: string | null;
    listings_count: number | null;
    avatar_url: string | null;
};

export type DbBuyerRow = {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
};

export type DbSellerRowMaybeArray = DbSellerRow | DbSellerRow[] | null;
export type DbBuyerRowMaybeArray = DbBuyerRow | DbBuyerRow[] | null;

export type DbOrderRow = {
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

export type UiOrderStatus = "placed" | "processing" | "shipped" | "delivered";

export interface UiOrder {
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

export function mapDbStatusToUiStatus(status: string | null): UiOrderStatus {
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

export function mapDbStatusToLabel(status: string | null): string {
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

export function formatDateFr(value: string | null): string {
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

export function mapOrderRowToUi(order: DbOrderRow): UiOrder {
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

    return {
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
}