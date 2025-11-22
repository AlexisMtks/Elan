"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/use-current-user";

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
                            }: ProductCardProps) {
    const { user: currentUser } = useCurrentUser();
    const pathname = usePathname();

    const profileMatch = pathname?.match(/^\/profile\/([^/]+)/);
    const profileIdInUrl = profileMatch?.[1] ?? null;

    const isOwnProfilePage =
        !!currentUser?.id && !!profileIdInUrl && currentUser.id === profileIdInUrl;

    const targetHref = href ?? `/listings/${id}`;

    const clickableProp = clickable;
    const isClickable = clickableProp && !isOwnProfilePage;

    if (process.env.NODE_ENV !== "production") {
        console.log("🧩 ProductCard debug", {
            id,
            clickableProp,
            isOwnProfilePage,
            isClickable,
            profileIdInUrl,
            currentUserId: currentUser?.id ?? null,
        });
    }

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
        : "cursor-default pointer-events-none"; // 👈 bloque tous les clics sur la carte

    return (
        <Card
            className={cn(
                "overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm p-0",
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
                            <h3 className="line-clamp-2 text-sm font-medium">
                                {title}
                            </h3>

                            {subtitle && (
                                <p className="line-clamp-1 text-xs text-muted-foreground">
                                    {subtitle}
                                </p>
                            )}
                        </div>

                        <div className="mt-1 flex items-center justify-between gap-2">
                            <p className={priceTextClasses}>
                                {price.toFixed(2)} €
                            </p>

                            {location && (
                                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                    <MapPin className="h-3 w-3" />
                                    <span className="line-clamp-1">
                                        {location}
                                    </span>
                                </span>
                            )}
                        </div>
                    </div>
                </Wrapper>

                {footer && <div className="border-t px-4 py-3">{footer}</div>}
            </CardContent>
        </Card>
    );
}