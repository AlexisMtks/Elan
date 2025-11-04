import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

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
}

export function ProductCard({
                                id,
                                title,
                                price,
                                location,
                                subtitle,
                                variant = "default",
                                footer,
                                clickable = true, // par défaut, la carte est cliquable
                                href,
                            }: ProductCardProps) {
    const isCompact = variant === "compact";

    // 👇 Cible effective du lien : soit href fourni, soit la page d’annonce
    const effectiveHref = href ?? `/listings/${id}`;

    // 👇 On choisit dynamiquement le wrapper : Link ou div simple
    const Wrapper: any = clickable ? Link : "div";
    const wrapperProps = clickable
        ? { href: effectiveHref }
        : {};

    return (
        <Card className="h-full rounded-2xl border">
            <CardContent className="flex h-full flex-col p-0">
                {/* Zone cliquable : image + texte */}
                <Wrapper
                    {...wrapperProps}
                    className="flex flex-1 flex-col"
                >
                    {/* Placeholder image */}
                    <div className="flex aspect-[4/3] items-center justify-center rounded-t-2xl bg-muted">
                        <span className="text-xs text-muted-foreground">Image</span>
                    </div>

                    <div className="flex flex-1 flex-col gap-1 p-4">
                        <h3
                            className={`line-clamp-2 text-sm font-medium ${
                                isCompact ? "" : "md:text-base"
                            }`}
                        >
                            {title}
                        </h3>
                        {subtitle && (
                            <p className="text-xs text-muted-foreground">{subtitle}</p>
                        )}
                        <p className="mt-1 text-sm font-semibold">{price} €</p>
                        {location && (
                            <p className="text-xs text-muted-foreground">{location}</p>
                        )}
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
