"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BackToListingsButton() {
    const router = useRouter();

    return (
        <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-sm"
            onClick={() => router.push("/listings")}
        >
            <ArrowLeft className="h-4 w-4" />
            <span>Retour à mes annonces</span>
        </Button>
    );
}