"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Heart, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

type ProductCardVariant = "default" | "compact" | "profile";

interface ProductCardProps {
    id: string;
    title: string;
    price: number;
    location?: string;
    subtitle?: string;
    variant?: ProductCardVariant;
    footer?: React.ReactNode;
    clickable?: boolean;
    href?: string;
    imageUrl?: string;

    // Favoris / panier
    initialIsFavorite?: boolean;
    initialIsInCart?: boolean;
    showActions?: boolean;
    canFavorite?: boolean;
    onToggleFavorite?: (next: boolean) => void;
    onToggleCart?: (next: boolean) => void;
}

export function ProductCard({
                                id,
                                title,
                                price,
                                location,
                                subtitle,
                                variant = "default",
                                footer,
                                clickable = true,
                                href,
                                imageUrl,
                                initialIsFavorite = false,
                                initialIsInCart = false,
                                showActions = true,
                                canFavorite = false,
                                onToggleFavorite,
                                onToggleCart,
                            }: ProductCardProps) {
    const pathname = usePathname();

    const profileMatch = pathname?.match(/^\/profile\/([^/]+)/);
    const profileIdInUrl = profileMatch?.[1] ?? null;

    // Sur les pages profil publiques, la card peut être rendue non cliquable
    const isOwnProfilePage = false; // 💡 déjà géré en amont normalement, on garde la signature au cas où

    const targetHref = href ?? `/listings/${id}`;

    const clickableProp = clickable;
    const isClickable = clickableProp && !isOwnProfilePage;

    const Wrapper: React.ComponentType<
        React.ComponentProps<"div"> & { href?: string }
    > = isClickable ? (Link as any) : ("div" as any);

    const baseTextClasses =
        variant === "compact"
            ? "space-y-1 p-3"
            : variant === "profile"
                ? "space-y-1.5 p-4"
                : "space-y-2 p-4";

    const priceTextClasses =
        variant === "compact"
            ? "text-base font-semibold"
            : "text-lg font-semibold";

    const clickableCardClasses = isClickable
        ? "cursor-pointer transition-transform transition-shadow duration-150 hover:-translate-y-0.5 hover:shadow-md"
        : "cursor-default";

    // --- ÉTATS LOCAUX ---
    const [isFavorite, setIsFavorite] = useState<boolean>(initialIsFavorite);
    const [isInCart, setIsInCart] = useState<boolean>(initialIsInCart);

    // synchro si les props changent (par ex. après rechargement des favorites)
    useEffect(() => {
        setIsFavorite(initialIsFavorite);
    }, [initialIsFavorite]);

    useEffect(() => {
        setIsInCart(initialIsInCart);
    }, [initialIsInCart]);

    const handleToggleFavorite = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();

        const next = !isFavorite;
        setIsFavorite(next);
        onToggleFavorite?.(next);
    };

    const handleToggleCart = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();

        const next = !isInCart;
        setIsInCart(next);
        onToggleCart?.(next);
    };

    return (
        <Card
            className={cn(
                "relative overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm p-0",
                clickableCardClasses,
            )}
        >
            <CardContent className="p-0">
                <Wrapper
                    href={isClickable ? targetHref : undefined}
                    className={cn(
                        "block",
                        isClickable &&
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                    )}
                >
                    <div className="p-2 pb-0">
                        <div className="aspect-[5/6] w-full overflow-hidden rounded-xl bg-muted">
                            {imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt={title}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-[11px] text-muted-foreground">
                                    Photo à venir
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={baseTextClasses}>
                        <div className="space-y-1">
                            <h3 className="line-clamp-2 text-sm font-medium">{title}</h3>

                            {subtitle && (
                                <p className="line-clamp-1 text-xs text-muted-foreground">
                                    {subtitle}
                                </p>
                            )}
                        </div>

                        <div className="mt-1 flex items-center justify-between gap-2">
                            <p className={priceTextClasses}>{price.toFixed(2)} €</p>

                            {location && (
                                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span className="line-clamp-1">{location}</span>
                </span>
                            )}
                        </div>
                    </div>
                </Wrapper>

                {/* Icônes en bas à droite de la card */}
                {showActions && (
                    <div className="absolute bottom-2 right-2 flex gap-1">
                        {canFavorite && (
                            <button
                                type="button"
                                onClick={handleToggleFavorite}
                                className={cn(
                                    "inline-flex h-8 w-8 items-center justify-center rounded-full border bg-background/80 text-muted-foreground shadow-sm backdrop-blur-sm transition",
                                    "hover:bg-background hover:text-primary",
                                    isFavorite && "border-primary/60 bg-primary/10 text-primary",
                                )}
                                aria-pressed={isFavorite}
                                aria-label={
                                    isFavorite
                                        ? "Retirer des favorites"
                                        : "Ajouter aux favorites"
                                }
                            >
                                <Heart
                                    className={cn("h-4 w-4", isFavorite && "fill-current")}
                                />
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={handleToggleCart}
                            className={cn(
                                "inline-flex h-8 w-8 items-center justify-center rounded-full border bg-background/80 text-muted-foreground shadow-sm backdrop-blur-sm transition",
                                "hover:bg-background hover:text-primary",
                                isInCart && "border-primary/60 bg-primary/10 text-primary",
                            )}
                            aria-pressed={isInCart}
                            aria-label={
                                isInCart ? "Retirer du panier" : "Ajouter au panier"
                            }
                        >
                            <ShoppingCart
                                className={cn(
                                    "h-4 w-4",
                                    isInCart && "fill-current",
                                )}
                            />
                        </button>
                    </div>
                )}

                {footer && <div className="border-t px-4 py-3">{footer}</div>}
            </CardContent>
        </Card>
    );
}