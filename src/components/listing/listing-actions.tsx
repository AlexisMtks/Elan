"use client";

import { Button } from "@/components/ui/button";

export function ListingActions() {
    return (
        <div className="flex flex-wrap gap-3">
        <Button
            onClick={() => alert("Simulation: buy this item")}
>
    Buy
    </Button>

    <Button
    variant="outline"
    onClick={() => alert("Simulation: make an offer")}
>
    Make an offer
    </Button>
    </div>
);
}