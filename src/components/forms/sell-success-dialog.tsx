"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface SellSuccessDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SellSuccessDialog({ open, onOpenChange }: SellSuccessDialogProps) {
    const router = useRouter();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Annonce publiée avec succès 🎉</DialogTitle>
                    <DialogDescription>
                        Votre article est désormais en ligne. Vous pouvez le retrouver dans la section “Mes annonces”.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Fermer
                    </Button>
                    <Button onClick={() => router.push("/my-listings")}>
                        Voir mes annonces
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}