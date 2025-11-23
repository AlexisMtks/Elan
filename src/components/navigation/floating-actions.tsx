"use client";

import { useRouter, usePathname } from "next/navigation";
import { Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useCartCounter } from "@/hooks/use-cart-counter";
import { useFavoritesCounter } from "@/hooks/use-favorites-counter";
import { useCartPreview } from "@/hooks/use-cart-preview";
import { useFavoritesPreview } from "@/hooks/use-favorites-preview";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
} from "@/components/ui/dropdown-menu";

export function FloatingActions() {
    const { user, checking } = useCurrentUser();
    const userId = user?.id;
    const router = useRouter();
    const pathname = usePathname();

    const cartCount = useCartCounter(userId);
    const favoritesCount = useFavoritesCounter(userId);

    const { items: cartItems, loading: cartLoading } = useCartPreview(userId);
    const { items: favoritesItems, loading: favoritesLoading } =
        useFavoritesPreview(userId);

    const hideOnRoutes = ["/login", "/register", "/logout"];
    if (hideOnRoutes.includes(pathname)) {
        return null;
    }

    if (checking) {
        return null;
    }

    const handleGoToCart = () => {
        router.push("/cart"); // à ajuster quand tu feras la page panier
    };

    const handleGoToFavorites = () => {
        router.push("/favorites"); // à ajuster quand tu feras la page favoris
    };

    return (
        <div className="pointer-events-none fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3">            {/* ❤️ Bouton + menu favoris – seulement si connecté */}
            {user && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="pointer-events-auto relative">
                            <Button
                                type="button"
                                size="icon"
                                variant="secondary"
                                className="h-12 w-12 rounded-full shadow-lg"
                                aria-label="Mes favoris"
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
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        side="top"
                        align="end"
                        className="w-80 rounded-2xl border bg-popover p-3 shadow-lg"
                    >
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold">Mes favoris</p>
                                {favoritesCount > 0 && (
                                    <span className="text-xs text-muted-foreground">
                    {favoritesCount} article
                                        {favoritesCount > 1 ? "s" : ""}
                  </span>
                                )}
                            </div>

                            <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                                {favoritesLoading ? (
                                    <p className="text-xs text-muted-foreground">
                                        Chargement des favoris…
                                    </p>
                                ) : favoritesItems.length === 0 ? (
                                    <p className="text-xs text-muted-foreground">
                                        Vous n’avez pas encore de favoris.
                                    </p>
                                ) : (
                                    favoritesItems.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center gap-2 rounded-lg bg-muted/40 p-2 text-xs"
                                        >
                                            <div className="h-10 w-10 overflow-hidden rounded-md bg-muted">
                                                {item.imageUrl ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={item.imageUrl}
                                                        alt={item.title}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-[9px] text-muted-foreground">
                                                        Photo
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex min-w-0 flex-1 flex-col">
                                                <p className="line-clamp-2 text-[11px] font-medium">
                                                    {item.title}
                                                </p>
                                                <p className="mt-0.5 text-[11px] text-muted-foreground">
                                                    {(item.price / 100).toFixed(2)} €
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={handleGoToFavorites}
                                className="w-full rounded-full border bg-background px-3 py-1.5 text-center text-xs font-medium hover:bg-accent"
                            >
                                Voir tous les favoris
                            </button>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}

            {/* 🛒 Bouton + menu panier */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div className="pointer-events-auto relative">
                        <Button
                            type="button"
                            size="icon"
                            variant="secondary"
                            className="h-12 w-12 rounded-full shadow-lg"
                            aria-label="Mon panier"
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
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    side="top"
                    align="end"
                    className="w-80 rounded-2xl border bg-popover p-3 shadow-lg"
                >
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold">Mon panier</p>
                            {cartCount > 0 && (
                                <span className="text-xs text-muted-foreground">
                  {cartCount} article{cartCount > 1 ? "s" : ""}
                </span>
                            )}
                        </div>

                        <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                            {cartLoading ? (
                                <p className="text-xs text-muted-foreground">
                                    Chargement du panier…
                                </p>
                            ) : cartItems.length === 0 ? (
                                <p className="text-xs text-muted-foreground">
                                    Votre panier est vide.
                                </p>
                            ) : (
                                cartItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center gap-2 rounded-lg bg-muted/40 p-2 text-xs"
                                    >
                                        <div className="h-10 w-10 overflow-hidden rounded-md bg-muted">
                                            {item.imageUrl ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.title}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-[9px] text-muted-foreground">
                                                    Photo
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex min-w-0 flex-1 flex-col">
                                            <p className="line-clamp-2 text-[11px] font-medium">
                                                {item.title}
                                            </p>
                                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                                                {(item.price / 100).toFixed(2)} €
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={handleGoToCart}
                            className="w-full rounded-full border bg-background px-3 py-1.5 text-center text-xs font-medium hover:bg-accent"
                        >
                            Voir le panier
                        </button>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}