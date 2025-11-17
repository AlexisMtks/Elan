"use client";

import { OrderCard, OrderStatus } from "@/components/cards/order-card";

export type SaleStatus = OrderStatus;

interface MySaleCardProps {
    id: string;
    title: string;
    price: number;
    location?: string;
    buyer: string;
    date: string;
    status: SaleStatus;
    imageUrl?: string; // ✅ nouvelle prop optionnelle
}

export function MySaleCard({
                               id,
                               title,
                               price,
                               location,
                               buyer,
                               date,
                               status,
                               imageUrl,
                           }: MySaleCardProps) {
    return (
        <OrderCard
            id={id}
            title={title}
            price={price}
            location={location}
            counterpartName={buyer}
            date={date}
            status={status}
            role="seller"
            imageUrl={imageUrl} // ✅ on transmet à OrderCard
        />
    );
}