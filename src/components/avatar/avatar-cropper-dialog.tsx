"use client";

import { useCallback, useState } from "react";
import Cropper, { Area } from "react-easy-crop";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface AvatarCropperDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    file: File | null;
    onCropped: (blob: Blob) => void;
}

export function AvatarCropperDialog({
                                        open,
                                        onOpenChange,
                                        file,
                                        onCropped,
                                    }: AvatarCropperDialogProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [loading, setLoading] = useState(false);

    // Crée un URL local quand le fichier change
    if (file && !imageUrl) {
        const url = URL.createObjectURL(file);
        setImageUrl(url);
    }

    const onCropComplete = useCallback(
        (_croppedArea: Area, croppedAreaPixels: Area) => {
            setCroppedAreaPixels(croppedAreaPixels);
        },
        []
    );

    const handleClose = () => {
        if (imageUrl) {
            URL.revokeObjectURL(imageUrl);
        }
        setImageUrl(null);
        setCroppedAreaPixels(null);
        setZoom(1);
        setCrop({ x: 0, y: 0 });
        onOpenChange(false);
    };

    const handleConfirm = async () => {
        if (!imageUrl || !croppedAreaPixels) return;
        try {
            setLoading(true);
            const blob = await getCroppedImg(imageUrl, croppedAreaPixels);
            onCropped(blob);
            handleClose();
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !loading && onOpenChange(isOpen)}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Recadrer la photo de profil</DialogTitle>
                </DialogHeader>

                <div className="relative h-80 w-full overflow-hidden rounded-xl bg-muted">
                    {imageUrl && (
                        <Cropper
                            image={imageUrl}
                            crop={crop}
                            zoom={zoom}
                            aspect={1} // carré pour avatar
                            cropShape="round"
                            showGrid={false}
                            onCropChange={setCrop}
                            onZoomChange={(value) => setZoom(value)}
                            onCropComplete={onCropComplete}
                        />
                    )}
                </div>

                <div className="mt-4 space-y-2">
                    <p className="text-sm text-muted-foreground">Zoom</p>
                    <Slider
                        value={[zoom]}
                        min={1}
                        max={3}
                        step={0.1}
                        onValueChange={([value]) => setZoom(value)}
                    />
                </div>

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={handleClose} disabled={loading}>
                        Annuler
                    </Button>
                    <Button onClick={handleConfirm} disabled={loading || !croppedAreaPixels}>
                        {loading ? "Traitement..." : "Valider"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

/**
 * Convertit la zone recadrée en Blob JPEG carré (ex: 512x512)
 */
async function getCroppedImg(imageSrc: string, crop: Area): Promise<Blob> {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.src = imageSrc;
        img.onload = () => resolve(img);
        img.onerror = reject;
    });

    const canvas = document.createElement("canvas");
    const size = 512; // taille finale de l’avatar
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
        throw new Error("Impossible de récupérer le contexte canvas");
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        size,
        size
    );

    return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    reject(new Error("Échec de la création du Blob"));
                    return;
                }
                resolve(blob);
            },
            "image/jpeg",
            0.9
        );
    });
}