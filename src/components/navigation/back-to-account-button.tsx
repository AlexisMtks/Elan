"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BackToAccountButton() {
    const router = useRouter();

    return (
        <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-sm"
            onClick={() => router.push("/account")}
        >
            <ArrowLeft className="h-4 w-4" />
            <span>Retour à mon compte</span>
        </Button>
    );
}