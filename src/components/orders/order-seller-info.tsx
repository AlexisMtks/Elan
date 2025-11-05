import { SellerCard } from "@/components/listing/seller-card";

interface OrderSellerInfoProps {
    id: string;
    name: string;
    listingsCount: number;
}

/**
 * Bloc d'informations sur le vendeur pour le détail de commande,
 * basé sur la carte vendeur réutilisable (SellerCard).
 */
export function OrderSellerInfo(props: OrderSellerInfoProps) {
    return (
        <div className="space-y-3">
            <p className="text-sm font-semibold">Vendeur</p>
            <SellerCard
                id={props.id}
                name={props.name}
                listingsCount={props.listingsCount}
                showContactButton
                showProfileButton
            />
        </div>
    );
}
