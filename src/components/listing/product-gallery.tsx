import { Card } from "@/components/ui/card";

interface ProductGalleryProps {
    images: string[];
}

export function ProductGallery({ images }: ProductGalleryProps) {
    // Pour le MVP on ignore vraiment les URLs et on affiche des placeholders.
    // Plus tard: on utilisera la première image comme principale, les autres
    // comme vignettes cliquables.
    return (
        <div className="space-y-4">
            {/* Image principale */}
            <Card className="aspect-[4/3] w-full rounded-2xl bg-muted">
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    Main image
                </div>
            </Card>

            {/* Vignettes */}
            <div className="flex gap-3">
                {images.slice(0, 4).map((_, index) => (
                    <Card
                        key={index}
                        className="aspect-square w-20 rounded-xl bg-muted"
                    >
                        <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
                            Img {index + 1}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}