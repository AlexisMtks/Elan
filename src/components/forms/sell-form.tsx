"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "./image-upload";
import { SellSuccessDialog } from "./sell-success-dialog";
import { StepProgress } from "@/components/steps/step-progress";
import { supabase } from "@/lib/supabaseClient";

type SellMode = "publish" | "draft" | null;

type Category = {
    id: number;
    name: string;
    slug: string;
};

export function SellForm() {
    const [openDialog, setOpenDialog] = useState(false);
    const [mode, setMode] = useState<SellMode>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
    const [loadingCategories, setLoadingCategories] = useState(true);

    const steps = [
        { label: "Informations" },
        { label: "Photos" },
        { label: "Résumé" },
    ];

    const isLastStep = currentStep === steps.length - 1;

    // 🔹 Charger les catégories au montage
    useEffect(() => {
        async function fetchCategories() {
            const { data, error } = await supabase
                .from("categories")
                .select("id, name, slug")
                .order("name", { ascending: true });

            if (error) {
                console.error("Erreur lors du chargement des catégories :", error);
            } else {
                setCategories(data ?? []);
            }
            setLoadingCategories(false);
        }

        fetchCategories();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setMode("publish");
        setOpenDialog(true);
    };

    const handleSaveDraft = () => {
        setMode("draft");
        setOpenDialog(true);
    };

    const goToPrevious = () => setCurrentStep((prev) => Math.max(0, prev - 1));
    const goToNext = () => setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1));

    return (
        <>
            <Card className="space-y-6 rounded-2xl border p-6">
                <StepProgress steps={steps} currentStepIndex={currentStep} />

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Étape 1 : informations principales */}
                    {currentStep === 0 && (
                        <div className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Titre */}
                                <div className="space-y-2">
                                    <Label htmlFor="title">Titre de l’annonce</Label>
                                    <Input
                                        id="title"
                                        placeholder="Ex : Poutre d’équilibre 2m"
                                        required
                                    />
                                </div>

                                {/* Prix */}
                                <div className="space-y-2">
                                    <Label htmlFor="price">Prix (€)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        placeholder="Ex : 150"
                                        min="0"
                                        required
                                    />
                                </div>

                                {/* Catégorie (liée à la BDD) */}
                                <div className="space-y-2">
                                    <Label>Catégorie</Label>
                                    {loadingCategories ? (
                                        <p className="text-sm text-muted-foreground">
                                            Chargement des catégories...
                                        </p>
                                    ) : categories.length > 0 ? (
                                        <Select
                                            value={selectedCategory}
                                            onValueChange={setSelectedCategory}
                                        >
                                            <SelectTrigger className="min-w-[200px] w-full">
                                                <SelectValue placeholder="Choisissez une catégorie" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories
                                                    .sort((a, b) => a.name.localeCompare(b.name))
                                                    .map((cat) => (
                                                        <SelectItem key={cat.id} value={cat.id.toString()}>
                                                            {cat.name}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            Aucune catégorie disponible.
                                        </p>
                                    )}
                                </div>

                                {/* État */}
                                <div className="space-y-2">
                                    <Label>État</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choisissez un état" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="new">Neuf</SelectItem>
                                            <SelectItem value="very_good">Très bon état</SelectItem>
                                            <SelectItem value="good">Bon état</SelectItem>
                                            <SelectItem value="used">Usagé</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Décrivez votre article..."
                                    rows={5}
                                />
                            </div>
                        </div>
                    )}

                    {/* Étape 2 : photos */}
                    {currentStep === 1 && (
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Ajoutez des photos de votre article.
                            </p>
                            <ImageUpload />
                        </div>
                    )}

                    {/* Étape 3 : résumé (placeholder) */}
                    {currentStep === 2 && (
                        <div className="space-y-3">
                            <h2 className="text-base font-semibold">Résumé de votre annonce</h2>
                            <p className="text-sm text-muted-foreground">
                                Dans une version future, un récapitulatif détaillé sera affiché ici.
                            </p>
                        </div>
                    )}

                    {/* Navigation des étapes */}
                    <div className="flex items-center justify-between gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={goToPrevious}
                            disabled={currentStep === 0}
                        >
                            Étape précédente
                        </Button>

                        <div className="flex gap-3">
                            {!isLastStep ? (
                                <Button type="button" onClick={goToNext}>
                                    Étape suivante
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleSaveDraft}
                                    >
                                        Enregistrer le brouillon
                                    </Button>
                                    <Button type="submit">Publier l’annonce</Button>
                                </>
                            )}
                        </div>
                    </div>
                </form>
            </Card>

            <SellSuccessDialog
                open={openDialog}
                onOpenChange={setOpenDialog}
                mode={mode ?? "publish"}
            />
        </>
    );
}