"use client";

import { OrderCard, OrderStatus } from "@/components/cards/order-card";

export type PurchaseStatus = OrderStatus;

interface MyPurchaseCardProps {
    id: string;
    title: string;
    price: number;
    location?: string;
    seller: string;
    date: string;
    status: PurchaseStatus;
    imageUrl?: string; // ✅ on ajoute l'image optionnelle
}

export function MyPurchaseCard({
                                   id,
                                   title,
                                   price,
                                   location,
                                   seller,
                                   date,
                                   status,
                                   imageUrl,
                               }: MyPurchaseCardProps) {
    return (
        <OrderCard
            id={id}
            title={title}
            price={price}
            location={location}
            counterpartName={seller}
            date={date}
            status={status}
            role="buyer"
            imageUrl={imageUrl} // ✅ on transmet à OrderCard
        />
    );
}