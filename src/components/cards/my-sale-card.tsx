"use client";

import { OrderCard, OrderStatus } from "@/components/cards/order-card";

interface MySaleCardProps {
    id: string; // identifiant de la commande / vente
    title: string;
    price: number;
    location?: string;
    buyer: string;
    date: string;
    status: OrderStatus;
}

/**
 * Variante "Mes ventes" basée sur OrderCard (role="seller").
 */
export function MySaleCard({
                               id,
                               title,
                               price,
                               location,
                               buyer,
                               date,
                               status,
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
        />
    );
}