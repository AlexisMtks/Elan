"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    RadioGroup,
    RadioGroupItem,
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";

export function FilterPanel() {
    return (
        <aside className="w-full max-w-xs space-y-6 rounded-2xl border bg-background p-6">
            <h2 className="text-lg font-semibold">Filtres</h2>

            {/* Catégorie – on laissera vide pour le MVP */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Catégorie</span>
                    {/* plus tard : select déroulant */}
                </div>
            </div>

            {/* État */}
            <div className="space-y-2">
                <span className="text-sm font-medium">État</span>
                <RadioGroup defaultValue="bon">
                    <div className="flex items-center gap-2">
                        <RadioGroupItem value="neuf" id="etat-neuf" />
                        <Label htmlFor="etat-neuf" className="text-sm">
                            Neuf
                        </Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <RadioGroupItem value="bon" id="etat-bon" />
                        <Label htmlFor="etat-bon" className="text-sm">
                            Bon état
                        </Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <RadioGroupItem value="usage" id="etat-usage" />
                        <Label htmlFor="etat-usage" className="text-sm">
                            Usagé
                        </Label>
                    </div>
                </RadioGroup>
            </div>

            {/* Prix */}
            <div className="space-y-2">
                <span className="text-sm font-medium">Prix</span>
                <div className="flex gap-2">
                    <Input placeholder="min" className="text-sm" />
                    <Input placeholder="max" className="text-sm" />
                </div>
            </div>

            {/* Taille (slider) */}
            <div className="space-y-2">
                <span className="text-sm font-medium">Taille</span>
                <Slider defaultValue={[50]} />
            </div>

            {/* Localisation */}
            <div className="space-y-2">
                <span className="text-sm font-medium">Localisation</span>
                <Input placeholder="Ville, code postal…" className="text-sm" />
            </div>

            <Separator />

            <Button
                variant="outline"
                className="w-full"
                onClick={() => alert("Simulation : réinitialiser les filtres")}
            >
                Réinitialiser
            </Button>
        </aside>
    );
}