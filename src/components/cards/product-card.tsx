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
}

export function ProductCard({
                                id,
                                title,
                                price,
                                location,
                                subtitle,
                                variant = "default",
                            }: ProductCardProps) {
    const isCompact = variant === "compact";

    return (
        <Link href={`/listings/${id}`}>
            <Card className="h-full cursor-pointer rounded-2xl border">
                <CardContent className="flex h-full flex-col p-0">
                    {/* Image placeholder */}
                    <div className="flex aspect-[4/3] items-center justify-center rounded-t-2xl bg-muted">
                        <span className="text-xs text-muted-foreground">Image</span>
                    </div>

                    {/* Infos texte */}
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
                </CardContent>
            </Card>
        </Link>
    );
}