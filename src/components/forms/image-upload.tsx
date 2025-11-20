"use client";

import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";

interface ImageUploadProps {
    value?: string[];
    onChange?: (urls: string[]) => void;
    maxImages?: number;
}

/**
 * Composant d’upload d’images pour les annonces.
 * - Supporte le clic + sélection de fichiers
 * - Supporte le drag & drop (glisser-déposer) dans la zone principale
 * - Supporte le drag & drop global (sur toute la fenêtre)
 * - Upload vers /api/listings/images (un fichier après l’autre)
 */
export function ImageUpload({
                                value,
                                onChange,
                                maxImages = 6,
                            }: ImageUploadProps) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [internalUrls, setInternalUrls] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const imageUrls = value ?? internalUrls;
    const canAddMore = imageUrls.length < maxImages;

    const triggerFilePicker = () => {
        if (!canAddMore) return;
        fileInputRef.current?.click();
    };

    /**
     * Fonction centrale qui prend une liste de fichiers (que ce soit via
     * <input type="file"> ou via drag & drop) et applique la logique d’upload.
     */
    const handleFiles = useCallback(
        async (files: File[]) => {
            if (!files.length || !canAddMore) return;

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

                    if (value !== undefined) {
                        onChange?.(updated); // mode contrôlé
                    } else {
                        setInternalUrls(updated); // mode non contrôlé
                        onChange?.(updated);
                    }
                }
            } catch (err) {
                console.error("Erreur inattendue lors de l’upload d’images :", err);
            } finally {
                setUploading(false);
                setIsDragging(false);
            }
        },
        [canAddMore, imageUrls, maxImages, onChange, value],
    );

    const handleFilesSelected = async (
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        const files = Array.from(event.target.files ?? []);
        // reset pour pouvoir re-sélectionner les mêmes fichiers plus tard
        event.target.value = "";
        void handleFiles(files);
    };

    // --- Drag & drop handlers sur la zone ---

    const handleDragOver: React.DragEventHandler<HTMLDivElement> = (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!canAddMore) return;
        if (!isDragging) {
            setIsDragging(true);
        }
    };

    const handleDragLeave: React.DragEventHandler<HTMLDivElement> = (event) => {
        event.preventDefault();
        event.stopPropagation();
        // on évite les flickers en ne reset que si on sort vraiment de la zone
        if (event.currentTarget.contains(event.relatedTarget as Node)) return;
        setIsDragging(false);
    };

    const handleDrop: React.DragEventHandler<HTMLDivElement> = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);

        if (!canAddMore) return;

        const droppedFiles = Array.from(event.dataTransfer.files ?? []);
        if (droppedFiles.length === 0) return;

        void handleFiles(droppedFiles);
    };

    // --- Drag & drop global sur toute la fenêtre ---

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (!canAddMore) return;

        let dragCounter = 0;

        const handleWindowDragOver = (event: DragEvent) => {
            event.preventDefault();
            if (!event.dataTransfer) return;
            if (!Array.from(event.dataTransfer.types).includes("Files")) return;

            dragCounter++;
            setIsDragging(true);
        };

        const handleWindowDragLeave = (event: DragEvent) => {
            event.preventDefault();
            dragCounter = Math.max(0, dragCounter - 1);
            if (dragCounter === 0) {
                setIsDragging(false);
            }
        };

        const handleWindowDrop = (event: DragEvent) => {
            event.preventDefault();
            const files = Array.from(event.dataTransfer?.files ?? []);
            dragCounter = 0;
            setIsDragging(false);

            if (!files.length) return;
            void handleFiles(files);
        };

        window.addEventListener("dragover", handleWindowDragOver);
        window.addEventListener("dragleave", handleWindowDragLeave);
        window.addEventListener("drop", handleWindowDrop);

        return () => {
            window.removeEventListener("dragover", handleWindowDragOver);
            window.removeEventListener("dragleave", handleWindowDragLeave);
            window.removeEventListener("drop", handleWindowDrop);
        };
    }, [canAddMore, handleFiles]);

    const handleRemove = (urlToRemove: string) => {
        const updated = imageUrls.filter((url) => url !== urlToRemove);

        if (value !== undefined) {
            onChange?.(updated);
        } else {
            setInternalUrls(updated);
            onChange?.(updated);
        }
    };

    return (
        <div className="space-y-3">
            {/* Zone drop principale */}
            <div
                className={[
                    "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-muted/40 px-6 py-8 text-center transition-colors",
                    canAddMore ? "cursor-pointer" : "cursor-not-allowed opacity-70",
                    isDragging ? "border-primary bg-muted/70" : "border-border/70",
                    uploading ? "opacity-80" : "",
                ].join(" ")}
                onClick={triggerFilePicker}
                onDragOver={handleDragOver}
                onDragEnter={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <p className="text-sm font-medium">
                    {canAddMore
                        ? "Glissez-déposez vos photos ici"
                        : "Nombre maximum de photos atteint"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                    ou cliquez pour sélectionner des images (JPG, PNG, max {maxImages})
                </p>

                {uploading && (
                    <p className="mt-2 text-xs text-muted-foreground">
                        Upload en cours…
                    </p>
                )}
            </div>

            {/* Vignettes */}
            {imageUrls.length > 0 && (
                <div className="flex flex-wrap gap-3">
                    {imageUrls.map((url) => (
                        <div
                            key={url}
                            className="relative h-24 w-24 overflow-hidden rounded-xl border bg-muted"
                        >
                            <img
                                src={url}
                                alt="Photo d’annonce"
                                className="h-full w-full object-cover"
                            />
                            <button
                                type="button"
                                className="absolute right-1 top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-background/90 text-[10px] text-foreground shadow"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove(url);
                                }}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Compteur d'images */}
            <div className="flex items-center justify-end">
                <p className="text-xs text-muted-foreground">
                    {imageUrls.length} / {maxImages} photos
                </p>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleFilesSelected}
            />
        </div>
    );
}
