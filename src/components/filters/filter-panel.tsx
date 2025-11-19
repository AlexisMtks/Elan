"use client";

import { useMemo, useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    RadioGroup,
    RadioGroupItem,
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";

type CategoryValue = "all" | "agres" | "tapis" | "accessoires";
type ConditionValue = "new" | "like_new" | "very_good" | "good" | "used";
type NegotiableValue = "all" | "yes" | "no";

interface FilterState {
    category: CategoryValue;
    priceRange: [number, number]; // en euros, ex: [0, 500]
    conditions: ConditionValue[];
    city: string;
    negotiable: NegotiableValue;
}

const DEFAULT_PRICE_RANGE: [number, number] = [0, 500];

const CONDITION_LABELS: Record<ConditionValue, string> = {
    new: "Neuf",
    like_new: "Comme neuf",
    very_good: "Très bon état",
    good: "Bon état",
    used: "État correct",
};

export function FilterPanel() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const initialState = useMemo<FilterState>(() => {
        const categoryParam = (searchParams?.get("category") as CategoryValue | null) ?? "all";
        const minPriceParam = searchParams?.get("minPrice");
        const maxPriceParam = searchParams?.get("maxPrice");
        const cityParam = searchParams?.get("city") ?? "";
        const negotiableParam =
            (searchParams?.get("negotiable") as NegotiableValue | null) ?? "all";
        const conditionsParam = searchParams?.get("conditions");

        const minPrice = minPriceParam ? Number(minPriceParam) : DEFAULT_PRICE_RANGE[0];
        const maxPrice = maxPriceParam ? Number(maxPriceParam) : DEFAULT_PRICE_RANGE[1];

        const conditions: ConditionValue[] = conditionsParam
            ? (conditionsParam
                .split(",")
                .filter(Boolean) as ConditionValue[])
            : [];

        return {
            category: ["all", "agres", "tapis", "accessoires"].includes(categoryParam)
                ? categoryParam
                : "all",
            priceRange: [
                Number.isFinite(minPrice) ? minPrice : DEFAULT_PRICE_RANGE[0],
                Number.isFinite(maxPrice) ? maxPrice : DEFAULT_PRICE_RANGE[1],
            ],
            conditions,
            city: cityParam,
            negotiable: ["all", "yes", "no"].includes(negotiableParam)
                ? negotiableParam
                : "all",
        };
    }, [searchParams]);

    const [filters, setFilters] = useState<FilterState>(initialState);

    useEffect(() => {
        // ✅ dès que les searchParams changent (donc l'URL, via les chips)
        // on remet le panneau à jour avec les valeurs dérivées de l'URL
        setFilters(initialState);
    }, [initialState]);

    const handlePriceChange = (values: number[]) => {
        if (!values.length) return;
        const [min, max] = values as [number, number];
        setFilters((prev) => ({
            ...prev,
            priceRange: [min, max],
        }));
    };

    const toggleCondition = (value: ConditionValue) => {
        setFilters((prev) => {
            const alreadySelected = prev.conditions.includes(value);
            return {
                ...prev,
                conditions: alreadySelected
                    ? prev.conditions.filter((c) => c !== value)
                    : [...prev.conditions, value],
            };
        });
    };

    const applyFilters = () => {
        const params = new URLSearchParams(searchParams?.toString());

        // Catégorie -> basée sur public.categories.slug
        if (filters.category === "all") {
            params.delete("category");
        } else {
            params.set("category", filters.category);
        }

        // Prix (en euros pour l'instant, conversion en centimes côté requête plus tard)
        if (
            filters.priceRange[0] === DEFAULT_PRICE_RANGE[0] &&
            filters.priceRange[1] === DEFAULT_PRICE_RANGE[1]
        ) {
            params.delete("minPrice");
            params.delete("maxPrice");
        } else {
            params.set("minPrice", String(filters.priceRange[0]));
            params.set("maxPrice", String(filters.priceRange[1]));
        }

        // Conditions -> valeurs alignées avec listings.condition
        if (!filters.conditions.length) {
            params.delete("conditions");
        } else {
            params.set("conditions", filters.conditions.join(","));
        }

        // Ville (listings.city)
        if (!filters.city.trim()) {
            params.delete("city");
        } else {
            params.set("city", filters.city.trim());
        }

        // Négociable (listings.is_negotiable)
        if (filters.negotiable === "all") {
            params.delete("negotiable");
        } else {
            params.set("negotiable", filters.negotiable);
        }

        const queryString = params.toString();
        router.push(queryString ? `${pathname}?${queryString}` : pathname);
    };

    const resetFilters = () => {
        setFilters({
            category: "all",
            priceRange: DEFAULT_PRICE_RANGE,
            conditions: [],
            city: "",
            negotiable: "all",
        });

        const params = new URLSearchParams(searchParams?.toString());

        params.delete("category");
        params.delete("minPrice");
        params.delete("maxPrice");
        params.delete("conditions");
        params.delete("city");
        params.delete("negotiable");

        const queryString = params.toString();
        router.push(queryString ? `${pathname}?${queryString}` : pathname);
    };

    return (
        <aside className="w-full max-w-xs space-y-6 rounded-2xl border bg-background p-6">
            <h2 className="text-lg font-semibold">Filtres</h2>

            {/* Catégories principales (basées sur public.categories) */}
            <section className="space-y-3">
                <h3 className="text-sm font-medium">Catégorie</h3>
                <RadioGroup
                    value={filters.category}
                    onValueChange={(value) =>
                        setFilters((prev) => ({
                            ...prev,
                            category: value as CategoryValue,
                        }))
                    }
                    className="grid grid-cols-1 gap-2 text-sm"
                >
                    <Label className="flex items-center gap-2">
                        <RadioGroupItem value="all" />
                        Toutes les catégories
                    </Label>
                    <Label className="flex items-center gap-2">
                        <RadioGroupItem value="agres" />
                        Agrès
                    </Label>
                    <Label className="flex items-center gap-2">
                        <RadioGroupItem value="tapis" />
                        Tapis
                    </Label>
                    <Label className="flex items-center gap-2">
                        <RadioGroupItem value="accessoires" />
                        Accessoires
                    </Label>
                </RadioGroup>
            </section>

            <Separator />

            {/* Prix — en cohérence avec listings.price (centimes) */}
            <section className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                    <h3 className="font-medium">Prix</h3>
                    <span className="text-xs text-muted-foreground">
            {filters.priceRange[0]}€ – {filters.priceRange[1]}€
          </span>
                </div>
                <Slider
                    min={0}
                    max={500}
                    step={10}
                    value={filters.priceRange}
                    onValueChange={handlePriceChange}
                />
            </section>

            <Separator />

            {/* État du produit — aligné sur listings.condition */}
            <section className="space-y-3">
                <h3 className="text-sm font-medium">État</h3>
                <div className="flex flex-wrap gap-2">
                    {(Object.keys(CONDITION_LABELS) as ConditionValue[]).map((condition) => {
                        const isActive = filters.conditions.includes(condition);
                        return (
                            <Button
                                key={condition}
                                type="button"
                                variant={isActive ? "default" : "outline"}
                                size="sm"
                                className="rounded-full px-3 text-xs"
                                onClick={() => toggleCondition(condition)}
                                aria-pressed={isActive}
                            >
                                {CONDITION_LABELS[condition]}
                            </Button>
                        );
                    })}
                </div>
            </section>

            <Separator />

            {/* Négociable — basé sur listings.is_negotiable */}
            <section className="space-y-3">
                <h3 className="text-sm font-medium">Prix négociable</h3>
                <RadioGroup
                    value={filters.negotiable}
                    onValueChange={(value) =>
                        setFilters((prev) => ({
                            ...prev,
                            negotiable: value as NegotiableValue,
                        }))
                    }
                    className="grid grid-cols-1 gap-2 text-sm"
                >
                    <Label className="flex items-center gap-2">
                        <RadioGroupItem value="all" />
                        Tous les articles
                    </Label>
                    <Label className="flex items-center gap-2">
                        <RadioGroupItem value="yes" />
                        Uniquement négociables
                    </Label>
                    <Label className="flex items-center gap-2">
                        <RadioGroupItem value="no" />
                        Non négociables
                    </Label>
                </RadioGroup>
            </section>

            <Separator />

            {/* Localisation — en cohérence avec listings.city */}
            <section className="space-y-2">
                <h3 className="text-sm font-medium">Localisation</h3>
                <Input
                    placeholder="Ville…"
                    className="text-sm"
                    value={filters.city}
                    onChange={(event) =>
                        setFilters((prev) => ({
                            ...prev,
                            city: event.target.value,
                        }))
                    }
                />
            </section>

            <Separator />

            <div className="flex flex-col gap-2">
                <Button type="button" className="w-full" onClick={applyFilters}>
                    Appliquer les filtres
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={resetFilters}
                >
                    Réinitialiser
                </Button>
            </div>
        </aside>
    );
}