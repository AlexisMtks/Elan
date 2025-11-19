"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface FilterChipsProps {
    filters: string[];
}

const CONDITION_LABELS = [
    "Neuf",
    "Comme neuf",
    "Très bon état",
    "Bon état",
    "État correct",
];

export function FilterChips({ filters }: FilterChipsProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    if (!filters.length) return null;

    const handleRemove = (filter: string) => {
        const params = new URLSearchParams(searchParams?.toString());

        // Recherche : "..." -> remove ?q=
        if (filter.startsWith('Recherche :')) {
            params.delete("q");
        }

        // Catégories
        if (filter === "Agrès") {
            params.delete("category");
        }
        if (filter === "Tapis") {
            params.delete("category");
        }
        if (filter === "Accessoires") {
            params.delete("category");
        }

        // Prix : X€ – Y€ -> remove minPrice / maxPrice
        if (filter.startsWith("Prix :")) {
            params.delete("minPrice");
            params.delete("maxPrice");
        }

        // État -> on supprime toutes les conditions (un chip regroupe plusieurs états)
        if (
            CONDITION_LABELS.some((label) => filter.includes(label)) ||
            filter.includes("•")
        ) {
            params.delete("conditions");
        }

        // Ville : ... -> remove city
        if (filter.startsWith("Ville :")) {
            params.delete("city");
        }

        // Négociable -> remove negotiable
        if (filter === "Prix négociable" || filter === "Prix fixe") {
            params.delete("negotiable");
        }

        const queryString = params.toString();
        router.push(queryString ? `${pathname}?${queryString}` : pathname);
    };

    return (
        <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
                <Badge
                    key={filter}
                    variant="secondary"
                    className="flex items-center gap-1 rounded-full px-3 py-1 text-xs"
                >
                    <span>{filter}</span>
                    <button
                        type="button"
                        onClick={() => handleRemove(filter)}
                        className="inline-flex items-center justify-center"
                        aria-label={`Retirer le filtre ${filter}`}
                    >
                        <X className="h-3 w-3" />
                    </button>
                </Badge>
            ))}
        </div>
    );
}