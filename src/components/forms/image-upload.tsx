"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus } from "lucide-react";

interface ImageUploadProps {
    /**
     * Liste contrôlée des URLs d'images (mode contrôlé).
     * Si non fournie, le composant gère son propre état interne.
     */
    value?: string[];

    /**
     * Callback optionnel pour remonter la liste des URLs uploadées
     * (utilisé par SellForm pour lier les images à l'annonce)
     */
    onChange?: (urls: string[]) => void;

    /**
     * Nombre max d’images autorisées
     */
    maxImages?: number;
}

export function ImageUpload({
                                value,
                                onChange,
                                maxImages = 6,
                            }: ImageUploadProps) {
    // État interne utilisé uniquement si `value` n'est pas fourni
    const [internalUrls, setInternalUrls] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Source de vérité : prop contrôlée ou état interne
    const imageUrls = value ?? internalUrls;

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
                const updated = [...imageUrls, ...newUrls];

                // Mode contrôlé : on délègue au parent
                if (value !== undefined) {
                    onChange?.(updated);
                } else {
                    // Mode non contrôlé : on gère l'état local
                    setInternalUrls(updated);
                    onChange?.(updated);
                }
            }
        } catch (err) {
            console.error("Erreur inattendue lors de l’upload d’images :", err);
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = (urlToRemove: string) => {
        const updated = imageUrls.filter((url) => url !== urlToRemove);

        if (value !== undefined) {
            onChange?.(updated);
        } else {
            setInternalUrls(updated);
            onChange?.(updated);
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

                        <button
                            type="button"
                            onClick={() => handleRemove(url)}
                            className="absolute right-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white"
                        >
                            X
                        </button>
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