"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus } from "lucide-react";

interface ImageUploadProps {
    /**
     * Callback optionnel pour remonter la liste des URLs uploadées
     * (pour plus tard, quand on branchera sur la création de l’annonce)
     */
    onChange?: (urls: string[]) => void;
    /**
     * Nombre max d’images autorisées
     */
    maxImages?: number;
}

export function ImageUpload({ onChange, maxImages = 6 }: ImageUploadProps) {
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleClickAdd = () => {
        fileInputRef.current?.click();
    };

    const handleFilesSelected = async (event: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files ?? []);
        if (files.length === 0) return;

        // On reset l’input pour pouvoir re-sélectionner les mêmes fichiers plus tard
        event.target.value = "";

        // On limite si on dépasse le max
        const remainingSlots = maxImages - imageUrls.length;
        const filesToUpload = files.slice(0, remainingSlots);
        if (filesToUpload.length === 0) return;

        setUploading(true);

        const newUrls: string[] = [];

        try {
            for (const file of filesToUpload) {
                const fd = new FormData();
                fd.append("file", file);

                const res = await fetch("/api/listings/images", {
                    method: "POST",
                    body: fd,
                });

                const data = await res.json().catch(() => null);

                if (!res.ok || !data?.publicUrl) {
                    console.error("Erreur upload image listing :", data);
                    continue;
                }

                newUrls.push(data.publicUrl);
            }

            if (newUrls.length > 0) {
                setImageUrls((prev) => {
                    const updated = [...prev, ...newUrls];
                    onChange?.(updated);
                    return updated;
                });
            }
        } catch (err) {
            console.error("Erreur inattendue lors de l’upload d’images :", err);
        } finally {
            setUploading(false);
        }
    };

    const hasReachedLimit = imageUrls.length >= maxImages;

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
                {/* Vignettes des images déjà uploadées */}
                {imageUrls.map((url, index) => (
                    <div
                        key={index}
                        className="relative h-24 w-24 overflow-hidden rounded-lg border bg-muted"
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={url}
                            alt={`Image ${index + 1}`}
                            className="h-full w-full object-cover"
                        />
                    </div>
                ))}

                {/* Tuile “ajouter une image” */}
                {!hasReachedLimit && (
                    <button
                        type="button"
                        onClick={handleClickAdd}
                        className="flex h-24 w-24 flex-col items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground hover:bg-muted/40"
                    >
                        <ImagePlus className="mb-1 h-6 w-6" />
                        <span>Ajouter</span>
                    </button>
                )}
            </div>

            {/* Bouton + input */}
            <div className="flex items-center gap-3">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleClickAdd}
                    disabled={uploading || hasReachedLimit}
                >
                    {uploading ? "Upload en cours..." : "Ajouter des images"}
                </Button>
                <span className="text-xs text-muted-foreground">
          {imageUrls.length}/{maxImages} images
        </span>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFilesSelected}
            />
        </div>
    );
}