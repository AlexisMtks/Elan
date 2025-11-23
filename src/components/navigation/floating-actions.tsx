"use client";

import { useRouter, usePathname } from "next/navigation";
import { Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-current-user";

export function FloatingActions() {
    const { user, checking } = useCurrentUser();
    const router = useRouter();
    const pathname = usePathname();

    // Optionnel : masquer sur certaines pages (login, register...)
    const hideOnRoutes = ["/login", "/register", "/logout"];
    if (hideOnRoutes.includes(pathname)) {
        return null;
    }

    // Pendant le check auth, on évite les flickers sur le bouton favoris
    if (checking) {
        return null;
    }

    const handleGoToCart = () => {
        router.push("/cart"); // 📍 à ajuster quand tu créeras la page panier
    };

    const handleGoToFavorites = () => {
        router.push("/favorites"); // 📍 à ajuster selon le futur chemin des favoris
    };

    return (
        <div className="pointer-events-none fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3">
            {/* Bouton favoris - seulement si user connecté */}
            {user && (
                <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    className="pointer-events-auto h-12 w-12 rounded-full shadow-lg"
                    onClick={handleGoToFavorites}
                    aria-label="Voir mes favoris"
                >
                    <Heart className="h-5 w-5" />
                </Button>
            )}

            {/* Bouton panier - toujours visible */}
            <Button
                type="button"
                size="icon"
                className="pointer-events-auto h-12 w-12 rounded-full shadow-lg"
                onClick={handleGoToCart}
                aria-label="Voir mon panier"
            >
                <ShoppingCart className="h-5 w-5" />
            </Button>
        </div>
    );
}