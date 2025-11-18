"use client";

import { Button } from "@/components/ui/button";

export function ListingActions() {
    return (
        <div className="flex flex-wrap gap-3">
            <Button onClick={() => alert("Simulation : achat de l'annonce")}>
                Acheter
            </Button>
            <Button
                variant="outline"
                onClick={() => alert("Simulation : faire une offre")}
            >
                Faire une offre
            </Button>
        </div>
    );
}