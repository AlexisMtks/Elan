"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface SellerCardProps {
    id?: string;
    name: string;
    listingsCount: number;
    /**
     * Affiche un bouton "Contacter le vendeur" qui renvoie vers la messagerie.
     */
    showContactButton?: boolean;
    /**
     * Affiche un bouton "Voir le profil" qui renvoie vers le profil public.
     */
    showProfileButton?: boolean;
}

/**
 * Carte d'informations vendeur réutilisable :
 * - avatar + nom + nombre d’annonces
 * - clic sur l’avatar / le nom → profil public (si id fourni)
 * - boutons optionnels "Contacter le vendeur" / "Voir le profil"
 */
export function SellerCard({
                               id,
                               name,
                               listingsCount,
                               showContactButton = false,
                               showProfileButton = false,
                           }: SellerCardProps) {
    const router = useRouter();

    const initials = name
        .split(" ")
        .map((part) => part.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase();

    const handleContact = () => {
        // Pour le MVP, on renvoie simplement vers la page de messagerie
        router.push("/messages");
    };

    const handleViewProfile = () => {
        if (!id) return;
        router.push(`/profile/${id}`);
    };

    const mainContent = (
        <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
                <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-0.5">
                <p className="text-sm font-medium">{name}</p>
                <p className="text-xs text-muted-foreground">
                    {listingsCount} annonce{listingsCount > 1 ? "s" : ""}
                </p>
            </div>
        </div>
    );

    const header = id ? (
        <Link
            href={`/profile/${id}`}
            className="inline-flex items-center gap-3 hover:underline"
        >
            {mainContent}
        </Link>
    ) : (
        mainContent
    );

    return (
        <div className="space-y-3">
            {header}

            {(showContactButton || showProfileButton) && (
                <div className="flex flex-col gap-2">
                    {showContactButton && (
                        <Button type="button" onClick={handleContact}>
                            Contacter le vendeur
                        </Button>
                    )}
                    {showProfileButton && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleViewProfile}
                            disabled={!id}
                        >
                            Voir le profil
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}