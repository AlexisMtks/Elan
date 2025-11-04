"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface OrderSellerInfoProps {
    id: string;
    name: string;
    listingsCount: number;
}

/**
 * Bloc d'informations sur le vendeur, avec actions vers profil public
 * et messagerie.
 */
export function OrderSellerInfo({
                                    id,
                                    name,
                                    listingsCount,
                                }: OrderSellerInfoProps) {
    const router = useRouter();

    const initials =
        name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase() || "EL";

    const handleContact = () => {
        // Pour le MVP, on renvoie simplement vers la page de messagerie
        router.push("/messages");
    };

    const handleViewProfile = () => {
        router.push(`/profile/${id}`);
    };

    return (
        <div className="space-y-3">
            <p className="text-sm font-semibold">Vendeur</p>

            {/* Avatar + nom cliquables vers le profil public */}
            <Link
                href={`/profile/${id}`}
                className="flex items-center gap-3"
            >
                <Avatar className="h-10 w-10">
                    <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="space-y-0.5">
                    <p className="text-sm font-medium">{name}</p>
                    <p className="text-xs text-muted-foreground">
                        {listingsCount} annonces
                    </p>
                </div>
            </Link>

            <div className="flex flex-col gap-2">
                <Button onClick={handleContact}>
                    Contacter le vendeur
                </Button>
                <Button variant="outline" onClick={handleViewProfile}>
                    Voir le profil
                </Button>
            </div>
        </div>
    );
}