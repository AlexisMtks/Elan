"use client";

import { OrderCard, OrderStatus } from "@/components/cards/order-card";

interface MyPurchaseCardProps {
    id: string; // identifiant de la commande
    title: string;
    price: number;
    location?: string;
    seller: string;
    date: string;
    status: OrderStatus;
}

/**
 * Variante "Mes achats" basée sur OrderCard (role="buyer").
 */
export function MyPurchaseCard({
                                   id,
                                   title,
                                   price,
                                   location,
                                   seller,
                                   date,
                                   status,
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
        />
    );
}