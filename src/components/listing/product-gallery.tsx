"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";

interface ProductGalleryProps {
    images: string[];
}

export function ProductGallery({ images }: ProductGalleryProps) {
    const hasImages = images && images.length > 0;

    // Index de l'image actuellement affichée en grand
    const [selectedIndex, setSelectedIndex] = useState(0);

    if (!hasImages) {
        return (
            <div className="space-y-4">
                <Card className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-muted max-h-[470px]">
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                        Aucune image disponible
                    </div>
                </Card>
            </div>
        );
    }

    const safeIndex = Math.min(selectedIndex, images.length - 1);
    const mainImage = images[safeIndex];
    const thumbnails = images.slice(0, 4);

    return (
        <div className="space-y-4">
            {/* Image principale */}
            <Card className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-muted max-h-[470px] max-w-[720px]">
                {mainImage ? (
                    <img
                        src={mainImage}
                        alt="Photo principale de l'annonce"
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                        Aucune image
                    </div>
                )}
            </Card>

            {/* Miniatures */}
            {thumbnails.length > 1 && (
                <div className="grid grid-cols-6">
                    {thumbnails.map((src, index) => {
                        const isActive = index === safeIndex;

                        return (
                            <button
                                key={`${src}-${index}`}
                                type="button"
                                onClick={() => setSelectedIndex(index)}
                                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                aria-label={`Voir la photo ${index + 1}`}
                            >
                                <Card
                                    className={[
                                        "aspect-square w-20 overflow-hidden rounded-xl bg-muted transition-transform hover:scale-[1.2] cursor-pointer",
                                        isActive ? "ring-2 ring-primary ring-offset-2" : "",
                                    ]
                                        .filter(Boolean)
                                        .join(" ")}
                                >
                                    {src ? (
                                        <img
                                            src={src}
                                            alt={`Photo ${index + 1} de l'annonce`}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
                                            Img {index + 1}
                                        </div>
                                    )}
                                </Card>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}