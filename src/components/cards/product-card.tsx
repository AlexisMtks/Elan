import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";

type ProductCardVariant = "default" | "compact" | "profile";

interface ProductCardProps {
    id: string;
    title: string;
    price: number;
    location?: string;
    subtitle?: string;
    variant?: ProductCardVariant;
    footer?: React.ReactNode; // contenu personnalisable en bas
    clickable?: boolean;      // permet de désactiver le lien sur la carte
    href?: string;            // permet de surcharger la cible du lien
    imageUrl?: string;        // ✅ nouvelle prop optionnelle pour l'image
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
    const targetHref = href ?? `/listings/${id}`;

    const Wrapper: React.ComponentType<React.ComponentProps<"div"> & { href?: string }> =
        clickable ? (Link as any) : ("div" as any);

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

    return (
        <Card className="overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm">
            <CardContent className="p-0">
                <Wrapper href={clickable ? targetHref : undefined} className="block">
                    {/* Image en haut de la carte */}
                    <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
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

                    {/* Contenu texte */}
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

                {/* Footer optionnel : actions / statut, etc. */}
                {footer && (
                    <div className="border-t px-4 py-3">
                        {footer}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}