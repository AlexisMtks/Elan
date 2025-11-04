import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface FilterChipsProps {
    filters: string[];
}

export function FilterChips({ filters }: FilterChipsProps) {
    if (!filters.length) return null;

    return (
        <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
                <Badge
                    key={filter}
                    variant="secondary"
                    className="flex items-center gap-1 rounded-full px-3 py-1 text-xs"
                >
                    <span>{filter}</span>
                    <X className="h-3 w-3" />
                </Badge>
            ))}
        </div>
    );
}