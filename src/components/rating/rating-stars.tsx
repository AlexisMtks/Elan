"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface RatingStarsProps {
    value?: number; // 0 à max
    max?: number;
    readOnly?: boolean;
    onChange?: (value: number) => void;
    size?: "sm" | "md";
}

/**
 * Affichage d’un rating en étoiles (0 → max).
 * - Si readOnly = false, les étoiles sont cliquables.
 * - Si value n’est pas fourni, le composant gère un état interne.
 */
export function RatingStars({
                                value,
                                max = 5,
                                readOnly = false,
                                onChange,
                                size = "md",
                            }: RatingStarsProps) {
    const [internalValue, setInternalValue] = useState<number>(value ?? 0);
    const [hovered, setHovered] = useState<number | null>(null);

    const currentValue = value ?? internalValue;

    const iconSize = size === "sm" ? 16 : 20;
    const gapClass = size === "sm" ? "gap-0.5" : "gap-1";

    const handleClick = (index: number) => {
        if (readOnly) return;
        const newValue = index + 1;
        setInternalValue(newValue);
        onChange?.(newValue);
    };

    const handleMouseEnter = (index: number) => {
        if (readOnly) return;
        setHovered(index);
    };

    const handleMouseLeave = () => {
        if (readOnly) return;
        setHovered(null);
    };

    return (
        <div className={`flex items-center ${gapClass}`} aria-label="Note sur 5">
            {Array.from({ length: max }).map((_, index) => {
                const isFilled =
                    hovered !== null ? index <= hovered : index < currentValue;

                const star = (
                    <Star
                        size={iconSize}
                        className={
                            isFilled
                                ? "text-yellow-400 transition-colors"
                                : "text-muted-foreground/40 transition-colors"
                        }
                        // ⬇️ remplissage visible
                        fill={isFilled ? "currentColor" : "none"}
                    />
                );

                if (readOnly) {
                    return (
                        <span key={index} aria-hidden="true">
              {star}
            </span>
                    );
                }

                return (
                    <button
                        key={index}
                        type="button"
                        onClick={() => handleClick(index)}
                        onMouseEnter={() => handleMouseEnter(index)}
                        onMouseLeave={handleMouseLeave}
                        className="p-0.5"
                        aria-label={`Noter ${index + 1} sur ${max}`}
                    >
                        {star}
                    </button>
                );
            })}
        </div>
    );
}