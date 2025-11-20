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

export function SellSuccessDialog({
                                      open,
                                      onOpenChange,
                                      mode,
                                  }: SellSuccessDialogProps) {
    const router = useRouter();
    const isDraft = mode === "draft";

    const handleNewListing = () => {
        onOpenChange(false);
        router.push("/sell");
    };

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
                            ? "Votre annonce a été enregistrée en tant que brouillon. Vous pourrez la retrouver dans la section “Mes annonces”, onglet Brouillons."
                            : "Votre article est désormais en ligne. Vous pouvez le retrouver dans la section “Mes annonces”."}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="flex justify-end gap-2">
                    {/* ➕ Créer une nouvelle annonce */}
                    <Button variant="outline" onClick={handleNewListing}>
                        Créer une nouvelle annonce
                    </Button>

                    {/* ➕ Voir mes annonces */}
                    <Button onClick={handleGoToListings}>
                        Voir mes annonces
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}