"use client";

import { useRouter, usePathname } from "next/navigation";
import { Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useCartCounter } from "@/hooks/use-cart-counter";
import { useFavoritesCounter } from "@/hooks/use-favorites-counter";

export function FloatingActions() {
    const { user, checking } = useCurrentUser();
    const router = useRouter();
    const pathname = usePathname();

    const userId = user?.id;
    const cartCount = useCartCounter(userId);
    const favoritesCount = useFavoritesCounter(userId);

    // Masquer sur certaines routes si besoin
    const hideOnRoutes = ["/login", "/register", "/logout"];
    if (hideOnRoutes.includes(pathname)) {
        return null;
    }

    // On évite les flickers pendant le check auth
    if (checking) {
        return null;
    }

    const handleGoToCart = () => {
        router.push("/cart"); // à adapter quand tu créeras la page
    };

    const handleGoToFavorites = () => {
        router.push("/favorites"); // idem
    };

    return (
        <div className="pointer-events-none fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3">
            {/* Favoris - seulement si utilisateur connecté */}
            {user && (
                <div className="pointer-events-auto relative">
                    <Button
                        type="button"
                        size="icon"
                        variant="secondary"
                        className="h-12 w-12 rounded-full shadow-lg"
                        onClick={handleGoToFavorites}
                        aria-label="Voir mes favoris"
                    >
                        <Heart className="h-5 w-5" />
                    </Button>

                    {favoritesCount > 0 && (
                        <span
                            className="
              absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center
              rounded-full bg-primary px-1 text-[11px] font-semibold text-primary-foreground
              shadow
            "
                        >
            {favoritesCount}
          </span>
                    )}
                </div>
            )}

            {/* Panier - toujours visible */}
            <div className="pointer-events-auto relative">
                <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    className="h-12 w-12 rounded-full shadow-lg"
                    onClick={handleGoToCart}
                    aria-label="Voir mon panier"
                >
                    <ShoppingCart className="h-5 w-5" />
                </Button>

                {cartCount > 0 && (
                    <span
                        className="
            absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center
            rounded-full bg-primary px-1 text-[11px] font-semibold text-primary-foreground
            shadow
          "
                    >
          {cartCount}
        </span>
                )}
            </div>
        </div>
    );
}