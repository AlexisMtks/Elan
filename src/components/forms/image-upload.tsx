"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus } from "lucide-react";

export function ImageUpload() {
    const [files, setFiles] = useState<File[]>([]);

    const handleUpload = () => {
        alert("Simulation d’upload d’image");
    };

    return (
        <div className="flex flex-wrap items-center gap-3">
            {files.length === 0 && (
                    <div className="flex h-24 w-24 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
                    <ImagePlus className="h-6 w-6" />
                        </div>
                )}
            <Button type="button" variant="outline" size="sm" onClick={handleUpload}>
        Ajouter une image
    </Button>
    </div>
);
}