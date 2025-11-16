import { Card } from "@/components/ui/card";

interface ProductGalleryProps {
    images: string[];
}

export function ProductGallery({ images }: ProductGalleryProps) {
    const hasImages = images && images.length > 0;
    const mainImage = hasImages ? images[0] : null;
    const thumbnails = hasImages ? images.slice(0, 4) : [];

    return (
        <div className="space-y-4">
            {/* Image principale */}
            <Card className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-muted">
                {mainImage ? (
                    <img
                        src={mainImage}
                        alt="Photo principale de l'annonce"
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                        Aucune image disponible
                    </div>
                )}
            </Card>

            {/* Miniatures */}
            {thumbnails.length > 1 && (
                <div className="flex gap-3">
                    {thumbnails.map((url, index) => (
                        <Card
                            key={url ?? index}
                            className="aspect-square w-20 overflow-hidden rounded-xl bg-muted"
                        >
                            {url ? (
                                <img
                                    src={url}
                                    alt={`Photo ${index + 1} de l'annonce`}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
                                    Img {index + 1}
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}