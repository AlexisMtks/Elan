"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type SellMode = "publish" | "draft";

interface SellSuccessDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: SellMode;
}

/**
 * Dialog de confirmation utilisé pour l’enregistrement du brouillon
 * et la publication de l’annonce.
 */
export function SellSuccessDialog({
                                      open,
                                      onOpenChange,
                                      mode,
                                  }: SellSuccessDialogProps) {
    const router = useRouter();
    const isDraft = mode === "draft";

    const handleGoToListings = () => {
        router.push("/listings");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {isDraft
                            ? "Brouillon enregistré"
                            : "Annonce publiée avec succès 🎉"}
                    </DialogTitle>
                    <DialogDescription>
                        {isDraft
                            ? "Votre annonce a été enregistrée en tant que brouillon. Vous pourrez la retrouver et la modifier dans la section “Mes annonces”, onglet Brouillons."
                            : "Votre article est désormais en ligne. Vous pouvez le retrouver dans la section “Mes annonces”."}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Fermer
                    </Button>
                    <Button onClick={handleGoToListings}>Voir mes annonces</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}